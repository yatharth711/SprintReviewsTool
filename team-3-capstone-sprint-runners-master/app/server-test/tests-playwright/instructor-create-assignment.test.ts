import { test, expect } from '@playwright/test';
import path from 'path';

const baseURL = 'http://localhost:3001';

async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Create Assignment Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/instructor/create-assignment?courseId=1`);
  });

  test('should display the create assignment form', async ({ page }) => {
    await expect(page.locator('h1:has-text("Create Assignment for")')).toBeVisible();
  });

  test('should show error message if required fields are empty', async ({ page }) => {
    await page.click('button:has-text("Create Assignment")');
    await expect(page.locator('text=Please enter the assignment title.')).toBeVisible();
  });

  test('should create an assignment successfully', async ({ page }) => {
    await page.locator('input[aria-label="Title"]').fill('Test Assignment');
    await page.locator('textarea[placeholder="Assignment Description"]').fill('This is a test assignment.');
    await page.locator('input[type="datetime-local"]').nth(0).fill('2024-07-10T10:00'); // for start date
    await page.locator('input[type="datetime-local"]').nth(1).fill('2124-07-20T10:00'); // for due date
    await page.locator('input[type="datetime-local"]').nth(2).fill('2124-07-25T10:00'); // for end date
    await page.locator('text=Text (.txt)').check();
    await page.locator('button:has-text("Create Assignment")').click();
    
    await expect(page.locator('text=Assignment created successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should toggle group assignment checkbox', async ({ page }) => {
    const checkbox = page.locator('label:has-text("Group Assignment") input[type="checkbox"]');
    await checkbox.scrollIntoViewIfNeeded();
    await checkbox.check({ force: true });
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck({ force: true });
    await expect(checkbox).not.toBeChecked();
  });

  test('should select allowed file types', async ({ page }) => {
    const pdfCheckbox = page.locator('label:has-text("PDF (.pdf)") input[type="checkbox"]');
       
    await pdfCheckbox.scrollIntoViewIfNeeded();
    await pdfCheckbox.check({ force: true });  
  
    await expect(pdfCheckbox).toBeChecked();
  });

  test('should display course name in the header', async ({ page }) => {
    await expect(page.locator('h1:has-text("Create Assignment for")')).toBeVisible();
  });

  test('should navigate using breadcrumbs', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);
    
    await page.goto(`${baseURL}/instructor/create-assignment?source=course&courseId=1`);
    
    // Select the breadcrumb span element by using a more specific selector
    await page.locator('span[data-slot="item"][role="link"]:has-text("COSC 499")').click();
    
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  });

  test('should show error for past due date', async ({ page }) => {
    await page.locator('input[aria-label="Title"]').fill('Test Assignment');
    await page.locator('textarea[placeholder="Assignment Description"]').fill('This is a test assignment.');
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] + 'T00:00';
    await page.locator('input[type="datetime-local"]').nth(1).fill(yesterday);
    await page.locator('input[type="datetime-local"]').nth(0).fill('2024-07-10T10:00'); // for start date
    await page.locator('input[type="datetime-local"]').nth(2).fill('2124-07-25T10:00'); // for end date
    await page.locator('text=Text (.txt)').check();
    await page.locator('button:has-text("Create Assignment")').click();
    
    await expect(page.locator('text=Due date or end date cannot be in the past. Please select a future date and time.')).toBeVisible();
  });
});
