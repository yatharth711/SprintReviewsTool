import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Login function to obtain a valid session
async function login(page: any) {
  await page.goto(`${baseURL}/instructor/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Review Dashboard Page', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login before each test to obtain a valid session
    await login(page);

    // Mock API responses
    await page.route('**/api/getCourse4Instructor*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          courses: {
            courseID: 1,
            courseName: 'COSC 310'
          }
        })
      });
    });

    await page.route('**/api/courses/*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          courseID: 1,
          courseName: 'COSC 310'
        })
      });
    });

    await page.route('**/api/reviews/*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          reviewID: 1,
          assignmentID: 1,
          assignmentName: 'Assignment 1',
          isGroupAssignment: false,
          allowedFileTypes: 'pdf,docx',
          startDate: '2024-07-01 00:00:00',
          endDate: '2024-08-01 00:00:00',
          deadline: '2024-08-01 23:59:59',
          reviewCriteria: [
            { criteriaID: 1, criterion: 'Criterion 1', maxMarks: 10 },
            { criteriaID: 2, criterion: 'Criterion 2', maxMarks: 20 }
          ]
        })
      });
    });

    await page.route('**/api/groups/*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          groups: [
            {
              reviewee: { studentID: 1001, firstName: 'John', lastName: 'Doe' },
              reviewers: [
                { studentID: 1002, firstName: 'Jane', lastName: 'Smith' },
                { studentID: 123467, firstName: 'Nancy', lastName: 'Green' }
              ]
            },
            {
              reviewee: { studentID: 1002, firstName: 'Jane', lastName: 'Smith' },
              reviewers: [
                { studentID: 1001, firstName: 'John', lastName: 'Doe' },
                { studentID: 123468, firstName: 'Oscar', lastName: 'King' }
              ]
            }
          ]
        })
      });
    });

    // Navigate to the review dashboard page before each test
    await page.goto(`${baseURL}/instructor/peer-review-dashboard?reviewID=1`);
  });

  // Check that the review details are displayed correctly
  test('should display review details', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Review For Assignment 1');
    await expect(page.locator('text=Assignment: Assignment 1')).toBeVisible();
    await expect(page.locator('text=Deadline: 8/1/2024, 11:59:59 PM')).toBeVisible();
    await expect(page.locator('text=Start Date: 7/1/2024, 12:00:00 AM')).toBeVisible();
    await expect(page.locator('text=End Date: 8/1/2024, 12:00:00 AM')).toBeVisible();
  });

  // Check that the total review groups are displayed correctly
  test('should display total review groups', async ({ page }) => {
    await expect(page.locator('text=Total Review Groups: 2')).toBeVisible();
  });

  // Check that the randomize review groups button works
  test('should open randomize review groups modal', async ({ page }) => {
    await page.click('text=Randomize Review Groups');
    await expect(page.locator('text=Re-randomize Review Groups')).toBeVisible();
  });

  // Check that the edit review dates button works
  test('should open edit review dates modal', async ({ page }) => {
    await page.click('text=Edit Review Dates');
    await expect(page.locator('text=Edit Assignment Details')).toBeVisible();
  });

  // Check that the edit groups button works
  test('should open edit groups modal', async ({ page }) => {
    await page.click('text=Edit Groups');
    await expect(page.locator('header.flex:has-text("Edit Groups")')).toBeVisible();
  });

  // Mock the API call for releasing assignment for reviews
  test('should release assignment for reviews', async ({ page }) => {
    await page.route('**/api/reviews/releaseReviews', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Review Released successfully!' })
      });
    });

    await page.click('text=Release Assignment for Reviews');
    await expect(page.locator('text=Review Released successfully!')).toBeVisible();
  });
});
