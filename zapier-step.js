// ---------------------------------------------------------------------------
// Species Blueprint — Zapier "Code by Zapier" Step
//
// Zapier flow:
//   1. Trigger:  Gmail  -> New Email (matching a BCC address)
//   2. Action:   Code by Zapier  -> Run this JavaScript
//   3. Action:   Gmail  -> Send Reply (using output.replyHtml)
//
// Setup in Zapier:
//   - In the "Code by Zapier" step, set Input Data:
//       emailBody  =  {{body_plain}}  (from the Gmail trigger)
//       senderName =  {{from_name}}   (optional, for personalised greeting)
//   - Paste ALL the code below into the Code field.
//   - In the Gmail "Send Reply" step, map:
//       To           -> the original sender
//       Body (HTML)  -> {{replyHtml}}
//       Subject      -> {{replySubject}}
//
// NOTE: Zapier's "Code by Zapier" runs in a sandboxed Node.js environment
// with no filesystem and no npm packages. Everything must be self-contained.
// That's why this file inlines the full engine rather than require()-ing it.
// For local testing you can still run:  node zapier-step.js
// ---------------------------------------------------------------------------

// ===== Engine (inlined for Zapier sandbox) ==================================

const SPECIES = {
  baobab: {
    name: "Baobab",
    description:
      "Stoic, resource-storing, slow-growth. You stand firm, conserve " +
      "energy, and let depth do the talking.",
    rootedTraits: [
      "measured decisiveness",
      "calm under-reaction to urgency",
      "sparse but weighty communication",
      "long-term resource stewardship",
      "quiet boundary-holding",
    ],
    markers: [
      { pattern: /\b(I('ve| have) decided|my decision is|I('m| am) going with)\b/i, trait: "measured decisiveness" },
      { pattern: /\b(no rush|when you get a chance|no immediate action needed|in due time)\b/i, trait: "calm under-reaction to urgency" },
      { pattern: /\b(to be clear|the bottom line is|in short|simply put)\b/i, trait: "sparse but weighty communication" },
      { pattern: /\b(long[- ]term|sustainable|over time|building toward)\b/i, trait: "long-term resource stewardship" },
      { pattern: /\b(I('m| am) not available for|that('s| is) outside|my boundary|I won't be)\b/i, trait: "quiet boundary-holding" },
      { pattern: /\b(let('s| us) wait|I('ll| will) sit with this|no need to react)\b/i, trait: "calm under-reaction to urgency" },
      { pattern: /\b(conserve|preserve|protect our resources|budget accordingly)\b/i, trait: "long-term resource stewardship" },
    ],
  },
  mangrove: {
    name: "Mangrove",
    description:
      "Complex root systems, protective, collaborative. You thrive in " +
      "interconnected networks and shield your ecosystem.",
    rootedTraits: [
      "collaborative orchestration",
      "protective shielding of the team",
      "comfortable complexity-holding",
      "adaptive but anchored decision-making",
      "relational boundary-setting",
    ],
    markers: [
      { pattern: /\b(let('s| us) (loop in|bring in|align with)|who else should)\b/i, trait: "collaborative orchestration" },
      { pattern: /\b(I('ll| will) handle (the|this) push-?back|I('ll| will) shield|keep them out of it|protect the team)\b/i, trait: "protective shielding of the team" },
      { pattern: /\b(it('s| is) nuanced|there are layers|both.*and|multiple factors)\b/i, trait: "comfortable complexity-holding" },
      { pattern: /\b(given what we know|adapting our approach|flexible on the how|the goal stays)\b/i, trait: "adaptive but anchored decision-making" },
      { pattern: /\b(for the health of the team|relationship matters|we need to talk about how)\b/i, trait: "relational boundary-setting" },
      { pattern: /\b(ecosystem|network|interconnect|weave together)\b/i, trait: "collaborative orchestration" },
      { pattern: /\b(absorb (the|this) impact|buffer|take the hit so)\b/i, trait: "protective shielding of the team" },
    ],
  },
};

const TUMBLEWEED_MARKERS = [
  {
    category: "over-explaining",
    label: "over-explaining a decision you already have authority to make",
    patterns: [
      /\b(just to (explain|clarify|be clear),?\s*(I|we))\b/i,
      /\b(the reason I('m| am) (doing|saying) this is)\b/i,
      /\b(I (just )?want(ed)? to make sure (you|everyone) underst(and|ood))\b/i,
      /\b(let me (walk you through|explain) (my|the) (reasoning|rationale|thinking))\b/i,
      /\b(I know (this|it) (might|may) seem)\b/i,
      /\b(if that makes sense\??)\b/i,
      /\b(sorry.{0,15}(long|lengthy|wordy|rambling))\b/i,
    ],
  },
  {
    category: "permission-seeking",
    label: "seeking permission where you already have authority",
    patterns: [
      /\b(would it be (ok(ay)?|alright|fine) if I)\b/i,
      /\b(do (you think )?I (should|can|could))\b/i,
      /\b(is it (ok(ay)?|alright|fine) (for me )?to)\b/i,
      /\b(I('d| would) like your (permission|approval|blessing|go[- ]ahead) (to|before))\b/i,
      /\b(can I have your (sign[- ]off|okay))\b/i,
      /\b(just (wanted|checking|making sure).{0,20}(okay|alright|fine|approve))\b/i,
      /\b(I don't want to overstep)\b/i,
    ],
  },
  {
    category: "false-urgency",
    label: "projecting high urgency that doesn't match the actual stakes",
    patterns: [
      /\b(ASAP|as soon as possible|urgent(ly)?|immediately|right away|drop everything)\b/i,
      /\b(this (is|feels) (really )?(critical|dire|an emergency))\b/i,
      /\b(I('m| am) (really )?(worried|anxious|panicking|freaking out|stressed))\b/i,
      /\b(we('re| are) (going to|gonna) (lose|miss|fail|fall behind))\b/i,
      /\b(if we don't .{0,30} (now|today|immediately))\b/i,
      /\b(sky.{0,5}falling|world.{0,5}ending|catastroph)/i,
      /\b(!!+)/,
    ],
  },
  {
    category: "hedging",
    label: "hedging and minimising your own expertise",
    patterns: [
      /\b(I('m| am) (probably|maybe) wrong,? but)\b/i,
      /\b(this (might|may) (be|sound) (stupid|dumb|silly|naive),? but)\b/i,
      /\b(I('m| am) no expert,? but)\b/i,
      /\b(just my (humble )?opinion)\b/i,
      /\b(feel free to (ignore|disregard|push back))\b/i,
      /\b(I could be (way )?off (base|track|here))\b/i,
      /\b(take this with a grain of salt)\b/i,
    ],
  },
  {
    category: "over-accommodating",
    label: "compulsively accommodating at the expense of your own priorities",
    patterns: [
      /\b(whatever (you|the team) (need|want|prefer)(s)?)\b/i,
      /\b(I('ll| will) (just )?make it work)\b/i,
      /\b(it('s| is) (fine|okay|no problem),? I('ll| will) (adjust|figure it out|handle it))\b/i,
      /\b(don't worry about me)\b/i,
      /\b(I can (move|shift|cancel) my)\b/i,
      /\b(happy to (take that on|absorb|pick up the slack))\b/i,
    ],
  },
];

function extractExcerpt(text, index, matchLength) {
  const WINDOW = 40;
  const start = Math.max(0, index - WINDOW);
  const end = Math.min(text.length, index + matchLength + WINDOW);
  let excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";
  return excerpt;
}

function scoreSpecies(text, species) {
  const matchedTraits = [];
  const seenTraits = new Set();
  for (const { pattern, trait } of species.markers) {
    const match = text.match(pattern);
    if (match && !seenTraits.has(trait)) {
      seenTraits.add(trait);
      matchedTraits.push({ trait, excerpt: extractExcerpt(text, match.index, match[0].length) });
    }
  }
  return { score: matchedTraits.length, matchedTraits };
}

function detectTumbleweed(text) {
  const results = [];
  for (const marker of TUMBLEWEED_MARKERS) {
    const excerpts = [];
    for (const pattern of marker.patterns) {
      const match = text.match(pattern);
      if (match) excerpts.push(extractExcerpt(text, match.index, match[0].length));
    }
    if (excerpts.length > 0) {
      results.push({ category: marker.category, label: marker.label, excerpts });
    }
  }
  return results;
}

function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ===== Build the HTML reply =================================================

function buildReplyHtml(senderName, species, matchedTraits, tumbleweedHits) {
  const greeting = senderName ? `Hi ${esc(senderName)},` : "Hi,";
  const parts = [];

  parts.push(`<div style="font-family: Georgia, serif; max-width: 600px; color: #333;">`);
  parts.push(`<p>${greeting}</p>`);
  parts.push(`<p>Here's the mirror for the email you just sent.</p>`);

  // --- Species ---
  parts.push(`<h2 style="border-bottom: 2px solid #4a7c59; padding-bottom: 8px; color: #4a7c59;">Species Blueprint Mirror</h2>`);

  if (!species) {
    parts.push(`<p style="color: #8b6914; font-style: italic;">`);
    parts.push(`I couldn't detect a clear species pattern in this email. `);
    parts.push(`This itself may be a signal &mdash; when we're fully in Tumbleweed mode, our natural voice goes quiet.`);
    parts.push(`</p>`);
  } else {
    const color = species.name === "Baobab" ? "#6b4226" : "#2e7d6e";
    parts.push(`<h3 style="color: ${color}; margin-bottom: 4px;">Detected species: ${esc(species.name)}</h3>`);
    parts.push(`<p style="color: #555; margin-top: 0;"><em>${esc(species.description)}</em></p>`);
    parts.push(`<p style="color: #777; font-size: 0.9em;">Pattern strength: ${matchedTraits.length} marker(s) found</p>`);

    if (matchedTraits.length > 0) {
      parts.push(`<p><strong>Rooted traits visible in this email:</strong></p><ul>`);
      for (const { trait, excerpt } of matchedTraits) {
        parts.push(`<li><strong>${esc(trait)}</strong><br/><span style="color:#777;font-size:0.9em;">"${esc(excerpt)}"</span></li>`);
      }
      parts.push(`</ul>`);
    }
  }

  // --- Tumbleweed ---
  parts.push(`<h3 style="border-top: 1px solid #ccc; padding-top: 12px; color: #b8860b;">Tumbleweed Shift Detection</h3>`);

  if (tumbleweedHits.length === 0) {
    parts.push(`<p style="color: #4a7c59;"><strong>No Tumbleweed shifts detected.</strong> You appear rooted.</p>`);
  } else {
    parts.push(`<p>${tumbleweedHits.length} Tumbleweed shift(s) detected:</p>`);
    for (const hit of tumbleweedHits) {
      parts.push(`<p style="margin-bottom:2px;"><strong style="color:#b8860b;">${esc(hit.category.toUpperCase())}</strong></p>`);
      parts.push(`<p style="margin-top:0;margin-bottom:2px;">${esc(hit.label)}</p>`);
      parts.push(`<ul>`);
      for (const excerpt of hit.excerpts) {
        parts.push(`<li style="color:#777;font-size:0.9em;">"${esc(excerpt)}"</li>`);
      }
      parts.push(`</ul>`);
    }
  }

  // --- Reflection ---
  parts.push(`<div style="background:#f7f3e9; border-left:4px solid #4a7c59; padding:16px; margin-top:16px;">`);
  parts.push(`<h3 style="margin-top:0; color:#4a7c59;">Your Mirror Reflection</h3>`);

  let reflection;
  if (species && tumbleweedHits.length > 0) {
    const rootedTrait = matchedTraits.length > 0 ? matchedTraits[0].trait : species.rootedTraits[0];
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    reflection =
      `Your natural ${species.name} pattern is <strong>${esc(rootedTrait)}</strong>. ` +
      `This email shows you shifting into a Tumbleweed state by ${esc(shiftActions)}. ` +
      `<em>How can you return to your roots?</em>`;
  } else if (species && tumbleweedHits.length === 0) {
    const rootedTrait = matchedTraits.length > 0 ? matchedTraits[0].trait : species.rootedTraits[0];
    reflection =
      `Your natural ${species.name} pattern is <strong>${esc(rootedTrait)}</strong>, ` +
      `and this email reads as rooted. You're operating from your trunk. Keep going.`;
  } else if (!species && tumbleweedHits.length > 0) {
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    reflection =
      `Your species pattern isn't coming through in this email &mdash; ` +
      `which may mean the Tumbleweed state has taken over. ` +
      `I see you ${esc(shiftActions)}. ` +
      `Pause. Which species feels like home &mdash; Baobab or Mangrove? ` +
      `Write one sentence from that place and start again.`;
  } else {
    reflection =
      `This email is neutral &mdash; no strong species signal and no ` +
      `Tumbleweed shifts. If this is a routine message, that's fine. ` +
      `If it's a message that matters to you, consider: what would ` +
      `your rooted self want to say differently?`;
  }

  parts.push(`<p style="font-size:1.05em;line-height:1.6;">${reflection}</p>`);
  parts.push(`</div>`);

  parts.push(`<p style="margin-top:24px;color:#999;font-size:0.85em;">` +
    `&mdash; Species Blueprint Mirror &bull; a coaching tool, not advice</p>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ===== Zapier entry point ===================================================
//
// Zapier "Code by Zapier" expects:
//   - Input Data to be available as `inputData` (a global object)
//   - The step to set `output` (a global object) with the result fields
//
// When running locally (node zapier-step.js), we simulate inputData.

async function run() {
  // --- Resolve input (Zapier global or local simulation) ---
  let input;
  if (typeof inputData !== "undefined") {
    input = inputData;   // Zapier runtime
  } else {
    // Local test mode
    input = {
      emailBody: `
Hi Maria,

I just wanted to make sure you understand why I went ahead and moved
the project timeline — the reason I'm doing this is because the client
shifted their launch window and I felt like we needed to respond. I know
this might seem abrupt but I think it's the right call long-term.

Would it be okay if I also reassigned the two junior devs to the new
sprint? I don't want to overstep but I think the team could use the
help. Do you think I should loop in James too, or is that too many
cooks?

I'm really worried that if we don't move on this TODAY we're going to
miss the window entirely and lose the account. This feels critical.
Can we get everyone on a call ASAP? I'll make it work — whatever the
team needs, I'll just adjust my schedule.

Sorry for the long email. Just my humble opinion, but I think building
toward a sustainable pace matters more than hitting every short-term
target. Feel free to push back.

Thanks,
Alex`,
      senderName: "Alex",
    };
    console.log("(Running in local test mode)\n");
  }

  const emailBody = (input.emailBody || "").trim();
  const senderName = (input.senderName || "").trim();

  if (!emailBody) {
    // Return a safe fallback so the Zap doesn't crash.
    const result = {
      replySubject: "Your Species Blueprint Mirror",
      replyHtml: "<p>No email body was provided to analyse.</p>",
      species: "unknown",
      tumbleweedCount: 0,
      reflectionPlain: "No email body was provided to analyse.",
    };
    if (typeof output !== "undefined") { output = result; }
    else { console.log(JSON.stringify(result, null, 2)); }
    return;
  }

  // --- Analyse ---
  const baobabResult = scoreSpecies(emailBody, SPECIES.baobab);
  const mangroveResult = scoreSpecies(emailBody, SPECIES.mangrove);

  let dominant = null;
  let dominantTraits = [];

  if (baobabResult.score > 0 || mangroveResult.score > 0) {
    if (baobabResult.score >= mangroveResult.score) {
      dominant = SPECIES.baobab;
      dominantTraits = baobabResult.matchedTraits;
    } else {
      dominant = SPECIES.mangrove;
      dominantTraits = mangroveResult.matchedTraits;
    }
  }

  const tumbleweedHits = detectTumbleweed(emailBody);

  // --- Build outputs ---
  const replyHtml = buildReplyHtml(senderName, dominant, dominantTraits, tumbleweedHits);

  // Plain-text reflection sentence for optional use in other Zap steps.
  let reflectionPlain;
  if (dominant && tumbleweedHits.length > 0) {
    const trait = dominantTraits.length > 0 ? dominantTraits[0].trait : dominant.rootedTraits[0];
    reflectionPlain =
      `Your natural ${dominant.name} pattern is ${trait}. ` +
      `This email shows you shifting into a Tumbleweed state by ` +
      `${tumbleweedHits.map((h) => h.label).join("; ")}. ` +
      `How can you return to your roots?`;
  } else if (dominant) {
    const trait = dominantTraits.length > 0 ? dominantTraits[0].trait : dominant.rootedTraits[0];
    reflectionPlain = `Your natural ${dominant.name} pattern is ${trait}, and this email reads as rooted. Keep going.`;
  } else if (tumbleweedHits.length > 0) {
    reflectionPlain =
      `Your species pattern isn't visible here. I see you ` +
      `${tumbleweedHits.map((h) => h.label).join("; ")}. ` +
      `Pause — which species feels like home?`;
  } else {
    reflectionPlain = "Neutral email — no strong species signal or Tumbleweed shifts.";
  }

  const result = {
    replySubject: "Your Species Blueprint Mirror",
    replyHtml,
    species: dominant ? dominant.name : "undetected",
    tumbleweedCount: tumbleweedHits.length,
    tumbleweedCategories: tumbleweedHits.map((h) => h.category).join(", "),
    reflectionPlain,
  };

  // --- Output ---
  if (typeof output !== "undefined") {
    // Zapier runtime: set the global output object.
    output = result;
  } else {
    // Local: print the HTML and the structured result.
    console.log("===== REPLY HTML =====\n");
    console.log(result.replyHtml);
    console.log("\n===== STRUCTURED OUTPUT =====\n");
    console.log(JSON.stringify(result, null, 2));
  }
}

run();
