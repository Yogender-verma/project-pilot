import { StateCreator } from "zustand";
import { GitHubAnalytics } from "@/types";
import { fetchGithubOauthAnalytics } from "@/app/actions/githubActions";

export interface GithubSlice {
  githubAnalytics: GitHubAnalytics;

  connectGithub: (username: string) => Promise<void>;
  disconnectGithub: () => void;
}

export const createGithubSlice =
  (MOCK_GITHUB: GitHubAnalytics): StateCreator<GithubSlice, [], [], GithubSlice> =>
  (set) => ({
    githubAnalytics: MOCK_GITHUB,

    connectGithub: async (username) => {
      try {
        // Try OAuth first
        const oauthRes = await fetchGithubOauthAnalytics();
        
        if (oauthRes.success && oauthRes.data) {
          const { data } = oauthRes;
          set((state) => ({
            githubAnalytics: {
              ...state.githubAnalytics,
              username: data.username,
              totalRepos: data.repositories,
              totalCommits: data.contributions,
              portfolioStrengthScore: data.overallScore,
              connected: true,
            },
          }));
          return;
        }

        // Fallback to public API
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`
        );

        if (!res.ok) throw new Error("Failed to fetch repositories");

        const repos = await res.json();

        if (!Array.isArray(repos))
          throw new Error("Invalid GitHub response");

        const langCounts: Record<string, number> = {};

        repos.forEach((repo: any) => {
          if (repo.language) {
            langCounts[repo.language] =
              (langCounts[repo.language] || 0) + 1;
          }
        });

        const colors: Record<string, string> = {
          TypeScript: "#3178c6",
          JavaScript: "#f1e05a",
          HTML: "#e34c26",
          CSS: "#563d7c",
          Python: "#3572A5",
          Java: "#b07219",
          Go: "#00ADD8",
          Rust: "#dea584",
          C: "#555555",
          "C++": "#f34b7d",
          Ruby: "#701516",
          PHP: "#4F5D95",
          Shell: "#89e051",
        };

        const totalLangs =
          Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;

        const languages = Object.entries(langCounts)
          .map(([name, count]) => ({
            name,
            value: Math.round((count / totalLangs) * 100),
            color: colors[name] || "#8b5cf6",
          }))
          .sort((a, b) => b.value - a.value);

        const totalStars = repos.reduce(
          (acc: number, repo: any) =>
            acc + (repo.stargazers_count || 0),
          0
        );

        const portfolioStrengthScore = Math.min(
          98,
          50 + repos.length * 2 + totalStars * 3
        );

        const consistencyScore = Math.min(
          95,
          60 + (repos.length % 5) * 8
        );

        const aiEngineerReadiness = Math.min(
          95,
          40 +
            (langCounts["Python"] || 0) * 12 +
            (langCounts["TypeScript"] || 0) * 6
        );

        const skillDetection = [
          ...new Set([
            ...Object.keys(langCounts).map(
              (l) => `${l} Development`
            ),
            "UI Architecture",
            "API Infrastructure",
            "Modern Git Workflows",
          ]),
        ].slice(0, 6);

        const recruiterInsights = [
          `Demonstrates strong capabilities in ${
            Object.keys(langCounts).slice(0, 3).join(", ") || "coding"
          } through public repositories.`,
          `Active GitHub profile @${username} with ${repos.length} repositories and ${totalStars} stars.`,
          `Primary stack focus lies in ${
            languages[0]?.name || "Fullstack"
          } systems.`,
        ];

        const growthRecommendations = [
          `Increase unit test coverage in ${
            languages[0]?.name || "TypeScript"
          } repositories.`,
          "Configure GitHub Actions CI.",
          `Improve README documentation for ${
            repos[0]?.name || "your projects"
          }.`,
        ];

        const repositoryIntelligence = repos.map((repo: any) => ({
          name: repo.name,
          description:
            repo.description || "Public GitHub repository.",
          analysis: [
            repo.description
              ? "Descriptive repository metadata"
              : "Clean code repository",
            `Main language: ${repo.language || "Unknown"}`,
            repo.fork
              ? "Forked repository"
              : "Original project",
            `Updated: ${new Date(
              repo.updated_at
            ).toLocaleDateString()}`,
          ],
          detectedSkills: [
            repo.language || "General",
            "Architecture",
            repo.fork
              ? "Collaboration"
              : "Independent Development",
          ],
          growthRecommendation: [
            `Increase testing for ${repo.language || "project"}`,
            "Improve README",
          ],
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          lang: repo.language || "Unknown",
        }));

        set((state) => ({
          githubAnalytics: {
            username,
            avatarUrl:
              repos[0]?.owner?.avatar_url ||
              state.githubAnalytics.avatarUrl,
            totalRepos: repos.length,
            totalCommits:
              repos.length * 15 + totalStars * 2,
            consistencyScore,
            portfolioStrengthScore,
            aiEngineerReadiness,
            connected: true,
            languages,
            recentCommits:
              state.githubAnalytics.recentCommits,
            skillDetection,
            growthRecommendations,
            recruiterInsights,
            repositoryIntelligence,
          },
        }));
      } catch (err) {
        console.error(err);

        set((state) => ({
          githubAnalytics: {
            ...state.githubAnalytics,
            username,
            connected: true,
          },
        }));
      }
    },

    disconnectGithub: () =>
      set((state) => ({
        githubAnalytics: {
          ...state.githubAnalytics,
          username: "",
          connected: false,
        },
      })),
  });