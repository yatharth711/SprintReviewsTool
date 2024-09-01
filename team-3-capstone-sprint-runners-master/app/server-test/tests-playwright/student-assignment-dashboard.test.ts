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

test.describe('Student Assignment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(`${baseURL}/student/assignment-dashboard?assignmentID=1`);
  });

  test('should display the assignment title and details', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const pageTitle = await page.locator('h1').innerText();
    expect(pageTitle).toContain('Assignment 1');

    await expect(page.locator('text=Description for assignment 1')).toBeVisible();
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/student/dashboard`);

    await page.goto(`${baseURL}/student/assignment-dashboard?assignmentID=1`);
    await page.click('text=COSC 499');
    await expect(page).toHaveURL(`${baseURL}/student/course-dashboard?courseId=1`);
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
    
    // Use a more specific selector to target the submit button within the modal
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.waitFor({ state: 'visible' });
  
    await submitButton.click();
  
    await expect(page.locator('text=Assignment Submitted')).toBeVisible();
  });

  test('should display feedback section if feedback is available', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Feedback' })).toBeVisible();
    
    // Target the div with the specific class
    const feedbackCount = await page.locator('div.AssignmentDetailCard_assignmentsSection__1tRri').count();
    
    expect(feedbackCount).toBeGreaterThan(0);
  });

  test('should display comments section if comments are available', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Comments' })).toBeVisible();
    const commentCount = await page.locator('div').filter({ hasText: 'Date:' }).count();
    expect(commentCount).toBeGreaterThan(0);
  });

  test('should show resubmit button if within submission period and assignment is already submitted', async ({ page }) => {
    // Assuming the assignment is already submitted
    await expect(page.locator('text=Assignment Submitted')).toBeVisible();
    await expect(page.locator('text=Resubmit Assignment')).toBeVisible();
  });
});
