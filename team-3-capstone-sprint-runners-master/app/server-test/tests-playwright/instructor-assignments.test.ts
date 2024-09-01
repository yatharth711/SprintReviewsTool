import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.locator('input[type="email"]').fill('admin@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.locator('input[type="password"]').fill('password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Instructor Individual Assignment View', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Assuming assignment ID 1 and course ID 1 for testing
    await page.goto(`${baseURL}/instructor/assignments`);
  });

  test('should display assignment title in the header', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const assignmentTitle = await page.locator('h1').innerText();
    expect(assignmentTitle).not.toBe('Assignment Name- Details');
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);
  });

  test('should display assignment types checkboxes', async ({ page }) => {
    await expect(page.getByText('All Assignments', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Individual Assignments')).toBeVisible();
    await expect(page.getByLabel('Group Assignments')).toBeVisible();
    await expect(page.getByLabel('Peer Reviews')).toBeVisible();
  });

  test('should display individual assignments section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Individual Assignments' })).toBeVisible();

    const assignmentsLoaded = await page.locator('.instructor-components_outerCard__MgHD4').count();
    if (assignmentsLoaded > 0) {
      await expect(page.locator('.instructor-components_outerCard__MgHD4').first()).toBeVisible();
    } else {
      await expect(page.locator('.instructor-course-dashboard_courseCard__H73iH').filter({ hasText: 'No individual assignments found for this course' })).toBeVisible();
    }
  });

  test('should display group assignments section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Group Assignments' })).toBeVisible();

    const groupAssignmentsLoaded = await page.locator('.instructor-components_outerCard__MgHD4').count();
    if (groupAssignmentsLoaded > 0) {
      await expect(page.locator('.instructor-components_outerCard__MgHD4').first()).toBeVisible();
    } else {
      await expect(page.locator('.instructor-course-dashboard_courseCard__H73iH').filter({ hasText: 'No group assignments found for this course' })).toBeVisible();
    }
  });

  test('should display peer reviews section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Peer Reviews' })).toBeVisible();

    const peerReviewsLoaded = await page.locator('.instructor-components_outerCard__MgHD4').count();
    if (peerReviewsLoaded > 0) {
      await expect(page.locator('.instructor-components_outerCard__MgHD4').first()).toBeVisible();
    } else {
      await expect(page.locator('.instructor-course-dashboard_courseCard__H73iH').filter({ hasText: 'No peer reviews found for this course' })).toBeVisible();
    }
  });

  test('should display notifications section', async ({ page }) => {
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
    await expect(page.getByText('Dummy Notification', { exact: true })).toBeVisible();
  });

  test('should display the correct navbar based on user role', async ({ page }) => {
    // Wait for either navbar to be visible
    await page.waitForSelector('nav:has-text("Instructor"), nav:has-text("Admin")', { state: 'visible' });

    // Check for instructor navbar
    const instructorNavbar = await page.locator('nav:has-text("Instructor")').count();

    // Check for admin navbar
    const adminNavbar = await page.locator('nav:has-text("Admin")').count();

    // Ensure only one navbar is present
    expect(instructorNavbar + adminNavbar).toBe(1);
  });
});
