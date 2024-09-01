import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

async function loginAsStudent(page: any) {
  await page.goto(`${baseURL}/student/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.locator('input[type="email"]').fill('john.doe@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.locator('input[type="password"]').fill('password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Student All Assignments Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${baseURL}/student/all-assignments`);
  });

  test('should display the page title', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const pageTitle = await page.locator('h1').innerText();
    expect(pageTitle).toBe('All Assignments');
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/student/dashboard`);
  });

  test('should display assignment types checkboxes', async ({ page }) => {
    await expect(page.locator('input[aria-label="All Assignments"]')).toBeVisible();
    await expect(page.locator('input[aria-label="Individual Assignments"]')).toBeVisible();
    await expect(page.locator('input[aria-label="Group Assignments"]')).toBeVisible();
    await expect(page.locator('input[aria-label="Peer Reviews"]')).toBeVisible();
  });

  test('should display individual assignments section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Individual Assignments' })).toBeVisible();

    const individualAssignmentsLoaded = await page.locator('.student-assignment-card').count();
    if (individualAssignmentsLoaded > 0) {
      await expect(page.locator('.student-assignment-card').first()).toBeVisible();
    } else {
      await expect(page.locator('p').filter({ hasText: 'No individual assignments found.' })).toBeVisible();
    }
  });

  test('should display group assignments section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Group Assignments' })).toBeVisible();

    const groupAssignmentsLoaded = await page.locator('.student-assignment-card').count();
    if (groupAssignmentsLoaded > 0) {
      await expect(page.locator('.student-assignment-card').first()).toBeVisible();
    } else {
      await expect(page.locator('p').filter({ hasText: 'No group assignments found.' })).toBeVisible();
    }
  });

  test('should display peer reviews section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Peer Reviews' })).toBeVisible();

    const peerReviewsLoaded = await page.locator('.student-assignment-card').count();
    if (peerReviewsLoaded > 0) {
      await expect(page.locator('.student-assignment-card').first()).toBeVisible();
    } else {
      await expect(page.locator('p').filter({ hasText: 'No peer reviews found.' })).toBeVisible();
    }
  });

  test('should display notifications section', async ({ page }) => {
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
    await expect(page.getByText('Dummy Notification', { exact: true })).toBeVisible();
  });
});
