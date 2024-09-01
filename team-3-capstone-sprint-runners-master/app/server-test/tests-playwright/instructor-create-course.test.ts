// create-course.test.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const baseURL = 'http://localhost:3001';

// Login information comes from the database
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'scott.faz@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Create Course Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the create course page before each test
    await page.goto(`${baseURL}/instructor/create-course`);
  });

  // test.afterEach(async ({ page }, testInfo) => {
  //   // Take a screenshot after each test
  //   const screenshotPath = path.join(__dirname, 'screenshots', `${testInfo.title}.png`);
  //   await page.screenshot({ path: screenshotPath });
  // });

  // Check that the course creation header is displayed
  test('should display the course creation header', async ({ page }) => {
    const header = page.locator('h1');
    await expect(header).toHaveText('Create Course');
  });

  // Check that the course name input field is displayed
  test('should display the course name input field', async ({ page }) => {
    const courseNameInput = page.locator('input[placeholder="Course Name"]');
    await expect(courseNameInput).toBeVisible();
  });

  // Check that the file upload input is displayed
  test('should display the file upload input', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  // Check that the create course button is displayed
  test('should display the create course button', async ({ page }) => {
    const createCourseButton = page.locator('role=button[name="Create Course"]');
    await expect(createCourseButton).toBeVisible();
  });

  // Check file upload functionality
  test('should upload a file', async ({ page }) => {
    const filePath = path.join(__dirname, '../test-files/students.csv');
    const fileInput = page.locator('input[type="file"]');
    
    // Check the file input value before uploading the file
    await fileInput.setInputFiles(filePath);
    
    // Check the file input value after uploading the file
    const fileName = await fileInput.evaluate(input => input.files![0].name);
    expect(fileName).toBe('students.csv');
  });

  // Check that the create course button triggers API call and navigation
  test('should make API call to create course and navigate to dashboard', async ({ page }) => {
    await page.route('**/api/addNew/createCourse', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ courseId: 1 }),
      });
    });

    await page.route('**/api/addNew/enrollStudents', route => {
      route.fulfill({
        status: 200,
      });
    });

    await page.fill('input[placeholder="Course Name"]', 'Test Course');

    const filePath = path.resolve(__dirname, '../test-files/students.csv');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.locator('role=button[name="Create Course"]').click();

    // Wait for the navigation and verify the URL contains the expected path
    await page.waitForNavigation();
    expect(page.url()).toContain('/instructor/course-dashboard?courseId=');
  });

  // Check for error handling when the create course API call fails
  test('should show error when create course API call fails', async ({ page }) => {
    /*
    This test is so weird. Running it in isolation with 'Show browser' on in the Playwright settings it passes.
    Running it in any other situation it times out. ??????
    */

    await page.route('**/api/addNew/createCourse', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to create course' }),
      });
    });

    await page.fill('input[placeholder="Course Name"]', 'Test Course');

    // Capture the alert dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Failed to create course, make sure to enter a course name');
      dialog.accept();
    });
  });

  // Check for error handling when the enroll students API call fails
  test('should show error when enroll students API call fails', async ({ page }) => {
    await page.route('**/api/addNew/createCourse', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ courseId: 1 }),
      });
    });

    await page.route('**/api/addNew/enrollStudents', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to enroll students' }),
      });
    });

    await page.fill('input[placeholder="Course Name"]', 'Test Course');

    const filePath = path.resolve(__dirname, '../test-files/students.csv');
    await page.setInputFiles('input[type="file"]', filePath);

    // Capture the alert dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Failed to enroll students');
      dialog.accept();
    });
  });
});
