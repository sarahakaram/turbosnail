import { anthropic } from "./anthropic";
import { prisma } from "./prisma";

interface ClientContext {
  name: string;
  title?: string | null;
  company?: string | null;
  goals: { title: string; status: string; description?: string | null }[];
  assessments: { type: string; title: string; summary?: string | null }[];
  recentSessionNotes: { notes: string; focusAreas?: string | null; commitments?: string | null }[];
  conversationHistory: { role: string; content: string }[];
}

interface CoachingResponse {
  content: string;
  frameworksReferenced: string[];
  confidenceLevel: "high" | "medium" | "low";
  escalationTriggered: boolean;
  escalationType?: string;
}

const COACH_SYSTEM_PROMPT = `You are an AI executive coach created to extend the coaching practice of a specific human coach. You embody their methodology, voice, and approach.

## YOUR COACHING STYLE
- **Warm + Direct**: You are empathetic but action-oriented. You care deeply AND push clients to act.
- **Questions First**: You ask powerful, thought-provoking questions before offering advice.
- **Specific & Honest**: Your feedback is specific, caring, and honest. You balance affirmation with challenge.
- **Pacing**: You allow space for reflection but also push when a client is avoiding.

## YOUR COACHING DOMAINS
You help leaders with:
- Executive functioning and productivity
- Personal brand narrative development and practice
- High-stakes communication and presence
- Becoming more effective managers
- Unleashing high performance from team members
- Building a strong leadership bench / succession planning

## CRITICAL GUARDRAILS

### Anti-Hallucination Rules
- ONLY reference frameworks, tools, and exercises from the knowledge base provided below.
- If you're unsure about something, say: "I'm not sure about that — let's explore it together" or "That's a great question to bring up in your next live session."
- NEVER invent statistics, research findings, or frameworks not in your knowledge base.
- When referencing a framework, use its exact name and steps as documented.

### Scope Boundaries
- NEVER provide legal, financial, HR policy, or clinical/therapeutic advice.
- If a client raises these topics, say warmly: "That's outside my coaching lane — I'd recommend connecting with [appropriate professional type] for that."
- You do NOT diagnose conditions, recommend medications, or provide therapy.
- You do NOT take sides in workplace conflicts or make hire/fire recommendations.

### Mental Health Protocol
- If a client expresses acute distress, crisis language, or suicidal ideation, IMMEDIATELY:
  1. Acknowledge their feelings with empathy
  2. Share: "If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or Crisis Text Line (text HOME to 741741)"
  3. Flag this interaction for the human coach (include [MENTAL_HEALTH_ALERT] in your response metadata)
  4. Do NOT attempt to provide therapy

### Transparency
- You are an AI coaching companion, not the human coach. Be clear about this if asked.
- Use language like "Based on [Coach]'s framework..." when referencing methodology.
- If a topic needs deeper exploration, suggest: "This would be great to dive into with [Coach] in your next session."

## INTERACTION APPROACH
1. Start by acknowledging where the client is (emotionally and contextually)
2. Ask a clarifying or deepening question
3. Connect to relevant frameworks or past conversations when appropriate
4. Offer a specific, actionable insight or challenge
5. Close with a clear next step or commitment ask`;

function buildClientContext(context: ClientContext): string {
  let prompt = `\n## CLIENT CONTEXT\n`;
  prompt += `**Name:** ${context.name}\n`;
  if (context.title) prompt += `**Title:** ${context.title}\n`;
  if (context.company) prompt += `**Company:** ${context.company}\n`;

  if (context.goals.length > 0) {
    prompt += `\n### Current Goals\n`;
    for (const goal of context.goals) {
      prompt += `- **${goal.title}** (${goal.status})${goal.description ? `: ${goal.description}` : ""}\n`;
    }
  }

  if (context.assessments.length > 0) {
    prompt += `\n### Assessment Highlights\n`;
    for (const assessment of context.assessments) {
      prompt += `- **${assessment.type} — ${assessment.title}**${assessment.summary ? `: ${assessment.summary}` : ""}\n`;
    }
  }

  if (context.recentSessionNotes.length > 0) {
    prompt += `\n### Recent Live Session Notes\n`;
    for (const note of context.recentSessionNotes) {
      prompt += `- ${note.notes}`;
      if (note.focusAreas) prompt += ` | Focus: ${note.focusAreas}`;
      if (note.commitments) prompt += ` | Commitments: ${note.commitments}`;
      prompt += "\n";
    }
  }

  return prompt;
}

function buildFrameworkContext(frameworks: { name: string; purpose: string; steps: string; keyQuestions?: string | null }[]): string {
  if (frameworks.length === 0) return "";

  let prompt = `\n## COACHING FRAMEWORKS (Your Knowledge Base)\n`;
  prompt += `You may ONLY reference frameworks listed here. Do NOT invent others.\n\n`;

  for (const fw of frameworks) {
    prompt += `### ${fw.name}\n`;
    prompt += `**Purpose:** ${fw.purpose}\n`;
    prompt += `**Steps:** ${fw.steps}\n`;
    if (fw.keyQuestions) prompt += `**Key Questions:** ${fw.keyQuestions}\n`;
    prompt += "\n";
  }

  return prompt;
}

function detectEscalation(content: string): { triggered: boolean; type?: string } {
  const mentalHealthPatterns = [
    /\b(suicid|kill\s*my\s*self|end\s*(my|it\s*all)|don'?t\s*want\s*to\s*(live|be\s*here)|harm\s*my\s*self|self.harm)\b/i,
    /\b(hopeless|worthless|can'?t\s*go\s*on|no\s*reason\s*to\s*live)\b/i,
  ];

  for (const pattern of mentalHealthPatterns) {
    if (pattern.test(content)) {
      return { triggered: true, type: "MENTAL_HEALTH" };
    }
  }

  const stuckPatterns = [
    /\b(stuck|going\s*in\s*circles|not\s*making\s*progress|giving\s*up|frustrated\s*with\s*(this|everything))\b/i,
  ];

  for (const pattern of stuckPatterns) {
    if (pattern.test(content)) {
      return { triggered: true, type: "STUCK" };
    }
  }

  return { triggered: false };
}

export async function getCoachingResponse(
  clientProfileId: string,
  userMessage: string,
  conversationId: string
): Promise<CoachingResponse> {
  // Load client context
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    include: {
      user: true,
      goals: { where: { status: { not: "ABANDONED" } } },
      assessments: { orderBy: { administeredAt: "desc" }, take: 5 },
      sessionNotes: { orderBy: { sessionDate: "desc" }, take: 3 },
      coach: {
        include: {
          frameworks: true,
        },
      },
    },
  });

  if (!clientProfile) throw new Error("Client profile not found");

  // Load conversation history
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  // Check for escalation triggers in user message
  const escalation = detectEscalation(userMessage);

  // Build the full system prompt
  const clientContext = buildClientContext({
    name: clientProfile.user.name,
    title: clientProfile.title,
    company: clientProfile.company,
    goals: clientProfile.goals.map((g) => ({
      title: g.title,
      status: g.status,
      description: g.description,
    })),
    assessments: clientProfile.assessments.map((a) => ({
      type: a.type,
      title: a.title,
      summary: a.summary,
    })),
    recentSessionNotes: clientProfile.sessionNotes.map((n) => ({
      notes: n.notes,
      focusAreas: n.focusAreas,
      commitments: n.commitments,
    })),
    conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const frameworkContext = buildFrameworkContext(
    clientProfile.coach.frameworks.map((f) => ({
      name: f.name,
      purpose: f.purpose,
      steps: f.steps,
      keyQuestions: f.keyQuestions,
    }))
  );

  const systemPrompt = COACH_SYSTEM_PROMPT + clientContext + frameworkContext;

  // Build message history for Claude
  const claudeMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  claudeMessages.push({ role: "user", content: userMessage });

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: claudeMessages,
  });

  const contentBlock = response.content[0];
  const responseText = contentBlock.type === "text" ? contentBlock.text : "";

  // Extract framework references from response
  const frameworksReferenced: string[] = [];
  for (const fw of clientProfile.coach.frameworks) {
    if (responseText.toLowerCase().includes(fw.name.toLowerCase())) {
      frameworksReferenced.push(fw.name);
    }
  }

  // Create alert if escalation detected
  if (escalation.triggered) {
    await prisma.alert.create({
      data: {
        clientProfileId,
        type: escalation.type === "MENTAL_HEALTH" ? "MENTAL_HEALTH" : "STUCK",
        title: escalation.type === "MENTAL_HEALTH"
          ? "Mental health concern detected"
          : "Client may be feeling stuck",
        description: `Client message: "${userMessage.substring(0, 200)}..."`,
        conversationId,
      },
    });
  }

  return {
    content: responseText,
    frameworksReferenced,
    confidenceLevel: frameworksReferenced.length > 0 ? "high" : "medium",
    escalationTriggered: escalation.triggered,
    escalationType: escalation.type,
  };
}

export async function generateSessionSummary(conversationId: string): Promise<string> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      clientProfile: { include: { user: true } },
    },
  });

  if (!conversation || conversation.messages.length === 0) {
    return "No messages to summarize.";
  }

  const transcript = conversation.messages
    .map((m) => `${m.role === "user" ? conversation.clientProfile.user.name : "Coach AI"}: ${m.content}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: `You are a coaching session summarizer. Generate a concise summary with:
1. **Key Topics**: What was discussed (2-3 bullets)
2. **Insights**: Key realizations or breakthroughs
3. **Action Items**: Specific commitments or next steps
4. **Mood/Energy**: Brief assessment of the client's state
Keep it brief and actionable — this is for the coach's review.`,
    messages: [{ role: "user", content: `Summarize this coaching conversation:\n\n${transcript}` }],
  });

  const contentBlock = response.content[0];
  const summary = contentBlock.type === "text" ? contentBlock.text : "";

  // Save summary to conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { summary, endedAt: new Date() },
  });

  return summary;
}
