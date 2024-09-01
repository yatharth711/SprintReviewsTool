import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

async function loginAsStudent(page: any) {
  await page.goto(`${baseURL}/student/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.locator('input[type="email"]').fill('jane.smith@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.locator('input[type="password"]').fill('password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Student Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${baseURL}/student/profile`);
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/student/dashboard`);
  });

  test('should display user profile information', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Profile');
    await expect(page.locator('text=User Profile')).toBeVisible();
    await expect(page.locator('text=jane.smith@example.com')).toBeVisible();
    await expect(page.locator('text=Phone:')).toBeVisible();
    await expect(page.locator('text=Address:')).toBeVisible();
    await expect(page.locator('text=Date of Birth:')).toBeVisible();
  });

  test('should open edit profile modal and update user details', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")');

    await expect(page.locator('header:has-text("Edit Profile")')).toBeVisible();

    const newDetails = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phoneNumber: '555-9876',
      homeAddress: '789 Pine Street',
      dateOfBirth: '2001-03-03'
    };

    await page.fill('input[name="firstName"]', newDetails.firstName);
    await page.fill('input[name="lastName"]', newDetails.lastName);
    await page.fill('input[name="email"]', newDetails.email);
    await page.fill('input[name="phoneNumber"]', newDetails.phoneNumber);
    await page.fill('input[name="homeAddress"]', newDetails.homeAddress);
    await page.fill('input[name="dateOfBirth"]', newDetails.dateOfBirth);

    await page.route('**/api/updateTable', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('button:has-text("Save Changes")');

    await expect(page.locator('text=User Profile')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    await expect(page.locator('text=jane.doe@example.com')).toBeVisible();
    await expect(page.locator('text=Phone: 555-9876')).toBeVisible();
    await expect(page.locator('text=Address: 789 Pine Street')).toBeVisible();
    await expect(page.locator('text=Date of Birth: 2001-03-03')).toBeVisible();
  });

  test('should close edit profile modal without saving changes', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")');

    await expect(page.locator('header:has-text("Edit Profile")')).toBeVisible();

    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Doe');

    await page.click('button:has-text("Cancel")');

    await expect(page.locator('header:has-text("Edit Profile")')).not.toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible(); // Original name
  });
});
