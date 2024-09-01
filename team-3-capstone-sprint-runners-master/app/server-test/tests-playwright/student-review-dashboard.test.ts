import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

test.describe('Review Dashboard Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/student/login`);
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('text=Sign In');
    await page.waitForNavigation();

    // Navigate to the review dashboard page before each test
    await page.goto(`${baseURL}/student/review-dashboard?assignmentID=1`);
  });

  // Check that the review dashboard page loads correctly
  test('should load review dashboard page', async ({ page }) => {
    await expect(page).toHaveURL(`${baseURL}/student/review-dashboard?assignmentID=1`);
    await expect(page.locator('h2')).toHaveText('Reviewing Assignment: Assignment 1');
  });

  // Check that the assignment details and student submissions are displayed correctly
  test('should display assignment details and student submissions', async ({ page }) => {
    await expect(page.locator('text=Student Name: Jane Smith')).toBeVisible();
    await expect(page.locator('text=File Submission: assignment1_jane.docx')).toBeVisible();
    await expect(page.locator('text=Submission Deadline: 8/1/2124, 4:59:59 PM')).toBeVisible();
  });

  // Check that the review criteria and input fields are displayed correctly
  test('should display review criteria and input fields', async ({ page }) => {
    await expect(page.locator('span:has-text("Criterion 1")').first()).toBeVisible();
    await expect(page.locator('text=Max marks: 10').first()).toBeVisible();
    await expect(page.locator('span:has-text("Criterion 2")').first()).toBeVisible();
    await expect(page.locator('text=Max marks: 20').first()).toBeVisible();
  });

  // Check that the reviews can be submitted successfully
  test('should submit reviews successfully', async ({ page }) => {
    await page.route('**/api/reviews/submitReviews', (route: { fulfill: (arg0: { status: number; body: string; }) => void; }) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Reviews submitted successfully',
        })
      });
    });

    await page.fill('input[aria-label="Grade for Criterion 1"]', '9');
    await page.fill('input[aria-label="Grade for Criterion 2"]', '18');
    await page.fill('input[aria-label="Comments"]', 'Good job!');

    await page.click('button:has-text("Submit All Reviews")');
    await expect(page.locator('text=Reviews submitted successfully')).toBeVisible();
  });

  // Check that the pagination works correctly
  test('should navigate between submissions using pagination', async ({ page }) => {
    // Click on the pagination button for page 2
    await page.locator('li[role="button"][aria-label="pagination item 2"]').click();
    
    // Check that the correct student submission is displayed
    await expect(page.locator('text=Student Name: Karen Miller')).toBeVisible();
    await expect(page.locator('text=File Submission: project_123468.sql')).toBeVisible();
    await expect(page.locator('text=Submission Deadline: 8/1/2124, 4:59:59 PM')).toBeVisible();
  });

  // Check that the download button works
  test('should download submitted file', async ({ page }) => {
    await page.click('text=Download Submitted File');
    // Add assertion to check file download
  });
  
  // Check that the breadcrumbs work
  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/student/dashboard`);

    await page.goto(`${baseURL}/student/review-dashboard?assignmentID=1`);
    await page.click('text=COSC 499');
    await expect(page).toHaveURL(`${baseURL}/student/course-dashboard?courseId=1`);
  });
});
