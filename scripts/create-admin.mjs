
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    console.log('Please add SUPABASE_SERVICE_ROLE_KEY=... to your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
    const email = 'admin@test.local';
    const password = 'password123';

    console.log(`Creating admin user ${email}...`);

    // 1. Create User
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (userError) {
        if (userError.message.includes('already been registered')) {
            console.log('User already exists, trying to fetch ID...');
            // We can't fetch by email easily without listUsers permission which service role has
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingUser = listData.users.find(u => u.email === email);
            if (existingUser) {
                console.log(`Found existing user ID: ${existingUser.id}`);
                await assignRole(existingUser.id);
                return;
            }
        }
        console.error('Error creating user:', userError.message);
        return;
    }

    const userId = userData.user.id;
    console.log(`User created with ID: ${userId}`);

    await assignRole(userId);
}

async function assignRole(userId) {
    // 2. Assign Role
    console.log('Assigning admin role...');
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

    if (roleError) {
        console.error('Error assigning role:', roleError.message);
        return;
    }

    console.log('Admin role assigned successfully.');
}

createAdmin().catch(console.error);
