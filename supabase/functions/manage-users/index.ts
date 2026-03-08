import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify calling user is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = req.method;
    const url = new URL(req.url);

    if (method === "GET") {
      // Get all user roles with emails
      const { data: roles, error: rolesError } = await adminClient
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch emails for each user
      const userIds = [...new Set((roles || []).map((r: { user_id: string }) => r.user_id))];
      const usersWithEmails = await Promise.all(
        userIds.map(async (uid: string) => {
          const { data } = await adminClient.auth.admin.getUserById(uid);
          return { id: uid, email: data?.user?.email || "Unbekannt" };
        })
      );

      const emailMap = Object.fromEntries(usersWithEmails.map(u => [u.id, u.email]));

      const enrichedRoles = (roles || []).map((role: { user_id: string }) => ({
        ...role,
        email: emailMap[role.user_id] || "Unbekannt",
      }));

      return new Response(JSON.stringify(enrichedRoles), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PATCH") {
      // Update user role
      const { roleId, newRole } = await req.json();
      if (!roleId || !["admin", "staff"].includes(newRole)) {
        return new Response(JSON.stringify({ error: "Invalid input" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-demotion
      const { data: targetRole } = await adminClient
        .from("user_roles")
        .select("user_id")
        .eq("id", roleId)
        .single();

      if (targetRole?.user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot change own role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await adminClient
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
