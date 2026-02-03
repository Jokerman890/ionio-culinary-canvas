import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to login page...');
        await page.goto('http://localhost:8080/admin/login');
        await page.screenshot({ path: path.join(__dirname, 'login_page.png') });
        console.log('Login page screenshot saved.');

        // Attempt login with a dummy password to see the error message
        await page.fill('#email', 'admin@ionio-ganderkesee.de');
        await page.fill('#password', 'wrongpassword');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(__dirname, 'login_error.png') });
        console.log('Login error screenshot saved.');

        // Check if we can see the menu page (public part if not logged in)
        await page.goto('http://localhost:8080/admin/menu');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(__dirname, 'admin_menu_protected.png') });
        console.log('Admin menu (protected) screenshot saved.');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await browser.close();
    }
}

runTest();
