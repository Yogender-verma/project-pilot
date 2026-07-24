import { test, expect } from '@playwright/test';

test.describe('ProjectPilot Critical User Journeys', () => {
  test('should successfully load dashboard and create a new project', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=ProjectPilot')).toBeVisible();

    const addProjectButton = page.locator('button:has-text("Add Project"), button:has-text("New Project")').first();
    await addProjectButton.click();

    await page.fill('input[name="title"]', 'E2E Test Automated Project');
    await page.fill('textarea[name="description"]', 'Automated test description verifying golden path.');

    await page.click('button:has-text("Save"), button:has-text("Create Project")');
    await expect(page.locator('text=E2E Test Automated Project')).toBeVisible();
  });
});
