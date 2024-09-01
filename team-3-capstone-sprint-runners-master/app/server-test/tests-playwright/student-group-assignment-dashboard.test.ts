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

test.describe('Group Assignment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${baseURL}/student/group-assignment-dashboard?assignmentID=2`);
  });

  test('should display the assignment title and details', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const assignmentTitle = await page.locator('h1').innerText();
    expect(assignmentTitle).toContain('Assignment 2');
  
    await expect(page.locator('text=Description for assignment 2')).toBeVisible();
  });

  test('should display group details', async ({ page }) => {
    await expect(page.locator('h3:has-text("Group Members:")')).toBeVisible({ timeout: 10000 });
    const groupMembers = await page.locator('.student-group-details_groupMember__JpuhM').count();
    expect(groupMembers).toBeGreaterThan(0);
  });

  test('should allow file submission if within submission period', async ({ page }) => {
    await page.route('**/api/assignments/submitAssignment', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Assignment submitted successfully',
          isLate: false
        })
      });
    });
  
    await expect(page.locator('text=Submit Assignment')).toBeVisible();
    await page.click('text=Submit Assignment');
    await page.setInputFiles('input[type="file"]', 'app/server-test/test-files/sampleAssignment.pdf');
    
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.waitFor({ state: 'visible' });
  
    await submitButton.click();
  
    await expect(page.locator('text=Assignment submitted successfully!')).toBeVisible();
  });

  test('should show resubmit button if within submission period and assignment is already submitted', async ({ page }) => {
    // Assuming the assignment is already submitted
    await expect(page.locator('text=Assignment Submitted')).toBeVisible();
    await expect(page.locator('text=Resubmit Assignment')).toBeVisible();
  });

  // This test is failing because it's not able to find the correct textarea to fill in the feedback
  test('should allow providing feedback for group members', async ({ page }) => {
    await expect(page.locator('h3:has-text("Group Members:")')).toBeVisible({ timeout: 10000 });
    const groupMemberCount = await page.locator('.student-group-details_groupMember__JpuhM').count();
    expect(groupMemberCount).toBeGreaterThan(0);

    for (let i = 0; i < groupMemberCount; i++) {
      const groupMember = page.locator('.student-group-details_groupMember__JpuhM').nth(i);
      await groupMember.locator('input[aria-label="Score"]').waitFor({ state: 'visible' });
      await groupMember.locator('input[aria-label="Score"]').fill('10');
      await groupMember.locator('textarea[aria-label="Additional comments"]').waitFor({ state: 'visible' });
      await groupMember.locator('textarea[aria-label="Additional comments"]').fill('Great job!');
    }

    await page.route('**/api/groups/submitGroupFeedback', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('button:has-text("Submit Feedback")');
    await expect(page.locator('text=Feedback submitted successfully.')).toBeVisible();
  });

  // This test is failing because it isn't mocking the feedback data, so it's only able to submit feedback
  test('should update feedback for group members if already submitted', async ({ page }) => {
    // Assuming feedback has been submitted and can be updated
    await page.click('button:has-text("Re-Submit Feedback")');
    await expect(page.locator('h3:has-text("Group Members:")')).toBeVisible({ timeout: 10000 });
    const groupMemberCount = await page.locator('.student-group-details_groupMember__JpuhM').count();
    expect(groupMemberCount).toBeGreaterThan(0);

    for (let i = 0; i < groupMemberCount; i++) {
      const groupMember = page.locator('.student-group-details_groupMember__JpuhM').nth(i);
      await groupMember.locator('input[aria-label="Score"]').waitFor({ state: 'visible' });
      await groupMember.locator('input[aria-label="Score"]').fill('9');
      await groupMember.locator('textarea[aria-label="Additional comments"]').waitFor({ state: 'visible' });
      await groupMember.locator('textarea[aria-label="Additional comments"]').fill('Needs improvement');
    }

    await page.route('**/api/updateTable', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('button:has-text("Re-Submit Feedback")');
    await expect(page.locator('text=Feedback updated successfully.')).toBeVisible();
  });
});
