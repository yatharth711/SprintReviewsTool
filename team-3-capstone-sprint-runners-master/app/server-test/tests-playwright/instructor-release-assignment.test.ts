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

test.describe('Release Assignment for Peer Review Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Mock release assignment endpoint
    await page.route('**/api/assignments/releaseAssignment*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock release peer reviews endpoint
    await page.route('**/api/addNew/releaseRandomizedPeerReview*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Navigate to the release assignment page before each test
    await page.goto(`${baseURL}/instructor/release-assignment?source=course&courseId=1`);
  });

  // Check that breadcrumb navigation works correctly
  test('should navigate to home and back to course dashboard via breadcrumbs', async ({ page }) => {
    // Click on Home breadcrumb
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);

    // Navigate back to the assignment dashboard
    await page.goto(`${baseURL}/instructor/release-assignment?source=course&courseId=1`);
    
    // Click on course breadcrumb
    await page.click('text=COSC 499');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  });

  // Check that the release assignment page loads correctly
  test('should load release assignment page', async ({ page }) => {
    await expect(page).toHaveURL(`${baseURL}/instructor/release-assignment?source=course&courseId=1`);
    await expect(page.locator('h1')).toHaveText('Release Peer Review');
  });

  // Check that form validation works for empty fields
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('text=Draft Release');
    await expect(page.locator('text=Error: Invalid form data')).toBeVisible();
  });

  // Check successful submission
  test('should release assignment successfully', async ({ page }) => {
    await page.selectOption('select', '1'); // Select first assignment
    await page.fill('input[aria-label="Review Criterion"]', 'Quality');
    await page.fill('input[aria-label="Maximum Marks for Criterion"]', '10');
    await page.click('text=Anonymous Review');

    const currentDate = new Date().toISOString().slice(0, 16);

    await page.locator('input[type="datetime-local"]').nth(0).fill(currentDate); // Start date
    await page.locator('input[type="datetime-local"]').nth(1).fill('2124-07-20T10:00'); // Due date
    await page.locator('input[type="datetime-local"]').nth(2).fill('2124-07-25T10:00'); // End date

    await page.click('text=Draft Release');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`, { timeout: 15000 });
    await expect(page.locator('text=Assignment created successfully!')).toBeVisible();
  });

  // Check that the back button works
  test('should navigate back to the course dashboard', async ({ page }) => {
    await page.click('text=Course Dashboard');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  });
});
