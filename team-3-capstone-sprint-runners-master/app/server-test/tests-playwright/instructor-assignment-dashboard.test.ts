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
    await page.goto(`${baseURL}/instructor/assignment-dashboard?assignmentID=1&courseId=1`);
  });

  test('should display assignment title in the header', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const assignmentTitle = await page.locator('h1').innerText();
    expect(assignmentTitle).not.toBe('Assignment Name- Details');
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);

    // Navigate to course dashboard using breadcrumbs
    await page.click('text=COSC 499');
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  });

  test('should display AssignmentDetailCard with correct information', async ({ page }) => {
    // Check for title in the AssignmentDetailCard
    await expect(page.locator('h2.AssignmentDetailCard_assignmentTitle__cxkti')).toBeVisible();

    // Check for description
    await expect(page.locator('text="Description for assignment 1"').or(page.locator('text="New Assignment Description"'))).toBeVisible();
    
    // Check for deadline
    await expect(page.locator('text="No deadline set"').or(page.locator('text=/Deadline:/'))).toBeVisible();
  });

  test('should display submissions table with correct data', async ({ page }) => {
    // Check for the submissions table
    await expect(page.locator('table')).toBeVisible();

    // Check for table headers
    await expect(page.locator('text=Student Name')).toBeVisible();
    await expect(page.locator('text=File Name')).toBeVisible();
    await expect(page.locator('text=Submission Date')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Grade' })).toBeVisible();

    // Check for at least one submission row
    const submissionRows = await page.locator('table tbody tr').count();
    expect(submissionRows).toBeGreaterThan(0);
  });

  test('should redirect to student submission view when clicking a student name', async ({ page }) => {
    // Click John Doe's name
    await page.locator('span[data-label="true"]:has-text("John Doe")').click();

    // Check for the student submission view
    await expect(page).toHaveURL(`${baseURL}/instructor/submission-feedback?assignmentID=1&studentID=1001`);
  });

  // This test is failing due to a bug where the page will get stuck on the loading spinner when a fetch fails
  test('should handle error when assignment data fetch fails', async ({ page }) => {
    // Simulate a failed response
    await page.route('**/api/assignments/1', route => route.fulfill({ status: 500, body: 'Server error' }));
    await page.reload();
    
    // Check for error message or fallback UI
    await expect(page.locator('text=Error loading assignment data').or(page.locator('text=Assignment Name- Details'))).toBeVisible();
  });

  test('should open and close edit assignment modal', async ({ page }) => {
    // Click the Edit Assignment button
    await page.click('text=Edit Assignment');
    
    // Wait for the modal to be visible
    const modal = page.locator('section[role="dialog"][aria-labelledby]');
    await expect(modal).toBeVisible();

    // Close the modal
    await page.click('button:has-text("Close")');
    
    // Wait for the modal to be hidden
    await expect(modal).not.toBeVisible();
  });

  test('should update assignment details', async ({ page }) => {
    // Open the Edit Assignment modal
    await page.click('text=Edit Assignment');

    // Wait for the modal to be visible
    const modal = page.locator('section[role="dialog"][aria-labelledby]');
    await expect(modal).toBeVisible();

    // Fill in new assignment details
    await page.locator('input[aria-label="Enter new title"]').fill('New Assignment Title');
    await page.locator('textarea[placeholder="Assignment Description"]').fill('New Assignment Description');
    await page.locator('input[aria-label=" "][type="datetime-local"]').first().fill('2024-12-30T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').nth(1).fill('2024-12-31T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').last().fill('2025-01-01T23:59');
    
    // Submit the form
    await page.click('button:has-text("Update")');

    // Verify the updated details are displayed
    await expect(page.locator('h1')).toHaveText('New Assignment Title');
    await expect(page.locator('text=New Assignment Description')).toBeVisible();

    // Edit details back to original
    await page.click('text=Edit Assignment');
    await expect(modal).toBeVisible();
    await page.locator('input[aria-label="Enter new title"]').fill('Assignment 1');
    await page.locator('textarea[placeholder="Assignment Description"]').fill('Description for assignment 1');
    await page.locator('input[aria-label=" "][type="datetime-local"]').first().fill('2024-12-30T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').nth(1).fill('2024-12-31T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').last().fill('2025-01-01T23:59');
    await page.click('button:has-text("Update")');
    // Verify the updated details are displayed
    await expect(page.locator('h1')).toHaveText('Assignment 1');
    await expect(page.locator('text=Description for assignment 1')).toBeVisible();
  });

  test('should display error when updating assignment fails', async ({ page }) => {
    // Simulate a failed response
    await page.route('**/api/updateTable', route => route.fulfill({ status: 500, body: 'Server error' }));

    // Open the Edit Assignment modal
    await page.click('text=Edit Assignment');

    // Wait for the modal to be visible
    const modal = page.locator('section[role="dialog"][aria-labelledby]');
    await expect(modal).toBeVisible();

    // Fill in new assignment details
    await page.locator('input[aria-label="Enter new title"]').fill('New Assignment Title');
    await page.locator('textarea[placeholder="Assignment Description"]').fill('New Assignment Description');
    await page.locator('input[aria-label=" "][type="datetime-local"]').first().fill('2024-12-30T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').nth(1).fill('2024-12-31T23:59');
    await page.locator('input[aria-label=" "][type="datetime-local"]').last().fill('2025-01-01T23:59');

    // Submit the form
    await page.click('button:has-text("Update")');

    // Check for error message
    await expect(page.locator('text=Failed to update assignment')).toBeVisible();
  });
});
