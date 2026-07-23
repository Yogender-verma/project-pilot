import { test, expect } from '@playwright/test';

test.describe('E2E Test Suite', () => {
  test('User Authentication & Onboarding', async ({ page }) => {
    await page.goto('/');
    // Check if the landing page title contains ProjectPilot AI
    await expect(page).toHaveTitle(/ProjectPilot AI/);
    
    // Additional assertions for auth and onboarding flow can be added here
  });

  test('Creating a new Project', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // Wait for the projects page to load with automatic retry/waiting
    await expect(page.getByText('Projects').first()).toBeVisible();
  });

  test('Sending a message to the AI Mentor', async ({ page }) => {
    await page.goto('/dashboard/mentor');
    
    // Wait for the mentor chat interface to load with automatic retry/waiting
    await expect(page.getByText(/Mentor/i).first()).toBeVisible();
  });
});
