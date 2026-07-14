import { CareerScore, Project, User } from '@/types';
import { getCareerData } from './careerData';

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export function generateAdaptiveDashboard(user: User): {
  careerScore: CareerScore;
  projects: Project[];
  insights: string[];
} {
  const careerData = getCareerData(user.careerGoal);
  const requiredSkills = careerData.skills;
  const projectTemplates = careerData.projects;

  const userSkillsNorm = user.skills.map(normalize);

  const missingSkills: string[] = [];
  const knownSkills: string[] = [];

  for (const skill of requiredSkills) {
    if (userSkillsNorm.includes(normalize(skill))) {
      knownSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // 1. Calculate Metrics
  const totalRequired = requiredSkills.length;
  const matchCount = knownSkills.length;
  
  let overallScore = Math.max(Math.round((matchCount / totalRequired) * 100), 60);
  const resumeScore = Math.max(overallScore + 15, 50);

  const formattedMissing = missingSkills.slice(0, 5).map((skill, index) => ({
    name: skill,
    importance: (index < 3 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
    category: careerData.title
  }));

  const careerScore: CareerScore = {
    overallScore,
    frontendReadiness: Math.max(overallScore, 80),
    backendReadiness: Math.max(overallScore, 85),
    devOpsReadiness: Math.max(overallScore - 10, 50),
    resumeScore: resumeScore,
    missingSkills: formattedMissing,
    improvements: [
      `To reach Senior ${careerData.title} readiness, your immediate next focus should be: ${missingSkills[0] || 'Advanced Architecture'}.`,
      missingSkills.length > 0 ? `Avoid repeating basic concepts you already know (${knownSkills.slice(0, 2).join(', ')}). Build projects using ${missingSkills.slice(0, 2).join(' and ')}.` : 'You are fully equipped! Focus on building high-scale portfolio pieces.'
    ]
  };

  // 2. Recruiter Insights
  const insights = [
    `You already have strong ${knownSkills.slice(0, 2).join(' and ') || 'programming'} fundamentals.`,
    missingSkills.length > 0 
      ? `To become highly job-ready as a ${careerData.title}, focus next on ${missingSkills.slice(0, 3).join(', ')} and production-grade projects.` 
      : `Your profile is incredibly competitive for top-tier ${careerData.title} roles.`,
    `Skip basic tutorials. Build projects that demonstrate complex workflows to stand out to elite startups.`
  ];

  // 3. Project Generation
  const projects: Project[] = projectTemplates.map((template, idx) => {
    return {
      id: `${careerData.id}-proj-${idx}`,
      title: template.title,
      tagline: template.desc,
      description: template.desc,
      difficulty: template.difficulty,
      duration: template.difficulty === 'Beginner' ? '1 Week' : template.difficulty === 'Intermediate' ? '2-3 Weeks' : '4+ Weeks',
      resumeValue: template.resumeValue,
      careerImpact: template.careerImpact,
      skillsGained: template.focus,
      technologies: template.focus,
      recommendationReason: `Recommended to help you master ${template.focus.filter(f => !knownSkills.includes(f)).join(', ') || 'advanced architectural patterns'} in a real-world scenario.`,
      features: template.features,
      recommendedApis: ['Standard API Integration', 'Authentication Services'],
      toolsRequired: ['Git', 'VS Code', 'Docker'],
      completionTime: template.difficulty === 'Beginner' ? '10 Hours' : '30-40 Hours',
      githubPortfolioValue: template.difficulty === 'Advanced' ? 'Elite - Startup ready' : 'High',
      category: careerData.title
    };
  });

  return { careerScore, projects, insights };
}
