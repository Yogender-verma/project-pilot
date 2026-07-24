'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function fetchGithubOauthAnalytics() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const client = clerkClient();
    const OauthAccessTokenResponse = await client.users.getUserOauthAccessToken(userId, 'oauth_github');
    
    const githubTokens = OauthAccessTokenResponse.data || OauthAccessTokenResponse;
    const token = Array.isArray(githubTokens) ? githubTokens[0]?.token : null;

    if (!token) {
      throw new Error("GitHub token not found. Please connect your GitHub account.");
    }

    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch GitHub profile");
    }

    const userData = await userRes.json();

    // Fetch repositories
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let repos = [];
    if (reposRes.ok) {
      repos = await reposRes.json();
    }

    let totalCommits = 0;
    const languages: Record<string, number> = {};

    // Calculate language stats from repos
    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
      // Simple heuristic for commits, real commit count per repo is expensive
      // We will just use public_repos and stars for score
    });

    const languageStats = Object.entries(languages)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        username: userData.login,
        topLanguages: languageStats.slice(0, 5).map(l => l.name),
        repositories: repos.length,
        contributions: userData.public_repos * 10, // Approximation
        overallScore: Math.min(100, (repos.length * 2) + 10),
      }
    };
  } catch (error: any) {
    console.error("GitHub Analytics Error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
