import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest() {
    console.log('Starting E2E Test...');
    const browser = await chromium.launch({ headless: true }); // Headless mode for reliability
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: path.join(__dirname, 'videos') }
    });
    const page = await context.newPage();

    try {
        // 1. Navigation to Login
        console.log('Navigating to /admin/login...');
        await page.goto('http://localhost:8080/admin/login');
        await page.screenshot({ path: path.join(__dirname, '01_login_page.png') });

        // 2. Perform Login
        console.log('Attempting login with admin@test.local...');
        await page.fill('input[type="email"]', 'admin@test.local');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for navigation or error
        try {
            await page.waitForURL('**/admin', { timeout: 5000 });
            console.log('Login successful! Redirected to /admin');
            await page.screenshot({ path: path.join(__dirname, '02_admin_dashboard.png') });
        } catch (e) {
            console.log('Login failed or timed out. Checking for error messages...');
            await page.screenshot({ path: path.join(__dirname, '02_login_failed.png') });
            // Don't stop here, maybe we are still on login but can see error
        }

        // 3. Test Menu Editing (Navigate directly if login failed, just to see protected route behavior)
        console.log('Navigating to /admin/menu...');
        await page.goto('http://localhost:8080/admin/menu');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(__dirname, '03_admin_menu.png') });

        // 4. Test User Management
        console.log('Navigating to /admin/users...');
        await page.goto('http://localhost:8080/admin/users');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(__dirname, '04_admin_users.png') });

    } catch (err) {
        console.error('Test execution failed:', err);
    } finally {
        await browser.close();
        console.log('Test finished. Screenshots saved in scripts/ directory.');
    }
}

runTest();
