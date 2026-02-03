-- Create a test user via Supabase Auth
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'd0d8c19c-3b3d-4f3d-8f3a-9c7d8e9f0a1b',
    'authenticated',
    'authenticated',
    'admin@test.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('d0d8c19c-3b3d-4f3d-8f3a-9c7d8e9f0a1b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert a test category if not exists
INSERT INTO public.menu_categories (id, name, description, sort_order)
VALUES ('c0d8c19c-3b3d-4f3d-8f3a-9c7d8e9f0a1c', 'Test Kategorie', 'Automatisch erstellt', 0)
ON CONFLICT DO NOTHING;
