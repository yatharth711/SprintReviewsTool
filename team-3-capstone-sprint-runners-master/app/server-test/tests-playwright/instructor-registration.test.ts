import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Function to mock API responses
async function mockAPIResponses(page: any) {
  await page.route('**/api/addNew/addInstructor', (route: { fulfill: (arg0: { status: number; body: string; }) => void; }) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true })
    });
  });

  await page.route('**/api/emails/sendEmailConfirmation', (route: { fulfill: (arg0: { status: number; body: string; }) => void; }) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true })
    });
  });
}

test.describe('Instructor Registration Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the instructor registration page before each test
    await page.goto(`${baseURL}/instructor/registration`);
  });

  // Check that the registration page loads correctly
  test('should load registration page', async ({ page }) => {
    await expect(page).toHaveURL(`${baseURL}/instructor/registration`);
    await expect(page.locator('h2')).toHaveText('Create Account');
  });

  // Check that form validation works for empty fields
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page.locator('text=First name cannot be empty')).toBeVisible();
    await expect(page.locator('text=Last name cannot be empty')).toBeVisible();
    await expect(page.locator('text=Instructor ID cannot be empty')).toBeVisible();
    await expect(page.locator('text=Invalid email')).toBeVisible();
    await expect(page.locator('text=Password must be minimum 8 characters, include one capital, one lowercase, and one special character')).toBeVisible();
  });

  // Check that email validation works
  test('should show email validation error', async ({ page }) => {
    await page.fill('input[aria-label="Email"]', 'invalid-email');
    await page.click('text=Sign Up');
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  // Check that password validation works
  test('should show password validation error', async ({ page }) => {
    await page.fill('input[aria-label="Password"]', 'short');
    await page.fill('input[aria-label="Confirm Password"]', 'short');
    await page.click('text=Sign Up');
    await expect(page.locator('text=Password must be minimum 8 characters, include one capital, one lowercase, and one special character')).toBeVisible();
  });

  // Check that passwords match validation works
  test('should show password match error', async ({ page }) => {
    await page.fill('input[aria-label="Password"]', 'Validpassword1!');
    await page.fill('input[aria-label="Confirm Password"]', 'Differentpassword1!');
    await page.click('text=Sign Up');
    await expect(page.locator('text=Password and confirm password do not match')).toBeVisible();
  });

  // Check successful registration
  test('should register successfully', async ({ page }) => {
    // Mock the API responses
    await mockAPIResponses(page);

    await page.fill('input[aria-label="First Name"]', 'John');
    await page.fill('input[aria-label="Last Name"]', 'Doe');
    await page.fill('input[aria-label="Instructor ID"]', '12345');
    await page.fill('input[aria-label="Email"]', 'john.doe@example.com');
    await page.fill('input[aria-label="Password"]', 'Validpassword1!');
    await page.fill('input[aria-label="Confirm Password"]', 'Validpassword1!');
    
    await page.click('text=Sign Up');
    await page.waitForNavigation();
    await expect(page).toHaveURL(`${baseURL}/instructor/login`);
    await expect(page.locator('text=Account created! Please sign in to continue.')).toBeVisible();
  });

  // Check that the back button works
  test('should navigate back to the landing page', async ({ page }) => {
    await page.click('img[alt="Back"]');
    await expect(page).toHaveURL(`${baseURL}/`);
  });

  // Check that the sign in button works
  test('should navigate to the login page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL(`${baseURL}/instructor/login`);
  });
});
