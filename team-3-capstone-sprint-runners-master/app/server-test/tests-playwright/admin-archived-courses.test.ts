// archivedCourses.test.ts
import { test, expect } from '@playwright/test';
import playwrightConfig from '../playwright.config';

const baseURL = 'http://localhost:3001';
// playwrightConfig.use?.baseURL; // Base URL of your application

// Login information comes from database, this should be adjusted when we implement a test db
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Archived Courses Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the archived courses page before each test
    await page.goto(`${baseURL}/admin/archived-courses`);
  });

  // Check that archived courses are displayed after loading
  test('should display archived courses after loading', async ({ page }) => {
    const course1 = page.getByText('COSC 100', { exact: true });
    const course2 = page.getByText('COSC 101', { exact: true });
    await expect(course1).toBeVisible();
    await expect(course2).toBeVisible();
  });

  // Check that clicking an archived course redirects to the course dashboard
  test('should redirect to course dashboard on archived course click', async ({ page }) => {
    const course1 = page.getByText('COSC 100', { exact: true });
    await course1.click();
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=3`);
  });

  // Mock an error response for fetching archived courses
  test('should display error message on failed courses fetch', async ({ page }) => {
    await page.route('**/api/courses/getAllArchivedCourses?isArchived=true', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to fetch courses' })
      });
    });

    // Reload the page to trigger the error
    await page.reload();

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Failed to fetch courses');
      await dialog.dismiss();
    });
  });

  // Check that the breadcrumbs are displayed
  test('should display breadcrumbs', async ({ page }) => {
    const adminPortalLink = page.getByRole('link', { name: 'Admin Dashboard' });
    const archivedCoursesLink = page.getByRole('link', { name: 'Archived Courses' }).first();
    await expect(adminPortalLink).toBeVisible();
    await expect(archivedCoursesLink).toBeVisible();
  });

  // Check that the AdminHeader links are displayed
  test('should display admin header links', async ({ page }) => {
    const viewUsersLink = page.locator('text=View Users');
    const joinRequestsLink = page.locator('text=Join Requests');
    const archivedCoursesLink = page.locator('text=Admin Portal');
    await expect(viewUsersLink).toBeVisible();
    await expect(joinRequestsLink).toBeVisible();
    await expect(archivedCoursesLink).toBeVisible();
  });
});
