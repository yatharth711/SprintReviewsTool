// studentDashboard.test.ts
import { test, expect, Page } from '@playwright/test';
import path from 'path';

const baseURL = 'http://localhost:3001';

// Login function to perform login before tests
async function login(page: any) {
  await page.goto(`${baseURL}/student/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'john.doe@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}


test.describe('Student Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Navigate to the student dashboard page before each test
    await page.goto(`${baseURL}/student/dashboard`);
  });

  // Check that the student navbar is displayed
  test('should display the student navbar', async ({ page }) => {
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
  });

  // Check that the dashboard heading is displayed
  test('should display the dashboard heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Dashboard');
  });

  // Check that the course cards are displayed
  test('should display course cards', async ({ page }) => {
    // Wait for the courses to load and be displayed
    await page.waitForSelector('.student-dashboard_courseCard__Dx_wy', { state: 'attached' });
  
    const courseCards = page.locator('.student-dashboard_courseCard__Dx_wy');
    await expect(courseCards).toHaveCount(2);
  
    // Using more specific locator to identify the course card with 'COSC 499'
    const course499Card = courseCards.locator('b', { hasText: 'COSC 499' });
    await expect(course499Card).toHaveCount(1);
  
    // Validate the exact text of the identified course card
    await expect(course499Card).toHaveText('COSC 499');
  });
  

  // Check that clicking a course card navigates to the course details page
  test('should navigate to course details page when course card is clicked', async ({ page }) => {
    await page.waitForSelector('.student-dashboard_courseCard__Dx_wy', { state: 'attached' });

    const courseCard = page.locator('.student-dashboard_courseCard__Dx_wy').first();
    await courseCard.click();
    await expect(page).toHaveURL(`${baseURL}/student/course-dashboard?courseId=1`);
  });
});
