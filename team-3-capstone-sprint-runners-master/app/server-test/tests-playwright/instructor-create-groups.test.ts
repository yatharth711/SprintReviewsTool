// create-group.test.ts
import { test, expect } from '@playwright/test';

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

test.describe('Create Group Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/instructor/create-groups?source=course&courseId=1`);
  });

  test('should display create groups header', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const headerText = await page.locator('h1').innerText();
    expect(headerText).toBe('Create Groups');
  });

  test('should have working breadcrumb navigation', async ({ page }) => {
    await page.click('text=Home');
    await expect(page).toHaveURL(`${baseURL}/instructor/dashboard`);
  });

  test('should display list of students', async ({ page }) => {
    await expect(page.locator('h2:has-text("All Students")')).toBeVisible();
  
    // Wait for the students listbox to load
    await page.waitForSelector('ul[role="listbox"]', { state: 'attached' });
  
    // Check if students are loaded or "No students available" message is displayed
    const studentsLoaded = await page.locator('ul[role="listbox"] li').count();
    if (studentsLoaded > 0) {
      await expect(page.locator('ul[role="listbox"] li').first()).toBeVisible();
    } else {
      await expect(page.getByText('No students available', { exact: true })).toBeVisible();
    }
  });
  
  test('should display list of groups', async ({ page }) => {
    await expect(page.locator('h2:has-text("Groups")')).toBeVisible();
  
    // Wait for groups to load
    await page.waitForSelector('div.instructor-course-dashboard_outerCard___bOt1', { state: 'attached' });
  
    // Check if groups are loaded or "No groups available" message is displayed
    const groupsLoaded = await page.locator('div.instructor-course-dashboard_outerCard___bOt1 div[data-orientation="vertical"]').count();
    if (groupsLoaded > 0) {
      await expect(page.locator('div.instructor-course-dashboard_outerCard___bOt1 div[data-orientation="vertical"]').first()).toBeVisible();
    } else {
      await expect(page.getByText('No groups available', { exact: true })).toBeVisible();
    }
  });
  
  test('should open and close randomize groups modal', async ({ page }) => {
    // Click the button to open the randomize groups modal
    await page.click('text=Randomize Groups');
    
    // Verify that the modal header is visible
    await expect(page.locator('header:text("Randomize Groups")')).toBeVisible();
  
    // Fill in the group size input
    await page.fill('input[type="number"]', '3');
    await expect(page.locator('input[type="number"]')).toHaveValue('3');
  
    // Close the modal
    await page.click('button:text("Close")');
    
    // Verify that the modal is no longer visible
    await expect(page.locator('header:text("Randomize Groups")')).not.toBeVisible();
  });
  
  test('should open and close edit groups modal', async ({ page }) => {
    // Click the button to open the edit groups modal
    await page.click('button:has-text("Edit groups")');
    
    // Verify that the modal header is visible
    await expect(page.locator('header:has-text("Edit Groups")')).toBeVisible();
  
    // Close the modal
    await page.click('button:has-text("Close")');
    
    // Verify that the modal is no longer visible
    await expect(page.locator('header:has-text("Edit Groups")')).not.toBeVisible();
  });
  
  test('should open and close remove groups modal', async ({ page }) => {
    // Click the button to open the remove groups modal
    await page.click('button:has-text("Remove groups")');
    
    // Verify that the modal header is visible
    await expect(page.locator('header:has-text("Remove Groups")')).toBeVisible();
  
    // Click the cancel button to close the modal
    await page.click('button:has-text("Cancel")');
    
    // Verify that the modal header is no longer visible
    await expect(page.locator('header:has-text("Remove Groups")')).not.toBeVisible();
  });

  test('should display the correct navbar based on user role', async ({ page }) => {
    // Wait for either navbar to be visible
    await page.waitForSelector('nav:has-text("Instructor"), nav:has-text("Admin")', { state: 'visible' });

    // Check for instructor navbar
    const instructorNavbar = await page.locator('nav:has-text("Instructor")').count();

    // Check for admin navbar
    const adminNavbar = await page.locator('nav:has-text("Admin")').count();

    // Ensure only one navbar is present
    expect(instructorNavbar + adminNavbar).toBe(1);
  });

  test('should display error when creating/updating groups without randomizing', async ({ page }) => {
    // Attempt to click the button to create/update groups without randomizing
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Please randomize groups before creating/updating.');
      dialog.accept();
    });
    await page.click('text=Create/Update Groups');
  });

  test('should randomize, create, and remove groups, then navigate to course dashboard', async ({ page }) => {
    // Open the randomize groups modal
    await page.click('text=Randomize Groups');
    
    // Verify that the modal header is visible
    await expect(page.locator('header:has-text("Randomize Groups")')).toBeVisible();
  
    // Fill in the group size input
    await page.fill('input[type="number"]', '3');
    await expect(page.locator('input[type="number"]')).toHaveValue('3');
  
    // Submit the randomize groups form
    await page.click('button:has-text("Randomize")');
    
    // Wait for the modal to close
    await expect(page.locator('header:has-text("Randomize Groups")')).not.toBeVisible();

    // Ensure success message pops up
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Groups created successfully');
      dialog.accept();
    });
    // Click the button to create/update groups
    await page.click('text=Create/Update Groups');
    
    // Wait for navigation to the course dashboard
    await page.waitForNavigation();
    
    // Verify the URL is correct
    await expect(page).toHaveURL(`${baseURL}/instructor/course-dashboard?courseId=1`);
  
    // Navigate back to the create groups page
    await page.click('text=Create Student Groups');
    await expect(page).toHaveURL(`${baseURL}/instructor/create-groups?source=course&courseId=1`);
    
    // Open the remove groups modal
    await page.click('button:has-text("Remove groups")');
    
    // Verify that the modal header is visible
    await expect(page.locator('header:has-text("Remove Groups")')).toBeVisible();
  
    // Click the cancel button to close the modal
    await page.click('button:has-text("Cancel")');
    
    // Verify that the modal is no longer visible
    await expect(page.locator('header:has-text("Remove Groups")')).not.toBeVisible();
  
    // Open the remove groups modal again
    await page.click('button:has-text("Remove groups")');
    
    // Click the confirm button to remove the groups
    await page.click('button:has-text("Confirm")');
    
    // Verify the success message pops up
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('Groups removed successfully');
      dialog.accept();
    });
    // Verify that the modal is no longer visible
    await expect(page.locator('header:has-text("Remove Groups")')).not.toBeVisible();
  
    // Verify that the groups are removed
    const groupsLoaded = await page.locator('div[data-orientation="vertical"] div[aria-label^="Group"]').count();
    expect(groupsLoaded).toBe(0);
  });   
});
