import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Login function to obtain a valid session
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('User Profile Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Mock API responses
    await page.route('**/api/userInfo/instructor-user-details*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          userID: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          instructorID: '1001'
        })
      });
    });

    // Navigate to the user profile page before each test
    await page.goto(`${baseURL}/instructor/profile`);
  });

  // Check that the user profile details are displayed correctly
  test('should display user profile details', async ({ page }) => {
    await expect(page.locator('text=Admin User')).toBeVisible();
    await expect(page.locator('text=admin@example.com')).toBeVisible();
    await expect(page.locator('text=Instructor ID: 1001')).toBeVisible();
  });

  // Check that the edit profile modal opens
  test('should open edit profile modal', async ({ page }) => {
    await page.click('text=Edit Profile');
    await expect(page.locator('header:has-text("Edit Profile")')).toBeVisible();
  });

  // Check that profile details can be edited
  test('should edit profile details', async ({ page }) => {
    // Mock the API response for the PUT request
    await page.route('**/api/userInfo/instructor-user-details', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          userID: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          instructorID: '1001'
        })
      });
    });

    await page.click('text=Edit Profile');
    await expect(page.locator('header:has-text("Edit Profile")')).toBeVisible();

    await page.fill('input[name="fname"]', 'Admin');
    await page.fill('input[name="lname"]', 'User');
    await page.fill('input[name="email"]', 'admin@example.com');

    await page.click('text=Save Changes');

    await expect(page.locator('text=Admin User')).toBeVisible();
    await expect(page.locator('text=admin@example.com')).toBeVisible();
    await expect(page.locator('text=Instructor ID: 1001')).toBeVisible();
  });

  // Check that cancel button works in edit profile modal
  test('should close edit profile modal on cancel', async ({ page }) => {
    await page.click('text=Edit Profile');
    await expect(page.locator('header:has-text("Edit Profile")')).toBeVisible();
    await page.click('text=Cancel');
    await expect(page.locator('header:has-text("Edit Profile")')).not.toBeVisible();
  });
});
