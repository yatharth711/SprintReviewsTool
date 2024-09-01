import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Utility function to login
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Submission Feedback Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test
    await login(page);

    // Mock the edit grade API
    await page.route('**/api/updateTable', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Navigate to the submission feedback page
    await page.goto(`${baseURL}/instructor/submission-feedback?assignmentID=1&studentID=1001`);
  });

  test('should display assignment details correctly', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Assignment 1');
    await expect(page.locator('text=Description for assignment 1')).toBeVisible();
    await expect(page.locator('text=Assignment Submitted')).toBeVisible();
    await expect(page.locator('text=Adjusted Grade: 85')).toBeVisible();
  });

  test('should display feedbacks correctly', async ({ page }) => {
    await expect(page.locator('text=Feedback 1')).toBeVisible();
    await expect(page.locator('text=Details: Great work!')).toBeVisible();
    await expect(page.locator('text=Comment: Excellent job on the project!')).toBeVisible();
    await expect(page.locator('text=Grade: 85')).toBeVisible();
  });

  test('should display comments correctly', async ({ page }) => {
    // Check for the heading "Comments"
    await expect(page.getByRole('heading', { name: 'Comments' })).toBeVisible();
    // Check for the paragraph "No comments available yet."
    const lastCommentContainer = page.locator('div').filter({ hasText: 'Comments' }).locator('div', { hasText: 'New test comment' }).last();
    await expect(await lastCommentContainer.locator('text=New test comment').count()).toBeGreaterThan(0);
  });

  // Mocking the API for this test doesn't work due to the page reloading after adding a new comment.
  // This means that this test adds a new comment directly to the database every time it's run.
  test('should allow adding a comment', async ({ page }) => {
    await page.waitForTimeout(1000); // This might be necessary if there's some delay in rendering elements
    // Fill the input field with the label "New Comment"
    await page.getByLabel('New Comment').fill('New test comment');
      
    // Click the "Add Comment" button
    await page.getByRole('button', { name: 'Add Comment' }).click();

    // Check if the new comment is visible
    await expect(page.locator('text=New test comment').first()).toBeVisible();
  });

  test('should allow editing a comment', async ({ page }) => {
    await page.waitForTimeout(1000); // This might be necessary if there's some delay in rendering elements
    // Locate the most recent comment container
    const lastCommentContainer = page.locator('div').filter({ hasText: 'Comments' }).locator('div', { hasText: 'New test comment' }).last();
    
    // Click the "Edit" button within the last comment container
    await lastCommentContainer.locator('button:has-text("Edit")').click();
    
    // Wait for the input field within the last comment container to be visible
    const inputFieldSelector = 'input[type="text"][value="New test comment"]';
    await page.waitForSelector(inputFieldSelector, { state: 'visible' });

    // Fill the input field with the new comment text
    await page.locator(inputFieldSelector).fill('Edited comment');
    await page.click('text=Save');

    // Check for success message
    await expect(page.locator('text="Comment updated successfully"')).toBeVisible();
  });


  test('should allow editing a grade', async ({ page }) => {
    await page.click('text=Edit Grade');
    await page.fill('input[type="number"]', '95');
    await page.click('text=Save');
    await expect(page.locator('text=Adjusted Grade: 95')).toBeVisible();
  });
});
