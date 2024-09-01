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

test.describe('Instructor Dashboard Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the instructor dashboard page before each test
    await page.goto(`${baseURL}/instructor/dashboard`);
  });

  // Check that the dashboard displays the courses
  test('should display courses after loading', async ({ page }) => {
    const course = page.getByText('COSC 310', { exact: true });
    await expect(course).toBeVisible();
  });

  // Check that the Create Course button navigates to the create course page
  test('should navigate to create course page', async ({ page }) => {
    await page.click('text=Create Course');
    await expect(page).toHaveURL(`${baseURL}/instructor/create-course`);
  });

  // Check that clicking the COSC 310 Course card redirects to the course dashboard
  test('should navigate to course dashboard page on clicking course card', async ({ page }) => {
    await page.click('text=COSC 310');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=2`);
  });

  // Check that the page shows a loading spinner while fetching data
  test('should display loading spinner while fetching data', async ({ page }) => {
    // Simulate a slow network response
    await page.route('**/api/getCourse4Instructor*', route => {
      setTimeout(() => route.continue(), 3000);
    });

    // Reload the page to trigger the loading state
    await page.reload();

    // Check for the loading spinner
    const spinner = page.locator('div[aria-label="Loading"] .animate-spinner-ease-spin');
    await expect(spinner).toBeVisible();
  });

  // This test is failing because the mocked error is skipping the error handling part of the code
  // Mock an error response for fetching courses
  test('should display error message on failed courses fetch', async ({ page }) => {
    await page.route('**/api/getCourse4Instructor*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to fetch courses' })
      });
    });

    // Reload the page to trigger the error
    await page.reload();

    // Check for the toast error message
    await page.waitForSelector('text=Error fetching courses');
    await expect(page.locator('text=Failed to fetch courses')).toBeVisible();
  });

  // Check that the breadcrumb navigation works
  test('should navigate to home and back to dashboard via breadcrumbs', async ({ page }) => {
    await page.click('text=Home', { force: true });
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);
  });
});
