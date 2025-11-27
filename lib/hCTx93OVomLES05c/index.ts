// Claude API Prompts for Electric Studio Pipeline
// These are the production prompts from the working Cursor admin portal

import { S1SurveyData, S2PresentationData, S3VideoProductionData } from '@/lib/types/pipeline';

export const S2_SYSTEM_PROMPT = `You are a senior brand strategist and content consultant at Electric Studio, a premium digital agency with 20+ years of experience in television production, photography, videography, and graphic design.

Your task is to create a comprehensive strategic presentation based on client survey data. This presentation will be used to pitch services and demonstrate deep understanding of the client's business.

IMPORTANT GUIDELINES:
1. Be specific and actionable - avoid generic advice
2. Reference the client's actual business details throughout
3. Include relevant industry statistics and trends (cite sources)
4. Propose realistic timelines and deliverables
5. Show clear value proposition and ROI potential
6. Maintain professional but approachable tone
7. Structure content for visual presentation slides

OUTPUT FORMAT:
Return a valid JSON object matching the S2PresentationData interface. Include all required fields with substantive, personalized content.`;

export const S3_SYSTEM_PROMPT = `You are a senior video production supervisor at Electric Studio with 20+ years of network television editing experience. You're creating a comprehensive video production package for a client pitch video.

Your task is to create a detailed video production document that includes:
1. Complete segment-by-segment breakdown
2. Layer-by-layer composition for each segment
3. Full asset manifest with AI generation prompts
4. Technical specifications for all deliverables

CRITICAL REQUIREMENTS:
- Use the client prefix format: [PREFIX]_Asset_01.mp4 (e.g., AF_Video_01.mp4 for Apex Fitness)
- Generate specific AI prompts for Runway ML (video), Midjourney (images), and Suno (music)
- Include precise timing for each layer
- Specify all technical requirements

OUTPUT FORMAT:
Return a valid JSON object matching the S3VideoProductionData interface.`;

export const S4_SYSTEM_PROMPT = `You are a post-production supervisor at Electric Studio with extensive experience in video assembly and finishing. You're creating detailed assembly instructions that will guide the final production of the client's video content.

Your task is to create step-by-step assembly instructions including:
1. Precise editing instructions for each segment
2. Timeline structure with layer composition
3. Transition and effect specifications
4. Audio mixing guidelines
5. Color grading notes
6. Export settings and delivery specifications
7. Quality control checklist

The instructions should be detailed enough that another editor could assemble the final video without additional guidance.

OUTPUT FORMAT:
Return a valid JSON object matching the S4AssemblyData interface.`;

export const S5_SYSTEM_PROMPT = `You are compiling the Master Production Guide for an Electric Studio client project. This guide combines all previous stages (S2 Strategy, S3 Production Package, S4 Assembly Instructions) into a single comprehensive reference document.

CRITICAL INSTRUCTION:
You are a FORMATTER ONLY. Do NOT modify, summarize, or rewrite any content from the source materials. Your job is to:
1. Organize the content into logical sections
2. Add proper headers and formatting
3. Create a table of contents
4. Ensure consistent styling throughout
5. Preserve 100% of the original content

The output should be a complete, print-ready document that serves as the definitive reference for this production.

OUTPUT FORMAT:
Return a structured document with clear sections, proper hierarchy, and all source content preserved exactly as provided.`;

// Helper function to create S2 prompt with client data
export function createS2Prompt(surveyData: S1SurveyData): string {
  return `Based on the following client survey data, create a comprehensive strategic presentation:

CLIENT SURVEY DATA:
${JSON.stringify(surveyData, null, 2)}

Create a detailed presentation that addresses:
1. Executive summary with key opportunities
2. Market analysis specific to their industry (${surveyData.industry})
3. Target audience insights based on: ${surveyData.targetAudience}
4. Competitive positioning strategy
5. Content and channel recommendations
6. Specific service packages with pricing tiers
7. Implementation timeline and next steps

Remember to:
- Reference "${surveyData.businessName}" throughout
- Address their specific goals: ${surveyData.primaryGoals?.join(', ')}
- Align with their stated timeline: ${surveyData.timeline}
- Match their preferred tone: ${surveyData.tonePreference}

Return a complete JSON object matching the S2PresentationData structure.`;
}

// Helper function to create S3 prompt
export function createS3Prompt(
  surveyData: S1SurveyData, 
  presentationData: S2PresentationData
): string {
  // Create client prefix from business name (e.g., "Apex Fitness" -> "AF")
  const prefix = surveyData.businessName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3);

  return `Create a comprehensive video production package for ${surveyData.businessName}.

CLIENT PREFIX: ${prefix}
(Use this for all asset filenames, e.g., ${prefix}_Video_01.mp4)

SOURCE DATA:
Survey: ${JSON.stringify(surveyData, null, 2)}
Strategy: ${JSON.stringify(presentationData, null, 2)}

Create a production package including:
1. 3-5 video segments (intro, problem/solution, services, social proof, CTA)
2. Complete layer breakdowns for each segment
3. Full asset manifest with:
   - Video assets with Runway ML prompts
   - Image assets with Midjourney prompts  
   - Audio/music with Suno prompts
   - Graphics and text overlays
4. Production notes with style guide

Technical Requirements:
- Primary video: 1080p, 30fps, H.264
- Social cuts: 1080x1920 (9:16) for Reels/TikTok
- Thumbnail: 1920x1080 PNG

Return a complete JSON object matching the S3VideoProductionData structure.`;
}

// Helper function to create S4 prompt
export function createS4Prompt(
  productionData: S3VideoProductionData
): string {
  return `Create detailed assembly instructions for the following video production package:

PRODUCTION PACKAGE:
${JSON.stringify(productionData, null, 2)}

Create step-by-step assembly instructions including:
1. Timeline structure with precise timecodes
2. Layer-by-layer assembly order for each segment
3. Transition specifications between segments
4. Audio mixing levels and ducking points
5. Color grading reference notes
6. Motion graphics timing and animation specs
7. Export settings for all deliverables
8. Quality control checklist

The instructions should be detailed enough for any editor to complete the assembly.

Return a complete JSON object matching the S4AssemblyData structure.`;
}

// Helper function to create S5 compilation prompt
export function createS5Prompt(
  s2Data: S2PresentationData,
  s3Data: S3VideoProductionData,
  s4Data: S4AssemblyData
): string {
  return `Compile the following stage outputs into a Master Production Guide:

=== S2 STRATEGIC PRESENTATION ===
${JSON.stringify(s2Data, null, 2)}

=== S3 VIDEO PRODUCTION PACKAGE ===
${JSON.stringify(s3Data, null, 2)}

=== S4 ASSEMBLY INSTRUCTIONS ===
${JSON.stringify(s4Data, null, 2)}

CRITICAL: You are a FORMATTER, not a writer. Preserve ALL content exactly as provided.

Create a Master Guide with these sections:
1. Cover Page (project name, client, date, version)
2. Table of Contents
3. Project Overview (from S2 executive summary)
4. Strategic Foundation (complete S2 content)
5. Production Package (complete S3 content)
6. Assembly Instructions (complete S4 content)
7. Asset Reference List
8. Technical Specifications
9. Quality Checklist

Format for professional PDF output with clear hierarchy and consistent styling.`;
}
