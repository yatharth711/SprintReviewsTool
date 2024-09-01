import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

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

test.describe('Manage Students Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the manage students page before each test
    await page.goto(`${baseURL}/instructor/manage-students?courseId=2`);
  });

  // Check that students are displayed after loading
  test('should display students after loading', async ({ page }) => {
    const student = page.getByText('Jane Smith', { exact: true });
    await expect(student).toBeVisible();
  });

  // Check that enrolling a new student individually, and removing them works
  test('should enroll and remove a new student', async ({ page }) => {
    // Click on 'Enroll Individual Student'
    await page.click('text=Enroll Individual Student');
    
    // Fill the student ID
    await page.fill('input[type="number"]', '123476');

    // Click the correct enroll button within the modal
    await page.getByRole('button', { name: 'Enroll' }).click({ force: true });

    // Verify that the student is enrolled successfully
    await expect(page.getByText('Uma Taylor', { exact: true })).toBeVisible();

    // Click on 'Remove Student'
    await page.click('text=Remove Student');

    // Select the student we just added
    const studentToRemove = page.getByLabel('Remove Student').getByText('Uma Taylor', { exact: true });
    await studentToRemove.click();

    // Click the correct remove button within the modal
    await page.getByRole('button', { name: 'Remove' }).click({ force: true });
    
    await page.waitForTimeout(100); // Adding a delay to allow the student to be removed

    // Ensure the student is removed successfully, and success message is displayed
    await expect(page.getByText('Student removed successfully')).toBeVisible();
    await expect(page.getByText('Uma Taylor', { exact: true })).not.toBeVisible();
  });

  // Check that enrolling a student that's already enrolled fails
  test('should display error message on duplicate enrollment', async ({ page }) => {
    // Click on 'Enroll Individual Student'
    await page.click('text=Enroll Individual Student');
    
    // Fill the student ID
    await page.fill('input[type="number"]', '1002');

    // Ensure error message is displayed when trying to enroll a student that's already enrolled
    await page.getByRole('button', { name: 'Enroll' }).click({ force: true });

    // Verify that the student is enrolled successfully
    await expect(page.getByText('Student 1002 is already enrolled in course 2')).toBeVisible();
  });

  // Check that enrolling a new student individually works
  test('should display error message when enrolling non-existent student', async ({ page }) => {
    // Click on 'Enroll Individual Student'
    await page.click('text=Enroll Individual Student');
    
    // Fill the student ID
    await page.fill('input[type="number"]', '9999');

    // Click the correct enroll button within the modal
    await page.getByRole('button', { name: 'Enroll' }).click({ force: true });

    // Ensure error message is displayed when trying to enroll a student that doesn't exist
    await expect(page.getByText("Student 9999 does not exist in the database")).toBeVisible();
  });

  // Check that enrolling students from CSV works
  test('should enroll students from CSV', async ({ page }) => {
    await page.click('text=Enroll Students from CSV');
    const filePath = path.join(__dirname, '../test-files/students.csv');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.waitForTimeout(500); // Adding a delay to allow the file to be uploaded

    // Click the correct enroll button within the modal
    await page.getByRole('button', { name: 'Enroll' }).click({ force: true });
    
    await expect(page.getByText('Students enrolled successfully')).toBeVisible();
    await expect(page.getByText('John Doe', { exact: true })).toBeVisible();

    // Check for the missing students CSV file
    const missingStudentsFilePath = path.join(__dirname, '../../public/course2_missingStudents.csv');
    const fileExists = fs.existsSync(missingStudentsFilePath);
    expect(fileExists).toBeTruthy();
    console.log('missing_students.csv file exists:', fileExists);

    // Delete the missing_students.csv file if it exists
    if (fileExists) {
      fs.unlinkSync(missingStudentsFilePath);
      console.log('Deleted missing_students.csv file.');
    }

    // Remove the student that was just added, to avoid issues with other tests
    await page.click('text=Remove Student');
    const studentToRemove = page.getByLabel('Remove Student').getByText('John Doe', { exact: true });
    await studentToRemove.click();
    await page.getByRole('button', { name: 'Remove' }).click({ force: true });
  });

  // Mock an error response for fetching students
  test('should display error message on failed students fetch', async ({ page }) => {
    await page.route('**/api/courses/getCourseList?courseID=2', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Failed to fetch students' })
      });
    });

    // Reload the page to trigger the error
    await page.reload();

    // No students should be displayed
    await expect(page.getByText('No students available')).toBeVisible();
  });

  // Check that the breadcrumb navigation works
  test('should navigate to home and back to course dashboard via breadcrumbs', async ({ page }) => {
    await page.click('text=Home', { force: true });
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);

    await page.click('text=COSC 310', { force: true });
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=2`);
  });
});
