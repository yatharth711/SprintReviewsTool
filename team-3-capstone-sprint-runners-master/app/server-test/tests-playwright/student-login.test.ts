// studentLogin.test.ts
import { test, expect } from '@playwright/test';
import playwrightConfig from '../playwright.config';

const baseURL = 'http://localhost:3001';
// playwrightConfig.use?.baseURL; // Base URL of your application


test.describe('Student Login Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the student login page before each test
    await page.goto(`${baseURL}/student/login`);
  });

  // Check that the email and password input fields are displayed
  test('should display the email and password input fields', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  // Check that the sign-in button is displayed
  test('should display the sign-in button', async ({ page }) => {
    const signInButton = page.getByText('Sign In');
    await expect(signInButton).toBeVisible();
  });

  // Check that the back icon is displayed
  test('should display the back icon', async ({ page }) => {
    const backIcon = page.locator('img[alt="Back"]');
    await expect(backIcon).toBeVisible();
  });

  // Check that the back icon redirects to the landing page
  test('should redirect to the landing page when back icon is clicked', async ({ page }) => {
    await page.locator('img[alt="Back"]').click();
    await expect(page).toHaveURL('http://localhost:3001/');
  });

  // Check that the sign-up link redirects to the registration page
  test('should redirect to the registration page when sign-up link is clicked', async ({ page }) => {
    await page.locator('text=Sign up').click();
    await expect(page).toHaveURL('http://localhost:3001/student/registration');
  });
  // Check if an error message is displayed when the sign-in attempt fails
  test('should show an alert on failed sign-in attempt', async ({ page }) => {
    await page.route('/api/auth/instructorLogin', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ message: 'Invalid email or password' }),
      });
    });

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Capture the alert dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Invalid email or password');
      dialog.accept();
    });

    await page.getByText('Sign In').click();
  });

  // Check if logging in redirects to the dashboard
  test('should redirect to the dashboard on successful sign-in attempt', async ({ page }) => {
    await page.route('/api/auth/studentLogin', route => {
      route.fulfill({
        status: 200,
      });
    });

    // Login credentials for the student account in the init.sql file, this should be adjusted when we implent a test db
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByText('Sign In').click();

    await expect(page).toHaveURL('http://localhost:3001/student/dashboard');
  });
});
