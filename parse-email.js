#!/usr/bin/env node

"use strict";

// ---------------------------------------------------------------------------
// Species Blueprint Email Parser
// A coaching mirror for leaders with ADHD / Autistic-leaning patterns.
//
// Usage:
//   echo "email text" | node parse-email.js
//   node parse-email.js < email.txt
//   node parse-email.js --file path/to/email.txt
//   node parse-email.js --text "inline email body"
// ---------------------------------------------------------------------------

const fs = require("fs");

// ===== 1. Species Blueprints ================================================
// Each species carries a set of *rooted* traits (healthy defaults) and
// linguistic markers we expect to find when someone is operating from their
// natural pattern.

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
    // Phrases / patterns that signal the person IS rooted in Baobab mode.
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

// ===== 2. Tumbleweed Shift Markers ==========================================
// These are signs of "unrooted" behaviour — the leader has disconnected from
// their species pattern. They apply regardless of whether someone is a Baobab
// or Mangrove.

const TUMBLEWEED_MARKERS = [
  // --- Over-explaining ---
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

  // --- Permission-seeking where authority exists ---
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

  // --- False urgency / anxiety spiral ---
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

  // --- Hedging / self-minimising ---
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

  // --- Compulsive accommodation ---
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

// ===== 3. Parsing Helpers ===================================================

/**
 * Score an email body against a single species.
 * Returns { score, matchedTraits: [{ trait, excerpt }] }
 */
function scoreSpecies(text, species) {
  const matchedTraits = [];
  const seenTraits = new Set();

  for (const { pattern, trait } of species.markers) {
    const match = text.match(pattern);
    if (match && !seenTraits.has(trait)) {
      seenTraits.add(trait);
      matchedTraits.push({
        trait,
        excerpt: extractExcerpt(text, match.index, match[0].length),
      });
    }
  }

  return { score: matchedTraits.length, matchedTraits };
}

/**
 * Detect all Tumbleweed shift markers present in the text.
 * Returns [{ category, label, excerpts: [string] }]
 */
function detectTumbleweed(text) {
  const results = [];

  for (const marker of TUMBLEWEED_MARKERS) {
    const excerpts = [];
    for (const pattern of marker.patterns) {
      const match = text.match(pattern);
      if (match) {
        excerpts.push(extractExcerpt(text, match.index, match[0].length));
      }
    }
    if (excerpts.length > 0) {
      results.push({
        category: marker.category,
        label: marker.label,
        excerpts,
      });
    }
  }

  return results;
}

/**
 * Pull a short excerpt around a match for display.
 */
function extractExcerpt(text, index, matchLength) {
  const WINDOW = 40;
  const start = Math.max(0, index - WINDOW);
  const end = Math.min(text.length, index + matchLength + WINDOW);
  let excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";
  return excerpt;
}

// ===== 4. Mirror Output =====================================================

/**
 * Build the coaching mirror reflection from analysis results.
 */
function buildMirror(speciesResult, tumbleweedHits, emailSnippet) {
  const lines = [];

  lines.push("=".repeat(68));
  lines.push("  SPECIES BLUEPRINT MIRROR");
  lines.push("=".repeat(68));
  lines.push("");

  // --- Species identification ---
  const { species, matchedTraits, score } = speciesResult;

  if (!species) {
    lines.push(
      "  I couldn't detect a clear species pattern in this email.",
    );
    lines.push(
      "  This itself may be a signal — when we're fully in Tumbleweed",
    );
    lines.push("  mode, our natural voice goes quiet.");
    lines.push("");
  } else {
    lines.push(`  Detected species:  ${species.name}`);
    lines.push(`  Pattern strength:  ${score} marker(s) found`);
    lines.push("");
    lines.push(`  ${species.name} essence: ${species.description}`);
    lines.push("");

    if (matchedTraits.length > 0) {
      lines.push("  Rooted traits visible in this email:");
      for (const { trait, excerpt } of matchedTraits) {
        lines.push(`    - ${trait}`);
        lines.push(`      "${excerpt}"`);
      }
      lines.push("");
    }
  }

  // --- Tumbleweed detection ---
  lines.push("-".repeat(68));
  lines.push("  TUMBLEWEED SHIFT DETECTION");
  lines.push("-".repeat(68));
  lines.push("");

  if (tumbleweedHits.length === 0) {
    lines.push("  No Tumbleweed shifts detected. You appear rooted.");
    lines.push("");
  } else {
    lines.push(
      `  ${tumbleweedHits.length} Tumbleweed shift(s) detected:`,
    );
    lines.push("");

    for (const hit of tumbleweedHits) {
      lines.push(`  >> ${hit.category.toUpperCase()}`);
      lines.push(`     ${hit.label}`);
      for (const excerpt of hit.excerpts) {
        lines.push(`     "${excerpt}"`);
      }
      lines.push("");
    }
  }

  // --- The Mirror reflection ---
  lines.push("-".repeat(68));
  lines.push("  YOUR MIRROR REFLECTION");
  lines.push("-".repeat(68));
  lines.push("");

  if (species && tumbleweedHits.length > 0) {
    const rootedTrait =
      matchedTraits.length > 0
        ? matchedTraits[0].trait
        : species.rootedTraits[0];

    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");

    lines.push(wrapText(
      `Your natural ${species.name} pattern is ${rootedTrait}. ` +
      `This email shows you shifting into a Tumbleweed state by ` +
      `${shiftActions}. ` +
      `How can you return to your roots?`,
      68, 2,
    ));
  } else if (species && tumbleweedHits.length === 0) {
    const rootedTrait =
      matchedTraits.length > 0
        ? matchedTraits[0].trait
        : species.rootedTraits[0];

    lines.push(wrapText(
      `Your natural ${species.name} pattern is ${rootedTrait}, ` +
      `and this email reads as rooted. You're operating from your ` +
      `trunk. Keep going.`,
      68, 2,
    ));
  } else if (!species && tumbleweedHits.length > 0) {
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    lines.push(wrapText(
      `Your species pattern isn't coming through in this email — ` +
      `which may mean the Tumbleweed state has taken over. ` +
      `I see you ${shiftActions}. ` +
      `Pause. Which species feels like home — Baobab or Mangrove? ` +
      `Write one sentence from that place and start again.`,
      68, 2,
    ));
  } else {
    lines.push(wrapText(
      "This email is neutral — no strong species signal and no " +
      "Tumbleweed shifts. If this is a routine message, that's fine. " +
      "If it's a message that matters to you, consider: what would " +
      "your rooted self want to say differently?",
      68, 2,
    ));
  }

  lines.push("");
  lines.push("=".repeat(68));

  return lines.join("\n");
}

/**
 * Wrap text to a given width with an indent.
 */
function wrapText(text, width, indent) {
  const prefix = " ".repeat(indent);
  const words = text.split(/\s+/);
  const wrapped = [];
  let line = prefix;

  for (const word of words) {
    if (line.length + word.length + 1 > width && line.trim().length > 0) {
      wrapped.push(line);
      line = prefix + word;
    } else {
      line += (line.trim().length === 0 ? "" : " ") + word;
    }
  }
  if (line.trim().length > 0) wrapped.push(line);
  return wrapped.join("\n");
}

// ===== 5. Input Handling ====================================================

function readEmailFromArgs() {
  const args = process.argv.slice(2);

  // --text "inline body"
  const textIdx = args.indexOf("--text");
  if (textIdx !== -1 && args[textIdx + 1]) {
    return args[textIdx + 1];
  }

  // --file path/to/email.txt
  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    const filePath = args[fileIdx + 1];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: file not found — ${filePath}`);
      process.exit(1);
    }
    return fs.readFileSync(filePath, "utf-8");
  }

  return null;
}

function readEmailFromStdin() {
  return new Promise((resolve, reject) => {
    // If stdin is a TTY (no piped data), resolve with null immediately.
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

// ===== 6. Main ==============================================================

async function main() {
  let emailBody = readEmailFromArgs();

  if (!emailBody) {
    emailBody = await readEmailFromStdin();
  }

  // If still nothing, run the built-in demo.
  if (!emailBody || emailBody.trim().length === 0) {
    emailBody = DEMO_EMAIL;
    console.log("(No input detected — running with built-in demo email)\n");
  }

  // Score both species.
  const baobabResult = scoreSpecies(emailBody, SPECIES.baobab);
  const mangroveResult = scoreSpecies(emailBody, SPECIES.mangrove);

  // Pick the dominant species (or null if no markers at all).
  let dominant = null;
  let dominantTraits = [];
  let dominantScore = 0;

  if (baobabResult.score > 0 || mangroveResult.score > 0) {
    if (baobabResult.score >= mangroveResult.score) {
      dominant = SPECIES.baobab;
      dominantTraits = baobabResult.matchedTraits;
      dominantScore = baobabResult.score;
    } else {
      dominant = SPECIES.mangrove;
      dominantTraits = mangroveResult.matchedTraits;
      dominantScore = mangroveResult.score;
    }
  }

  // Detect Tumbleweed shifts.
  const tumbleweedHits = detectTumbleweed(emailBody);

  // Build and print the mirror.
  const mirror = buildMirror(
    { species: dominant, matchedTraits: dominantTraits, score: dominantScore },
    tumbleweedHits,
    emailBody.slice(0, 200),
  );

  console.log(mirror);
}

// ===== 7. Demo Email ========================================================

const DEMO_EMAIL = `
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
Alex
`;

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
