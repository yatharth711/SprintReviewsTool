// adminPortalHome.test.ts
import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

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

test.describe('Admin Portal Home Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the admin portal home page before each test
    await page.goto(`${baseURL}/admin/portal-home`);
  });

  // Check that courses are displayed after loading
  test('should display courses after loading', async ({ page }) => {
    const course1 = page.getByText('COSC 499', { exact: true });
    const course2 = page.getByText('COSC 310', { exact: true });
    await expect(course1).toBeVisible();
    await expect(course2).toBeVisible();
  });

  // Check that clicking a course redirects to the course dashboard
  test('should redirect to course dashboard on course click', async ({ page }) => {
    const course1 = page.getByText('COSC 499', { exact: true });
    await course1.click();
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  });

  // Mock an error response for fetching courses
  test('should display error message on failed courses fetch', async ({ page }) => {
    await page.route('**/api/courses/getAllArchivedCourses?isArchived=false', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to fetch courses' })
      });
    });

    // Reload the page to trigger the error
    await page.reload();

    // Capture the alert dialog
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
    ]);

    expect(dialog.message()).toBe('Failed to fetch courses');
    await dialog.accept();
  });

  // Check that the AdminHeader links are displayed
  test('should display admin header links', async ({ page }) => {
    const viewUsersLink = page.locator('text=View Users');
    const roleRequestsLink = page.locator('text=Role Requests');
    const archivedCoursesLink = page.locator('text=Archived Courses');
    await expect(viewUsersLink).toBeVisible();
    await expect(roleRequestsLink).toBeVisible();
    await expect(archivedCoursesLink).toBeVisible();
  });
});
