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

test.describe('Group Submission Feedback Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the group submission feedback page before each test
    // Assuming assignment ID 2 and student ID 1002 for testing
    await page.goto(`${baseURL}/instructor/group-submission-feedback?assignmentID=2&studentID=1002`);
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
    await page.goto(`${baseURL}/instructor/group-submission-feedback?assignmentID=2&studentID=1002`);
    
    // Click on course breadcrumb
    await page.click('text=COSC 310');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=2`);
  });

  // This test fails because of a bug where failing a fetch causes the page to load forever
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

  // Check that submission details are displayed correctly
  test('should display submission details', async ({ page }) => {
    // Check for submission status
    await expect(page.locator('text=Assignment Submitted')).toBeVisible();

    // Check for submitted file name
    await expect(page.locator('text=Submitted file: assignment2_jane.docx')).toBeVisible();
  });

  // Check that feedback details are displayed correctly
  test('should display feedback details', async ({ page }) => {
    // Check for group members and their feedback
    await expect(page.locator('text=Group: 2')).toBeVisible();
    await expect(page.locator('h3:has-text("Jane Smith")')).toBeVisible();
    await expect(page.locator('text=Nancy Green')).toBeVisible();
    await expect(page.locator('text=Oscar King')).toBeVisible();
    await expect(page.locator('text=Given Score: N/A').first()).toBeVisible();
    await expect(page.locator('text=Given Feedback: N/A').first()).toBeVisible();
  });

  // Check that editing and saving grade works correctly
  test('should edit and save grade', async ({ page }) => {
    // Click the Edit Grade button
    await page.click('text=Edit Grade');
    
    // Fill in new grade
    const input = page.locator('input[type="number"]');
    await input.fill('95');
    
    // Click Save button
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await page.waitForSelector('text=Grade updated successfully');
    await expect(page.locator('text=Grade updated successfully')).toBeVisible();

    // Verify the updated grade
    await expect(page.locator('text=Adjusted Grade: 95')).toBeVisible();
  });

    // Check that editing and saving grade works correctly
    test('editing grade for un-submitted assignment displays error', async ({ page }) => {
      // Navigate to the group submission feedback page for an unsubmitted assignment
      await page.goto(`${baseURL}/instructor/group-submission-feedback?assignmentID=2&studentID=123467`);
      
      // Click the Edit Grade button
      await page.click('text=Edit Grade');
      
      // Fill in new grade
      const input = page.locator('input[type="number"]');
      await input.fill('95');
      
      // Click Save button
      await page.click('button:has-text("Save")');
      
      // Check for success message
      await page.waitForSelector('text=Cannot update grade for an un-submitted assignment');
      await expect(page.locator('text=Cannot update grade for an un-submitted assignment')).toBeVisible();
    });
});
