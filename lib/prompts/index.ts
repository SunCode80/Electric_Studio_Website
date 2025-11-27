import { S1SurveyData, S2PresentationData, S3VideoProductionData, S4AssemblyData } from '../types/pipeline';

export const generateS2Prompt = (s1Data: S1SurveyData): string => {
  return `You are a content strategist creating a professional client presentation based on survey data.

CLIENT SURVEY DATA:
${JSON.stringify(s1Data, null, 2)}

Create a comprehensive S2 presentation document with the following structure:

1. PROJECT OVERVIEW
   - Business name and industry
   - Target audience analysis
   - Primary objectives

2. STRATEGY RECOMMENDATIONS
   - Content pillars (3-5 main themes)
   - Recommended platforms
   - Posting frequency
   - Content mix (percentages for different content types)

3. DELIVERABLES
   - Organized by category (Website, Photography, Video, Social Media, etc.)
   - Specific items in each category
   - Timeline for each deliverable category

4. TIMELINE
   - Break into phases (Discovery, Production, Launch, Ongoing)
   - Duration for each phase
   - Key milestones

5. INVESTMENT
   - Package name
   - Total investment range
   - Breakdown by service category
   - Payment terms

6. NEXT STEPS
   - Immediate action items
   - What client needs to provide
   - Timeline for decision

Return ONLY a valid JSON object matching the S2PresentationData TypeScript interface. Do not include markdown formatting or code blocks.`;
};

export const generateS3Prompt = (s1Data: S1SurveyData, s2Data: S2PresentationData): string => {
  return `You are a video production director creating detailed video project specifications.

CLIENT SURVEY DATA:
${JSON.stringify(s1Data, null, 2)}

APPROVED STRATEGY:
${JSON.stringify(s2Data, null, 2)}

Based on the client's preferred content types and strategy, create detailed video production plans. Generate 3-5 video projects that align with their content strategy.

For each video project, include:

1. PROJECT DETAILS
   - Unique project ID
   - Title and type
   - Platform and duration
   - Objective and target audience
   - Key messages to convey

2. CREATIVE DIRECTION
   - Visual style
   - Tone and mood
   - Brand alignment

3. SHOOT REQUIREMENTS
   - Location details
   - Equipment needed
   - Talent requirements
   - Props and set dressing
   - Estimated shoot duration

4. SCRIPT OUTLINE
   - Break into scenes
   - For each scene: duration, description, dialogue, visuals, audio notes

5. POST-PRODUCTION
   - Editing requirements
   - Graphics and animations needed
   - Music and sound design
   - Color grading notes
   - Call to action

6. DELIVERY SPECIFICATIONS
   - File format
   - Resolution
   - Aspect ratio
   - Frame rate
   - Codec

7. PRODUCTION SCHEDULE
   - Pre-production tasks
   - Production phase
   - Post-production phase
   - Review and approval
   - Final delivery

Return ONLY a valid JSON object matching the S3VideoProductionData TypeScript interface. Do not include markdown formatting or code blocks.`;
};

export const generateS4Prompt = (
  s1Data: S1SurveyData,
  s2Data: S2PresentationData,
  s3Data: S3VideoProductionData
): string => {
  return `You are a production manager creating detailed assembly guides for all project deliverables.

CLIENT SURVEY DATA:
${JSON.stringify(s1Data, null, 2)}

APPROVED STRATEGY:
${JSON.stringify(s2Data, null, 2)}

VIDEO PRODUCTION PLANS:
${JSON.stringify(s3Data, null, 2)}

Create comprehensive assembly guides for all deliverables mentioned in the S2 strategy. This should include:
- Website pages
- Photography collections
- Video content
- Social media assets
- Marketing materials
- Any other deliverables from the strategy

For each deliverable, provide:

1. DELIVERABLE DETAILS
   - Unique ID
   - Name and type
   - Priority level

2. REQUIRED ASSETS
   - List all assets needed
   - Asset type (photo, video, graphic, text, etc.)
   - Description and source
   - Technical specifications

3. ASSEMBLY STEPS
   - Step-by-step instructions
   - Tools/software needed for each step
   - Estimated time per step
   - Quality checks to perform

4. TECHNICAL REQUIREMENTS
   - Software needed
   - Hardware requirements
   - Required skills/expertise

5. QUALITY STANDARDS
   - Quality criteria
   - Requirements for each criterion
   - How to verify quality

6. DELIVERY FORMAT
   - File format
   - Technical specifications
   - Naming conventions

7. PRODUCTION CHECKLIST
   - Organized by category
   - Each task with assignee, deadline, and status

Return ONLY a valid JSON object matching the S4AssemblyData TypeScript interface. Do not include markdown formatting or code blocks.`;
};

export const generateS5Prompt = (
  s1Data: S1SurveyData,
  s2Data: S2PresentationData,
  s3Data: S3VideoProductionData,
  s4Data: S4AssemblyData
): string => {
  return `You are a project director creating the master project guide that consolidates everything.

CLIENT SURVEY DATA:
${JSON.stringify(s1Data, null, 2)}

APPROVED STRATEGY (S2):
${JSON.stringify(s2Data, null, 2)}

VIDEO PRODUCTION PLANS (S3):
${JSON.stringify(s3Data, null, 2)}

ASSEMBLY GUIDES (S4):
${JSON.stringify(s4Data, null, 2)}

Create a comprehensive master guide that serves as the single source of truth for the entire project. This should include:

1. PROJECT SUMMARY
   - Client name and project name
   - Industry and objectives
   - Timeline and budget

2. CONTENT STRATEGY
   - Brand voice and tone
   - Visual identity guidelines
   - Content pillars
   - Platform-specific strategies

3. ALL DELIVERABLES
   - Organized by category
   - Each with name, description, format, specs, deadline, status

4. PRODUCTION WORKFLOW
   - Phases of production
   - Deliverables in each phase
   - Dependencies between deliverables
   - Timeline for each phase
   - Team members assigned

5. QUALITY ASSURANCE
   - QA checkpoints
   - Criteria for each checkpoint
   - Who approves
   - When checks happen

6. CLIENT COMMUNICATION
   - Key milestones requiring client communication
   - Type of communication needed
   - What deliverables to present
   - Format (email, meeting, presentation)

7. LAUNCH PLAN
   - Platform-by-platform launch strategy
   - Content to launch with
   - Schedule
   - Success metrics

8. HANDOFF PACKAGE
   - What gets delivered to client
   - Contents of each package component
   - Format and recipient

Return ONLY a valid JSON object matching the S5MasterGuide TypeScript interface. Do not include markdown formatting or code blocks.`;
};
