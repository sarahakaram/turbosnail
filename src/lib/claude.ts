import Anthropic from '@anthropic-ai/sdk';
import { SPECIES_LIST } from './species';

const anthropic = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

const speciesReference = SPECIES_LIST.map(
  (s) =>
    `${s.emoji} ${s.name} (${s.slug}): Processing=${s.processingStyle}, Activation=${s.activation}, Storm=${s.stormResponse}, Derailer="${s.coreDerailer}", Learning=${s.learningStyle} (${s.learningDescription}), Drivers=${s.primaryDriver}/${s.secondaryDriver}`
).join('\n');

// ─── Species Interview ───

const INTERVIEW_SYSTEM = `You are a warm, insightful leadership coach trained in the Wild Growth framework. Your job is to help a leader discover their growth pattern species through a conversational interview.

Ask 10–14 open-ended questions across three areas:
1. Processing & activation — how they think, decide, and what energizes them.
2. Storm response & derailers — how they behave under pressure and what trips them up.
3. Growth & motivation — how they prefer to learn and what outcomes feel most meaningful to them.

Listen for signals that map to the seven species:
${speciesReference}

Each species has a characteristic learning style and dual primary/secondary driver already embedded in its definition — your job is to surface which species fits, not to assess learning style or drivers separately.

Guidelines:
- Ask ONE question at a time. Wait for the user's response before asking the next.
- Be warm, direct, coach-like — not corporate, not therapy.
- Use natural language, not jargon.
- After gathering enough signal (usually 8–12 questions), tell the user you have a good sense of their pattern and that you'll share your recommendation.
- When ready to conclude, respond with EXACTLY this JSON block on its own line, wrapped in triple backticks:
\`\`\`json
{"status":"complete","primary_species":"slug","secondary_species":"slug","confidence":0.85,"learning_style":"style","primary_driver":"driver","secondary_driver":"driver","key_observations":["obs1","obs2","obs3"]}
\`\`\`
- Before the JSON, include a warm 2–3 sentence summary of what you observed.
- Do NOT output the JSON until you've asked at least 8 questions and feel confident.`;

export async function conductInterview(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: INTERVIEW_SYSTEM,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ─── Daily Ritual Generation ───

const RITUAL_SYSTEM = `You are a personalized leadership coach using the Wild Growth framework. Generate a daily ritual for the leader based on their profile.

Species reference:
${speciesReference}

Frame all content to honor their learning style:
- Academic/Structured learners get frameworks and checklists
- Experiential learners get action-first prompts
- Social learners get connection-oriented suggestions
- Exploratory learners get synthesis and curiosity prompts
- Collaborative learners get team-oriented framing
- Apprentice learners get system-observation cues

Frame coaching language around their drivers:
- Mastery → depth and craft
- Achievement → momentum and output
- Affiliation → connection and belonging
- Power → ownership and influence
- Security → stability and reliability
- Purpose → meaning and impact
- Commerce → value and returns
- Recognition → visibility and contribution
- Tradition → continuity and proven paths
- Aesthetics → beauty, creativity, elegance

Voice: Warm, direct, coach-like. Short sentences. No paragraph walls. Leaders are busy.

Return ONLY valid JSON with this structure:
{
  "time_blocks": [{"time": "9:00 AM", "label": "Block Name", "duration": "60 min", "species_note": "Brief species-aware note"}],
  "coaching_nudge": "2–3 sentences of coaching",
  "derailer_watch": "1 sentence warning",
  "morning_intention_prompt": "1 question tailored to species and driver"
}`;

export interface RitualInput {
  species: string;
  secondarySpecies: string | null;
  learningStyle: string;
  primaryDriver: string;
  secondaryDriver: string;
  chronotype: string;
  energyLevel: number;
  priorities: string[];
  teamSpecies?: string[];
  dayOfWeek: string;
  previousEvening?: string;
}

export async function generateRitual(input: RitualInput): Promise<any> {
  const prompt = `Generate a daily ritual for this leader:
- Species: ${input.species} (secondary: ${input.secondarySpecies || 'none'})
- Learning Style: ${input.learningStyle}
- Drivers: ${input.primaryDriver} / ${input.secondaryDriver}
- Chronotype: ${input.chronotype}
- Energy Level: ${input.energyLevel}/5
- Today's Priorities: ${input.priorities.join(', ') || 'not set'}
- Day: ${input.dayOfWeek}
${input.teamSpecies?.length ? `- Team Species Mix: ${input.teamSpecies.join(', ')}` : ''}
${input.previousEvening ? `- Last evening note: ${input.previousEvening}` : ''}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: RITUAL_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { error: 'Failed to parse ritual' };
  }
}

// ─── Evening Reflection ───

const EVENING_SYSTEM = `You are a warm leadership coach using the Wild Growth framework. Generate an evening reflection for the leader.

Species reference:
${speciesReference}

Return ONLY valid JSON:
{
  "reflection_questions": ["q1", "q2", "q3"],
  "closing_note": "A brief, warm 2-sentence synthesis/encouragement for the evening"
}

Voice: Warm, reflective, brief. Honor their species pattern.`;

export async function generateEveningReflection(input: {
  species: string;
  learningStyle: string;
  primaryDriver: string;
  energyMorning: number;
  priorities: string[];
  wins?: string;
  drains?: string;
}): Promise<any> {
  const prompt = `Evening reflection for:
- Species: ${input.species}, Learning: ${input.learningStyle}, Driver: ${input.primaryDriver}
- Morning energy was: ${input.energyMorning}/5
- Priorities were: ${input.priorities.join(', ') || 'not set'}
${input.wins ? `- Wins today: ${input.wins}` : ''}
${input.drains ? `- Drains today: ${input.drains}` : ''}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: EVENING_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { error: 'Failed to parse reflection' };
  }
}

// ─── Team Friction Analysis ───

const TEAM_SYSTEM = `Analyze this team's Wild Growth species mix. Each species carries an embedded learning style and dual drivers — use these to deepen the analysis.

Species reference:
${speciesReference}

Identify:
1. The 2–3 most likely friction points between specific species pairs, including any driver clashes.
2. Any processing style or learning style blind spots in the team.
3. How this team will likely behave under collective stress.
4. 3 team ritual questions that resonate across all species and driver orientations present.

Voice: Direct, insightful, practical. Short paragraphs.

Return ONLY valid JSON:
{
  "friction_pairs": [{"pair": "Species A ↔ Species B", "description": "Brief friction description"}],
  "blind_spots": ["blind spot 1", "blind spot 2"],
  "storm_prediction": "How this team responds under stress",
  "ritual_questions": ["q1", "q2", "q3"]
}`;

export async function analyzeTeamFriction(
  leaderSpecies: string,
  memberSpecies: string[]
): Promise<any> {
  const prompt = `Leader: ${leaderSpecies}
Team members: ${memberSpecies.join(', ')}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: TEAM_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { error: 'Failed to parse analysis' };
  }
}

// ─── Team Ritual Generation ───

const TEAM_RITUAL_SYSTEM = `Generate a team ritual prompt for a leadership team using the Wild Growth framework.

Species reference:
${speciesReference}

The prompt should work across all species present. Honor different processing styles and drivers.

Voice: Warm, inclusive, direct. One clear prompt the leader can use.

Return ONLY valid JSON:
{
  "prompt": "The ritual prompt/question",
  "facilitator_note": "Brief note for the leader on how to run this"
}`;

export async function generateTeamRitual(
  ritualType: string,
  leaderSpecies: string,
  memberSpecies: string[]
): Promise<any> {
  const prompt = `Generate a "${ritualType}" ritual for:
Leader: ${leaderSpecies}
Team species: ${memberSpecies.join(', ')}
Ritual type: ${ritualType}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: TEAM_RITUAL_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { error: 'Failed to parse ritual' };
  }
}
