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

test.describe('Student Course Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${baseURL}/student/course-dashboard?courseId=1`);
  });

  test('should display course title and breadcrumb navigation', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const courseTitle = await page.locator('h1').innerText();
    expect(courseTitle).toBe('COSC 499');

    await expect(page.locator('nav')).toContainText(['Home', courseTitle]);
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/student/dashboard`);
  });

  test('should display individual assignments if selected', async ({ page }) => {
    // Select the "Individual Assignments" checkbox
    await page.locator('label:has-text("Individual Assignments")').click();
    
    // Ensure the "Individual Assignments" section is visible
    await expect(page.locator('h3:has-text("Individual Assignments")')).toBeVisible();
    
    // Count the individual assignment cards or verify no assignments message
    const individualAssignments = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (individualAssignments > 0) {
      expect(individualAssignments).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No individual assignments found for this course.')).toBeVisible();
    }
  });

  test('should display group assignments if selected', async ({ page }) => {
    // Select the "Group Assignments" checkbox
    await page.locator('label:has-text("Group Assignments")').click();
    
    // Ensure the "Group Assignments" section is visible
    await expect(page.locator('h3:has-text("Group Assignments")')).toBeVisible();
    
    // Count the group assignment cards or verify no assignments message
    const groupAssignments = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (groupAssignments > 0) {
      expect(groupAssignments).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No group assignments found for this course.')).toBeVisible();
    }
  });

  test('should display peer reviews if selected', async ({ page }) => {
    // Select the "Peer Reviews" checkbox
    await page.locator('label:has-text("Peer Reviews")').click();
    
    // Ensure the "Peer Reviews" section is visible
    await expect(page.locator('h3:has-text("Peer Reviews")')).toBeVisible();
    
    // Count the peer review cards or verify no peer reviews message
    const peerReviews = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (peerReviews > 0) {
      expect(peerReviews).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No peer reviews found for this course.')).toBeVisible();
    }
  });

  test('should filter assignments correctly when checkboxes are selected', async ({ page }) => {
    await page.locator('label:has-text("All Assignments")').click();
    const allAssignments = await page.locator('button.student-components_outerCard__V1Z_f').count();
    expect(allAssignments).toBeGreaterThan(0);

    await page.locator('label:has-text("Individual Assignments")').click();
    const individualAssignments = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (individualAssignments > 0) {
      expect(individualAssignments).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No individual assignments found for this course.')).toBeVisible();
    }

    await page.locator('label:has-text("Group Assignments")').click();
    const groupAssignments = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (groupAssignments > 0) {
      expect(groupAssignments).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No group assignments found for this course.')).toBeVisible();
    }

    await page.locator('label:has-text("Peer Reviews")').click();
    const peerReviews = await page.locator('button.student-components_outerCard__V1Z_f').count();
    if (peerReviews > 0) {
      expect(peerReviews).toBeGreaterThan(0);
    } else {
      await expect(page.locator('text=No peer reviews found for this course.')).toBeVisible();
    }
  });
});
