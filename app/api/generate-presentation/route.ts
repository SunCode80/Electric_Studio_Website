import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { submission } = await request.json();

    if (!submission) {
      return NextResponse.json({ error: 'No submission data provided' }, { status: 400 });
    }

    // This calls the Anthropic API directly (you're in Claude's environment)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: generatePromptForClaude(submission),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompts');
    }

    const data = await response.json();
    const generatedText = data.content[0].text;

    // Parse the generated prompts from Claude's response
    const prompts = parseGeneratedPrompts(generatedText);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation prompts' },
      { status: 500 }
    );
  }
}

function generatePromptForClaude(submission: any): string {
  return `You are a professional presentation strategist for Electric Studio, a digital agency. 

You've received a Content Strategy Survey from a potential client. Your job is to analyze their responses and create comprehensive AI prompts for generating a personalized video presentation that will demonstrate ROI and convince them to work with Electric Studio.

CLIENT INFORMATION:
Company: ${submission.company_name}
Name: ${submission.first_name} ${submission.last_name}
Industry: ${submission.industry}
Business Description: ${submission.business_description}
Target Audience: ${submission.target_audience}
Unique Value: ${submission.unique_value}

CURRENT SITUATION:
Biggest Challenge: ${submission.biggest_challenge}
Current Marketing: ${submission.current_marketing.join(', ')}
Content Frequency: ${submission.current_content_frequency}
Monthly Budget: ${submission.monthly_marketing_budget}

GOALS:
Primary Goal: ${submission.primary_goal}
Success Metric: ${submission.success_metric}
Timeline: ${submission.timeline}

PREFERENCES:
Interested Services: ${submission.interested_services.join(', ')}
Preferred Content Types: ${submission.preferred_content_types.join(', ')}
Tone Preference: ${submission.tone_preference}

Create the following prompts in JSON format:

1. VOICEOVER_SCRIPT: A complete 3-5 minute presentation script that:
   - Opens with their specific pain point
   - Presents Electric Studio as the solution
   - Shows projected ROI specific to their industry and goals
   - Explains how our services solve their exact challenges
   - Includes compelling statistics and case study mentions
   - Ends with clear call-to-action to complete Discovery Survey
   - Uses their preferred tone: ${submission.tone_preference}

2. IMAGE_PROMPTS: Array of 5-8 image generation prompts for:
   - Hero image representing their industry
   - Problem visualization (their biggest challenge)
   - Solution visualization (Electric Studio services)
   - ROI chart/graph concepts
   - Success imagery for their goals
   - Professional brand imagery
   Each prompt should be detailed enough for Midjourney/DALL-E

3. VIDEO_PROMPTS: Array of 3-5 video generation prompts for:
   - Dynamic opening sequence
   - Service showcase animations
   - ROI projection animations
   - Client success story concepts
   Each prompt should work with Runway ML or similar

4. INFOGRAPHIC_DATA: Structured data and specifications for creating infographics showing:
   - Current state vs. future state comparison
   - ROI projections (specific numbers based on their budget and goals)
   - Service package comparison
   - Timeline to results
   Include exact numbers, percentages, and layout suggestions

5. ANIMATION_SPECS: Detailed specifications for motion graphics and transitions:
   - Intro animation style
   - Transition effects between sections
   - Text animations
   - Chart/graph animation sequences
   - Brand element animations

6. MUSIC_PROMPT: Detailed prompt for AI music generation (Suno/Udio) that matches:
   - Their brand tone (${submission.tone_preference})
   - Professional presentation style
   - Industry vibe (${submission.industry})
   - Pacing and energy level

7. ASSEMBLY_INSTRUCTIONS: Step-by-step instructions for assembling all assets into final presentation:
   - Exact timeline/sequence
   - Which assets go where
   - Transition timing
   - Voiceover sync points
   - Music cues
   - Final export settings

CRITICAL: All content must be:
- Personalized to ${submission.company_name}
- Focused on their specific challenge: ${submission.biggest_challenge}
- Demonstrate clear ROI based on their budget (${submission.monthly_marketing_budget})
- Match their tone preference: ${submission.tone_preference}
- Address their timeline: ${submission.timeline}

Respond ONLY with valid JSON in this exact format:
{
  "voiceover_script": "...",
  "image_prompts": ["prompt1", "prompt2", ...],
  "video_prompts": ["prompt1", "prompt2", ...],
  "infographic_data": "...",
  "animation_specs": "...",
  "music_prompt": "...",
  "assembly_instructions": "..."
}

DO NOT include any text outside the JSON structure.`;
}

function parseGeneratedPrompts(text: string): any {
  // Remove markdown code blocks if present
  let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.log('Attempted to parse:', cleanedText);
    throw new Error('Failed to parse generated prompts');
  }
}
