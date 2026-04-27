// One-shot migration function: fetches gallery files from TEST and uploads them to LIVE storage.
// Test source URL is hardcoded (public bucket). Live destination uses local Service Role key.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TEST_PROJECT = "mfhjnxzleewxzglkbjnz";
const FILES = [
  "1776862791087-7c7ae.jpeg",
  "1776862802689-ickuzy.jpeg",
  "1776862821752-pa2pm9.jpeg",
  "1776862831897-s21u8w.jpeg",
  "1776862845689-nz1keq.jpeg",
  "1776862857632-hlq5j.jpeg",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: Record<string, string> = {};

    for (const file of FILES) {
      const srcUrl = `https://${TEST_PROJECT}.supabase.co/storage/v1/object/public/gallery/${file}`;
      const res = await fetch(srcUrl);
      if (!res.ok) {
        results[file] = `FETCH_FAIL ${res.status}`;
        continue;
      }
      const blob = await res.blob();
      const { error } = await supabase.storage
        .from("gallery")
        .upload(file, blob, {
          contentType: res.headers.get("content-type") ?? "image/jpeg",
          upsert: true,
        });
      results[file] = error ? `UPLOAD_FAIL: ${error.message}` : `OK ${blob.size}b`;
    }

    return new Response(
      JSON.stringify({ ok: true, project: Deno.env.get("SUPABASE_URL"), results }, null, 2),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
