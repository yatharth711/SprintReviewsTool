// student-submit-feedback.test.ts
/*
* This test file tests the student-group-details.tsx component within the assignment-dashboard page.
* It's using API mocking to simulate the feedback submission and update, 
* that way the database isn't updated and the tests can be repeated.
*/
import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3001';

// Login information comes from the database
async function login(page: any) {
  await page.goto(`${baseURL}/student/login`);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', 'jack.black@example.com');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', 'password123');
  await page.click('text=Sign In');
  await page.waitForNavigation();
}

test.describe('Student Group Details Component', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/student/group-assignment-dashboard?assignmentID=2`);
  });

  // Test that the group header is displaying the correct group number
  test('should display group details header', async ({ page }) => {
    await page.waitForSelector('text=Group: 1');
    const headerText = await page.locator('text=Group: 1').innerText();
    expect(headerText).toBe('Group: 1');
  });

  // Test that feedback submission is working when form is filled out correctly
  test('should allow feedback submission', async ({ page }) => {
    // Mock the API response for feedback submission
    await page.route('**/api/groups/submitGroupFeedback', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Feedback submitted successfully.' })
      });
    });

    // Locate and fill the feedback form for Karen Miller
    const karenMillerElement = page.locator('text=Karen Miller').locator('..').locator('..');
    const karenMillerScoreInput = karenMillerElement.locator('input[placeholder="Score"]');
    const karenMillerCommentTextarea = karenMillerElement.locator('textarea[placeholder="Additional comments"]');
    await karenMillerScoreInput.scrollIntoViewIfNeeded();
    await karenMillerCommentTextarea.scrollIntoViewIfNeeded();
    await karenMillerScoreInput.fill('8');
    await karenMillerCommentTextarea.fill('Great work!');

    // Locate and fill the feedback form for Larry Moore
    const larryMooreElement = page.locator('text=Larry Moore').locator('..').locator('..');
    const larryMooreScoreInput = larryMooreElement.locator('input[placeholder="Score"]');
    const larryMooreCommentTextarea = larryMooreElement.locator('textarea[placeholder="Additional comments"]');
    await larryMooreScoreInput.scrollIntoViewIfNeeded();
    await larryMooreCommentTextarea.scrollIntoViewIfNeeded();
    await larryMooreScoreInput.fill('9');
    await larryMooreCommentTextarea.fill('Excellent improvement!');

    // Submit the feedback
    await page.locator('button:has-text("Submit Feedback")').click();

    // Verify the success message
    await expect(page.locator('text=Feedback submitted successfully.')).toBeVisible();
  });

  // Test correct error is displayed when feedback is incomplete
  test('should display error for incomplete feedback', async ({ page }) => {
    // Fill only the score
    await page.fill('input[placeholder="Score"]', '8');

    // Submit the feedback
    await page.click('button:text("Submit Feedback")');

    // Verify the error message
    await expect(page.locator('text=Please fill in both score and content for all group members.')).toBeVisible();
  });

  // Test that input values outside of 0-10 range (and decimals) are handled correctly
  test('should handle input values outside of 0-10 range', async ({ page }) => {
    // Locate and fill the score input for Karen Miller with a value > 10
    const karenMillerElement = page.locator('text=Karen Miller').locator('..').locator('..');
    const karenMillerScoreInput = karenMillerElement.locator('input[placeholder="Score"]');
    await karenMillerScoreInput.scrollIntoViewIfNeeded();
    await karenMillerScoreInput.fill('15');
    await expect(karenMillerScoreInput).toHaveValue('10');

    // Locate and fill the score input for Larry Moore with a value < 0
    const larryMooreElement = page.locator('text=Larry Moore').locator('..').locator('..');
    const larryMooreScoreInput = larryMooreElement.locator('input[placeholder="Score"]');
    await larryMooreScoreInput.scrollIntoViewIfNeeded();
    await larryMooreScoreInput.fill('-10');
    await expect(larryMooreScoreInput).toHaveValue('0');

    // Locate and fill the score input for Karen Miller with a decimal value
    await karenMillerScoreInput.scrollIntoViewIfNeeded();
    await karenMillerScoreInput.fill('1.5');
    await expect(karenMillerScoreInput).toHaveValue('1');
  });

  // Test that feedback can be updated after being submitted correctly
  test('should update feedback', async ({ page }) => {
    // Mock the API response for feedback submission
    await page.route('**/api/groups/submitGroupFeedback', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Feedback submitted successfully.' })
        });
    });
    // Mock the API response for feedback update
    await page.route('**/api/updateTable', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Feedback updated successfully.' })
      });
    });

    // Simulate initial submission
    // Locate and fill the feedback form for Karen Miller
    const karenMillerElement = page.locator('text=Karen Miller').locator('..').locator('..');
    const karenMillerScoreInput = karenMillerElement.locator('input[placeholder="Score"]');
    const karenMillerCommentTextarea = karenMillerElement.locator('textarea[placeholder="Additional comments"]');
    await karenMillerScoreInput.scrollIntoViewIfNeeded();
    await karenMillerCommentTextarea.scrollIntoViewIfNeeded();
    await karenMillerScoreInput.fill('8');
    await karenMillerCommentTextarea.fill('Great work!');

    // Locate and fill the feedback form for Larry Moore
    const larryMooreElement = page.locator('text=Larry Moore').locator('..').locator('..');
    const larryMooreScoreInput = larryMooreElement.locator('input[placeholder="Score"]');
    const larryMooreCommentTextarea = larryMooreElement.locator('textarea[placeholder="Additional comments"]');
    await larryMooreScoreInput.scrollIntoViewIfNeeded();
    await larryMooreCommentTextarea.scrollIntoViewIfNeeded();
    await larryMooreScoreInput.fill('9');
    await larryMooreCommentTextarea.fill('Excellent improvement!');

    // Submit the feedback
    await page.locator('button:has-text("Submit Feedback")').click();

    // Update the feedback
    // Locate and fill the feedback form for Karen Miller
    await karenMillerScoreInput.scrollIntoViewIfNeeded();
    await karenMillerCommentTextarea.scrollIntoViewIfNeeded();
    await karenMillerScoreInput.fill('9');
    await karenMillerCommentTextarea.fill('Even better work!');

    // Locate and fill the feedback form for Larry Moore
    await larryMooreScoreInput.scrollIntoViewIfNeeded();
    await larryMooreCommentTextarea.scrollIntoViewIfNeeded();
    await larryMooreScoreInput.fill('8');
    await larryMooreCommentTextarea.fill('You made it worse!');

    // Submit the feedback
    await page.locator('button:has-text("Submit Feedback")').click();

    // Submit the feedback
    await page.click('button:text("Re-Submit Feedback")');

    // Verify the success message
    await expect(page.locator('div[role="status"]:has-text("Feedback updated successfully.")').nth(1)).toBeVisible();
  });
});
