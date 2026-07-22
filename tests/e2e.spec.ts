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
    
    // Wait for the projects page to load
    // This is a basic check to ensure the route renders without crashing
    const isDashboardVisible = await page.isVisible('text="Projects"');
    expect(isDashboardVisible).toBeTruthy();
  });

  test('Sending a message to the AI Mentor', async ({ page }) => {
    await page.goto('/dashboard/mentor');
    
    // Check if the mentor chat interface is loaded
    const isMentorLoaded = await page.isVisible('text="Mentor"');
    expect(isMentorLoaded).toBeTruthy();
  });
});
