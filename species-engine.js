"use strict";

// ---------------------------------------------------------------------------
// Species Blueprint — Core Analysis Engine (v2)
// Shared by the CLI (parse-email.js) and the Zapier step (zapier-step.js).
//
// Three species, three dimensions each:
//   Processing Style  — how the leader thinks
//   Activation Mode   — what gets them moving
//   Storm Response     — how they behave under pressure
//
// Tumbleweed = acting AGAINST your own blueprint. Species-specific.
// ---------------------------------------------------------------------------

// ===== 1. Species Blueprints ================================================

const SPECIES = {
  baobab: {
    name: "Baobab",
    description:
      "Internal, high-density processing. You think to talk \u2014 conclusions " +
      "arrive fully formed. Logic lights you up, and when the storm hits " +
      "you anchor deeper, not wider.",
    dimensions: {
      processing: {
        name: "Think-to-Talk (Internal / High-Density Processing)",
        markers: [
          { pattern: /\b(I('ve| have) (thought|considered|reflected|weighed) .{0,30}(and|so))\b/i, label: "presenting a pre-formed conclusion" },
          { pattern: /\b(after (careful |much )?(consideration|thought|review|analysis))\b/i, label: "signalling completed internal processing" },
          { pattern: /\b(my (assessment|conclusion|read|take) is)\b/i, label: "delivering a finished assessment" },
          { pattern: /\b(I('ve| have) decided|my decision is|I('m| am) going with)\b/i, label: "stating a decision already made internally" },
          { pattern: /\b(to be clear|the bottom line is|in short|net[- ]net|simply put)\b/i, label: "compressing to high-density output" },
          { pattern: /\b(I('ve| have) (already |)run the numbers|the data (says|shows|tells))\b/i, label: "referencing solo analysis already done" },
        ],
      },
      activation: {
        name: "Logic-Based Activation",
        markers: [
          { pattern: /\b(logically|structurally|systematically|analytically)\b/i, label: "framing through logic" },
          { pattern: /\b(the (data|evidence|numbers|metrics|analysis) (shows?|suggests?|indicates?|confirms?))\b/i, label: "activating through evidence" },
          { pattern: /\b(if .{3,40} then)\b/i, label: "reasoning in if/then structures" },
          { pattern: /\b(root cause|first principles|underlying (issue|problem|pattern))\b/i, label: "drilling to root cause" },
          { pattern: /\b(the (framework|model|system|structure) (here |for this )?is)\b/i, label: "building a framework" },
          { pattern: /\b(cost[- ]benefit|trade[- ]off|risk[- ]reward|ROI)\b/i, label: "weighing trade-offs analytically" },
        ],
      },
      storm: {
        name: "Anchoring During Storms",
        markers: [
          { pattern: /\b(let('s| us) not (overreact|panic|rush)|no need to react|stay the course)\b/i, label: "refusing to be swept by urgency" },
          { pattern: /\b(the fundamentals (haven't|have not) changed|this doesn't change the plan)\b/i, label: "anchoring to what hasn't moved" },
          { pattern: /\b(we('ve| have) (been through|seen|weathered) this before)\b/i, label: "drawing on historical precedent" },
          { pattern: /\b(no rush|when you get a chance|no immediate action needed|in due time)\b/i, label: "deliberately slowing the tempo" },
          { pattern: /\b(let('s| us) wait|I('ll| will) sit with this|sleep on it)\b/i, label: "choosing stillness over reaction" },
          { pattern: /\b(long[- ]term|sustainable|over time|building toward)\b/i, label: "holding the long horizon" },
          { pattern: /\b(I('m| am) not available for|my boundary|I won't be)\b/i, label: "holding a boundary under pressure" },
        ],
      },
    },
    tumbleweed: {
      summary: "rushed, surface-level reacting",
      markers: [
        {
          category: "reactive-rushing",
          label: "rushing to act before your internal processing is complete",
          patterns: [
            /\b(ASAP|as soon as possible|right away|drop everything|immediately)\b/i,
            /\b(just (do|ship|send|push|fix) it)\b/i,
            /\b(we (just )?need to (move|act|go|ship) (now|fast|quickly|today))\b/i,
            /\b(no time to (think|plan|analyse|analyze|discuss))\b/i,
            /\b(let('s| us) (just )?figure it out (as we go|later|along the way))\b/i,
          ],
        },
        {
          category: "surface-skimming",
          label: "skimming the surface instead of going deep",
          patterns: [
            /\b(it('s| is) (fine|okay|whatever|good enough))\b/i,
            /\b(I('ll| will) (just )?make it work)\b/i,
            /\b(don't worry about (the )?details)\b/i,
            /\b(whatever (you|the team) (need|want|prefer))\b/i,
            /\b(I('m| am) (probably|maybe) wrong,? but)\b/i,
            /\b(just my (humble )?opinion)\b/i,
            /\b(feel free to (ignore|disregard|push back))\b/i,
          ],
        },
        {
          category: "abandoning-analysis",
          label: "abandoning your analytical anchor and reacting emotionally",
          patterns: [
            /\b(I('m| am) (really )?(worried|anxious|panicking|freaking out|stressed))\b/i,
            /\b(this (is|feels) (really )?(critical|dire|an emergency))\b/i,
            /\b(we('re| are) (going to|gonna) (lose|miss|fail|fall behind))\b/i,
            /\b(if we don't .{0,30} (now|today|immediately))\b/i,
            /\b(sky.{0,5}falling|world.{0,5}ending|catastroph)/i,
            /\b(!!+)/,
          ],
        },
      ],
    },
  },

  mangrove: {
    name: "Mangrove",
    description:
      "External, visible processing. You talk to think \u2014 ideas form " +
      "between people. Social flux lights you up, and when the storm hits " +
      "you expand outward to strengthen the network.",
    dimensions: {
      processing: {
        name: "Talk-to-Think (External / Visible Processing)",
        markers: [
          { pattern: /\b(I('m| am) thinking out loud|let me (think|process) .{0,15}(with you|out loud))\b/i, label: "processing visibly in real time" },
          { pattern: /\b(what if we|what about|I('m| am) (wondering|curious) (if|whether))\b/i, label: "thinking through open questions" },
          { pattern: /\b(help me (think|work|figure) (through|out))\b/i, label: "inviting collaborative processing" },
          { pattern: /\b(I('m| am) not sure yet,? but|I don't have (the|a) (full|complete) picture)\b/i, label: "sharing incomplete thinking openly" },
          { pattern: /\b(let('s| us) (talk|brainstorm|riff|spitball|jam) (on|about))\b/i, label: "initiating shared ideation" },
          { pattern: /\b(bouncing .{0,10}(idea|thought|this) off (you|the team))\b/i, label: "using others as a thinking surface" },
        ],
      },
      activation: {
        name: "Social Flux Activation",
        markers: [
          { pattern: /\b(how (is|are) (everyone|the team|people|you all|y'all) (feeling|doing))\b/i, label: "sensing the emotional field" },
          { pattern: /\b(let('s| us) (loop in|bring in|align with|sync with)|who else should)\b/i, label: "activating through social connection" },
          { pattern: /\b(the (energy|mood|vibe|dynamic|tension) (in the|on the|of the))\b/i, label: "reading relational dynamics" },
          { pattern: /\b(for the health of the team|relationship matters|we need to talk about how)\b/i, label: "prioritising relational health" },
          { pattern: /\b(who('s| is) affected|who needs to (know|hear|weigh in))\b/i, label: "mapping social impact" },
          { pattern: /\b(I('ve| have) been (talking|checking in) with)\b/i, label: "building through one-on-one check-ins" },
        ],
      },
      storm: {
        name: "Expanding for Connection During Storms",
        markers: [
          { pattern: /\b(we need to come together|let('s| us) (gather|convene|huddle|regroup))\b/i, label: "pulling the network closer under pressure" },
          { pattern: /\b(who else should (weigh in|be here|know about this))\b/i, label: "expanding the circle during crisis" },
          { pattern: /\b(I('ll| will) handle (the|this) push-?back|I('ll| will) shield|protect the team)\b/i, label: "shielding the ecosystem from external force" },
          { pattern: /\b(I want to make sure everyone (feels heard|has a voice|is included))\b/i, label: "ensuring no voice is lost in the storm" },
          { pattern: /\b(it('s| is) nuanced|there are layers|multiple factors)\b/i, label: "holding relational complexity under pressure" },
          { pattern: /\b(absorb (the|this) impact|buffer|take the hit so)\b/i, label: "absorbing impact on behalf of others" },
          { pattern: /\b(given what we know|adapting our approach|the goal stays)\b/i, label: "staying anchored while flexing the approach" },
        ],
      },
    },
    tumbleweed: {
      summary: "isolating or silencing",
      markers: [
        {
          category: "isolating",
          label: "withdrawing from the network you normally draw strength from",
          patterns: [
            /\b(I('ll| will) (just )?(handle|deal with|figure out|do) (it|this) myself)\b/i,
            /\b(no need to (discuss|talk|involve|loop|bring))\b/i,
            /\b(I('ve| have) already decided)\b/i,
            /\b(don't (worry|bother)( about (it|this|me))?)\b/i,
            /\b(I don't (need|want) (any )?input (on|from|about))\b/i,
            /\b(this is my call( alone)?|I('m| am) handling this solo)\b/i,
          ],
        },
        {
          category: "silencing",
          label: "shutting down the external processing that fuels your thinking",
          patterns: [
            /\b(there('s| is) nothing (more )?to discuss|discussion('s| is) over)\b/i,
            /\b(it('s| is) not up for (debate|discussion|conversation))\b/i,
            /\b(just (do|follow) what I (said|asked|told))\b/i,
            /\b(I don't (want to|need to) (hear|talk about|explain|discuss))\b/i,
            /\b(stop (asking|questioning|pushing back))\b/i,
            /\b(I('m| am) done (talking|discussing|explaining))\b/i,
          ],
        },
        {
          category: "flattening-complexity",
          label: "collapsing your natural complexity into a blunt, binary answer",
          patterns: [
            /\b(it('s| is) (simple|straightforward|black and white|obvious|clear[- ]cut))\b/i,
            /\b((just|simply) (do|pick|choose|go with) (one|A or B|this or that))\b/i,
            /\b(I don't (have|need) (time|patience) for (nuance|details|layers))\b/i,
            /\b(yes or no|in or out|are you with me or not)\b/i,
            /\b(there('s| is) (only )?one (way|answer|option))\b/i,
          ],
        },
      ],
    },
  },

  bamboo: {
    name: "Bamboo",
    description:
      "Hyper-focused, interest-driven processing. You lock onto what " +
      "lights you up with total intensity. Urgent interest is your fuel, " +
      "and when the storm hits you bend \u2014 elastic, not brittle.",
    dimensions: {
      processing: {
        name: "Hyper-Focused Processing",
        markers: [
          { pattern: /\b(I('ve| have) been (deep|buried|immersed|lost) in)\b/i, label: "signalling a deep-dive state" },
          { pattern: /\b(I (found|discovered|noticed|mapped out|built) (something|a pattern|the))\b/i, label: "surfacing discoveries from focus sessions" },
          { pattern: /\b(let me show you (what I|the))\b/i, label: "sharing the output of concentrated work" },
          { pattern: /\b(I('ve| have) (mapped|documented|traced|diagrammed|prototyped) (every|the entire|the whole|all))\b/i, label: "producing exhaustive detail from focus" },
          { pattern: /\b(I (can't|couldn't) stop (thinking about|working on|digging into))\b/i, label: "locked into a hyper-focus tunnel" },
          { pattern: /\b(I went down (a|the) rabbit hole)\b/i, label: "acknowledging a focus spiral" },
        ],
      },
      activation: {
        name: "Urgent Interest Activation",
        markers: [
          { pattern: /\b(this (changes|is going to change) everything)\b/i, label: "activated by paradigm-shifting interest" },
          { pattern: /\b(I('m| am) (so |really )?(excited|energised|energized|fired up|pumped) about)\b/i, label: "energised by the pull of a new interest" },
          { pattern: /\b(this is (the thing|what) we (need|should|have) to (focus on|build|solve|do))\b/i, label: "channelling urgency toward a singular target" },
          { pattern: /\b(I('ve| have) (found|got|figured out) the (key|answer|solution|missing piece))\b/i, label: "landing on a breakthrough with conviction" },
          { pattern: /\b(you (have|need) to (see|hear|read|try) this)\b/i, label: "sharing interest with contagious intensity" },
          { pattern: /\b(fascinating|incredible|brilliant|game[- ]changer)\b/i, label: "elevated activation language" },
        ],
      },
      storm: {
        name: "Elasticity During Storms",
        markers: [
          { pattern: /\b(we (can|could) (pivot|adapt|flex|shift|adjust))\b/i, label: "offering elastic pivots under pressure" },
          { pattern: /\b(there('s| is) another (way|angle|approach|path|option))\b/i, label: "seeing alternative routes when blocked" },
          { pattern: /\b(bend.{0,10}(not|don't|won't) break)\b/i, label: "naming the elastic identity" },
          { pattern: /\b(let me try .{0,20}(different|new|another) (angle|approach|way))\b/i, label: "rotating quickly to a new approach" },
          { pattern: /\b(plan B|backup plan|contingency|fallback)\b/i, label: "always having an alternative ready" },
          { pattern: /\b(I('ll| will) (rework|rethink|retool|reimagine|reroute))\b/i, label: "rapidly reprocessing under constraint" },
          { pattern: /\b(bounce back|come back (stronger|smarter|sharper))\b/i, label: "naming resilience as spring-loaded" },
        ],
      },
    },
    tumbleweed: {
      summary: "scattered, diffuse, and going rigid",
      markers: [
        {
          category: "scattering",
          label: "scattering your attention across everything instead of locking in",
          patterns: [
            /\b(I (can't|cannot) (focus|concentrate|think straight))\b/i,
            /\b(there('s| is) (too|so) much (going on|to do|on my plate))\b/i,
            /\b(I keep (jumping|bouncing|switching) between)\b/i,
            /\b(I don't (know|have any idea) where to (start|begin|focus))\b/i,
            /\b(everything (feels|seems|is) (equally )?(urgent|important|on fire))\b/i,
            /\b(I('m| am) (all over the place|spread (too )?thin|pulled in .{0,15}directions))\b/i,
          ],
        },
        {
          category: "interest-collapse",
          label: "losing the spark of interest that normally drives you",
          patterns: [
            /\b(I don't (care|see the point|feel (anything|motivated|inspired)))\b/i,
            /\b(what('s| is) the point|does it (even )?matter|why bother)\b/i,
            /\b(nothing (is )?exciting|I('m| am) (bored|numb|checked out|flat))\b/i,
            /\b(I('m| am) just (going through the motions|phoning it in))\b/i,
            /\b(it all (feels|looks) the same)\b/i,
          ],
        },
        {
          category: "going-rigid",
          label: "going rigid where you would normally bend",
          patterns: [
            /\b(there('s| is) (only )?one (way|option|path|answer))\b/i,
            /\b(we (can't|cannot|must not) (change|deviate|pivot|adjust))\b/i,
            /\b(this is (the|my) (only|final) (plan|approach|answer))\b/i,
            /\b(no (more )?changes|stop (changing|moving|pivoting))\b/i,
            /\b(it has to be (exactly|precisely) (this|the) way)\b/i,
            /\b(I('m| am) not (budging|moving|changing|flexible) on (this|that))\b/i,
          ],
        },
      ],
    },
  },
};

// ===== 2. Helpers ===========================================================

function extractExcerpt(text, index, matchLength) {
  const WINDOW = 40;
  const start = Math.max(0, index - WINDOW);
  const end = Math.min(text.length, index + matchLength + WINDOW);
  let excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";
  return excerpt;
}

/**
 * Score an email against all three dimensions of a species.
 * Returns {
 *   totalScore, dimensionScores: { processing, activation, storm },
 *   matchedDimensions: [{ dimension, name, hits: [{ label, excerpt }] }]
 * }
 */
function scoreSpecies(text, species) {
  let totalScore = 0;
  const dimensionScores = {};
  const matchedDimensions = [];

  for (const [dimKey, dim] of Object.entries(species.dimensions)) {
    const hits = [];
    const seenLabels = new Set();

    for (const { pattern, label } of dim.markers) {
      const match = text.match(pattern);
      if (match && !seenLabels.has(label)) {
        seenLabels.add(label);
        hits.push({ label, excerpt: extractExcerpt(text, match.index, match[0].length) });
      }
    }

    dimensionScores[dimKey] = hits.length;
    totalScore += hits.length;

    if (hits.length > 0) {
      matchedDimensions.push({ dimension: dimKey, name: dim.name, hits });
    }
  }

  return { totalScore, dimensionScores, matchedDimensions };
}

/**
 * Detect species-specific tumbleweed markers.
 * If a species is provided, check only that species' anti-patterns.
 * If no species detected, check ALL species' tumbleweed markers and return
 * whichever fires — this can help surface the hidden species.
 */
function detectTumbleweed(text, species) {
  const results = [];
  const markersToCheck = species
    ? [{ species, markers: species.tumbleweed.markers }]
    : Object.values(SPECIES).map((s) => ({ species: s, markers: s.tumbleweed.markers }));

  for (const { species: sp, markers } of markersToCheck) {
    for (const marker of markers) {
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
          forSpecies: sp.name,
          excerpts,
        });
      }
    }
  }

  return results;
}

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

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== 3. Public API ========================================================

/**
 * Analyse an email body and return structured results.
 */
function analyseEmail(emailBody) {
  // Score all three species.
  const scores = {};
  for (const [key, sp] of Object.entries(SPECIES)) {
    scores[key] = { species: sp, ...scoreSpecies(emailBody, sp) };
  }

  // Pick the dominant species (highest totalScore, or null).
  let dominant = null;
  let dominantResult = null;

  for (const result of Object.values(scores)) {
    if (result.totalScore > 0 && (!dominantResult || result.totalScore > dominantResult.totalScore)) {
      dominant = result.species;
      dominantResult = result;
    }
  }

  // Detect tumbleweed for the dominant species (or broadly if none found).
  const tumbleweedHits = detectTumbleweed(emailBody, dominant);

  const speciesResult = {
    species: dominant,
    matchedDimensions: dominantResult ? dominantResult.matchedDimensions : [],
    score: dominantResult ? dominantResult.totalScore : 0,
  };

  const mirror = buildMirrorPlain(speciesResult, tumbleweedHits);
  const mirrorHtml = buildMirrorHtml(speciesResult, tumbleweedHits);

  return {
    species: dominant ? { name: dominant.name, description: dominant.description } : null,
    speciesScore: speciesResult.score,
    matchedDimensions: speciesResult.matchedDimensions,
    tumbleweedHits,
    mirror,
    mirrorHtml,
  };
}

// ===== 4. Plain-text Mirror =================================================

function buildMirrorPlain(speciesResult, tumbleweedHits) {
  const lines = [];
  const { species, matchedDimensions, score } = speciesResult;

  lines.push("=".repeat(68));
  lines.push("  SPECIES BLUEPRINT MIRROR");
  lines.push("=".repeat(68));
  lines.push("");

  if (!species) {
    lines.push("  I couldn't detect a clear species pattern in this email.");
    lines.push("  This itself may be a signal \u2014 when we're fully in");
    lines.push("  Tumbleweed mode, our natural voice goes quiet.");
    lines.push("");
  } else {
    lines.push(`  Detected species:  ${species.name}`);
    lines.push(`  Pattern strength:  ${score} marker(s) across ${matchedDimensions.length} dimension(s)`);
    lines.push("");
    lines.push(wrapText(`${species.name} essence: ${species.description}`, 66, 2));
    lines.push("");

    for (const dim of matchedDimensions) {
      lines.push(`  [${dim.name}]`);
      for (const hit of dim.hits) {
        lines.push(`    - ${hit.label}`);
        lines.push(`      "${hit.excerpt}"`);
      }
      lines.push("");
    }
  }

  lines.push("-".repeat(68));
  lines.push("  TUMBLEWEED SHIFT DETECTION");
  if (species) {
    lines.push(`  (Acting against ${species.name} blueprint: ${species.tumbleweed.summary})`);
  }
  lines.push("-".repeat(68));
  lines.push("");

  if (tumbleweedHits.length === 0) {
    lines.push("  No Tumbleweed shifts detected. You appear rooted.");
    lines.push("");
  } else {
    lines.push(`  ${tumbleweedHits.length} Tumbleweed shift(s) detected:`);
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

  lines.push("-".repeat(68));
  lines.push("  YOUR MIRROR REFLECTION");
  lines.push("-".repeat(68));
  lines.push("");
  lines.push(buildReflectionText(species, matchedDimensions, tumbleweedHits, 68, 2));
  lines.push("");
  lines.push("=".repeat(68));

  return lines.join("\n");
}

// ===== 5. HTML Mirror (for email replies) ===================================

function buildMirrorHtml(speciesResult, tumbleweedHits) {
  const { species, matchedDimensions, score } = speciesResult;
  const parts = [];

  parts.push('<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">');
  parts.push('<h2 style="text-align: center; border-bottom: 2px solid #4a7c59; padding-bottom: 8px; color: #4a7c59;">Species Blueprint Mirror</h2>');

  if (!species) {
    parts.push('<p style="color: #8b6914; font-style: italic;">');
    parts.push("I couldn't detect a clear species pattern in this email. ");
    parts.push("This itself may be a signal &mdash; when we're fully in Tumbleweed mode, our natural voice goes quiet.");
    parts.push("</p>");
  } else {
    const colors = { Baobab: "#6b4226", Mangrove: "#2e7d6e", Bamboo: "#5a7d1a" };
    const color = colors[species.name] || "#4a7c59";
    parts.push(`<h3 style="color: ${color}; margin-bottom: 4px;">Detected species: ${esc(species.name)}</h3>`);
    parts.push(`<p style="color: #555; margin-top: 0;"><em>${esc(species.description)}</em></p>`);
    parts.push(`<p style="color: #777; font-size: 0.9em;">Pattern strength: ${score} marker(s) across ${matchedDimensions.length} dimension(s)</p>`);

    for (const dim of matchedDimensions) {
      parts.push(`<p style="margin-bottom: 4px;"><strong>${esc(dim.name)}</strong></p>`);
      parts.push("<ul>");
      for (const hit of dim.hits) {
        parts.push(`<li><strong>${esc(hit.label)}</strong><br/><span style="color:#777; font-size:0.9em;">"${esc(hit.excerpt)}"</span></li>`);
      }
      parts.push("</ul>");
    }
  }

  // --- Tumbleweed ---
  const twHeader = species
    ? `Tumbleweed Shift Detection <span style="font-weight:normal;font-size:0.85em;">(anti-${esc(species.name)}: ${esc(species.tumbleweed.summary)})</span>`
    : "Tumbleweed Shift Detection";
  parts.push(`<h3 style="border-top: 1px solid #ccc; padding-top: 12px; color: #b8860b;">${twHeader}</h3>`);

  if (tumbleweedHits.length === 0) {
    parts.push('<p style="color: #4a7c59;"><strong>No Tumbleweed shifts detected.</strong> You appear rooted.</p>');
  } else {
    parts.push(`<p>${tumbleweedHits.length} Tumbleweed shift(s) detected:</p>`);
    for (const hit of tumbleweedHits) {
      parts.push(`<p style="margin-bottom: 2px;"><strong style="color: #b8860b;">${esc(hit.category.toUpperCase())}</strong></p>`);
      parts.push(`<p style="margin-top: 0; margin-bottom: 2px;">${esc(hit.label)}</p>`);
      parts.push("<ul>");
      for (const excerpt of hit.excerpts) {
        parts.push(`<li style="color:#777; font-size:0.9em;">"${esc(excerpt)}"</li>`);
      }
      parts.push("</ul>");
    }
  }

  // --- Reflection ---
  parts.push('<div style="background: #f7f3e9; border-left: 4px solid #4a7c59; padding: 16px; margin-top: 16px;">');
  parts.push('<h3 style="margin-top: 0; color: #4a7c59;">Your Mirror Reflection</h3>');
  const reflectionText = buildReflectionText(species, matchedDimensions, tumbleweedHits, Infinity, 0);
  parts.push(`<p style="font-size: 1.05em; line-height: 1.6;">${esc(reflectionText)}</p>`);
  parts.push("</div>");

  parts.push("</div>");

  return parts.join("\n");
}

// ===== 6. Shared Reflection Builder =========================================

function buildReflectionText(species, matchedDimensions, tumbleweedHits, width, indent) {
  let text;

  if (species && tumbleweedHits.length > 0) {
    // Pick the strongest rooted dimension to name in the reflection.
    const strongestDim = matchedDimensions.length > 0
      ? matchedDimensions[0].name
      : Object.values(species.dimensions)[0].name;

    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    text =
      `Your natural ${species.name} pattern is ${strongestDim}. ` +
      `This email shows you shifting into a Tumbleweed state by ${shiftActions}. ` +
      `A ${species.name} in Tumbleweed looks like ${species.tumbleweed.summary}. ` +
      `How can you return to your roots?`;
  } else if (species && tumbleweedHits.length === 0) {
    const strongestDim = matchedDimensions.length > 0
      ? matchedDimensions[0].name
      : Object.values(species.dimensions)[0].name;

    text =
      `Your natural ${species.name} pattern is ${strongestDim}, ` +
      `and this email reads as rooted. You're operating from your trunk. Keep going.`;
  } else if (!species && tumbleweedHits.length > 0) {
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    const inferredSpecies = tumbleweedHits[0].forSpecies;
    text =
      `Your species pattern isn't coming through in this email \u2014 ` +
      `which may mean the Tumbleweed state has taken over. ` +
      `I see you ${shiftActions}. ` +
      `These shifts suggest a ${inferredSpecies} acting against their blueprint. ` +
      `Pause. Write one sentence from your rooted ${inferredSpecies} voice and start again.`;
  } else {
    text =
      "This email is neutral \u2014 no strong species signal and no " +
      "Tumbleweed shifts. If this is a routine message, that's fine. " +
      "If it's a message that matters to you, consider: what would " +
      "your rooted self want to say differently?";
  }

  return wrapText(text, width, indent);
}

// ===== Exports ==============================================================

module.exports = {
  SPECIES,
  analyseEmail,
  scoreSpecies,
  detectTumbleweed,
};
