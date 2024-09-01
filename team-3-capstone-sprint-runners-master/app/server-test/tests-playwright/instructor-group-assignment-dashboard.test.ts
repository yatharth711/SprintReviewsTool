import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Login function to obtain a valid session
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'scott.faz@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Assignment Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the assignment dashboard page before each test
    // Assuming assignment ID 1 and course ID 1 for testing
    await page.goto(`${baseURL}/instructor/group-assignment-dashboard?assignmentID=2`);
  });

  // Check that the page shows a loading spinner while fetching data
  test('should display loading spinner while fetching data', async ({ page }) => {
    // Simulate a slow network response
    await page.route('**/api/assignments/*', route => {
      setTimeout(() => route.continue(), 3000);
    });

    // Reload the page to trigger the loading state
    await page.reload();

    // Check for the loading spinner
    const spinner = page.locator('div[aria-label="Loading"] .animate-spinner-ease-spin');
    await expect(spinner).toBeVisible();
  });

  // Check that the assignment details are displayed correctly
  test('should display assignment details', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Assignment 2');
    await expect(page.locator('text=Description for assignment 2')).toBeVisible();
    await expect(page.locator('text=Deadline: 9/1/2024, 4:59:59 PM')).toBeVisible();
  });

  // Check that breadcrumb navigation works correctly
  test('should navigate to home and back to course dashboard via breadcrumbs', async ({ page }) => {
    // Click on Home breadcrumb
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);

    // Navigate back to the assignment dashboard
    await page.goto(`${baseURL}/instructor/group-assignment-dashboard?assignmentID=2`);
    
    // Click on course breadcrumb
    await page.click('text=COSC 310');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=2`);
  });

  // Mock an error response for fetching assignment data
  test('should display error message on failed assignment data fetch', async ({ page }) => {
    await page.route('**/api/assignments/*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Error fetching assignment data' })
      });
    });

    // Reload the page to trigger the error
    await page.reload();

    // Check for the toast error message
    await page.waitForSelector('text=Error fetching assignment data');
    await expect(page.locator('text=Error fetching assignment data')).toBeVisible();
  });

  // Check that submitted and remaining entities are displayed correctly
  test('should display submitted and remaining entities', async ({ page }) => {
    // Check for the heading "Submitted Groups"
    await expect(page.locator('h3:has-text("Submitted Groups")')).toBeVisible();

    // Check for at least one submitted entity
    const submittedEntities = page.locator('div:has-text("Submitted Groups")').locator('span:text("Group 2")');
    await expect(submittedEntities.first()).toBeVisible();

    // Check for the heading "Remaining Groups"
    await expect(page.locator('h3:has-text("Remaining Groups")')).toBeVisible();

    // Check for at least one remaining entity
    const remainingEntities = page.locator('div:has-text("Remaining Groups")').locator('span:text("Group 1")');
    await expect(remainingEntities.first()).toBeVisible();
  });
});
