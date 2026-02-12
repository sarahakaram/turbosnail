// ---------------------------------------------------------------------------
// Species Blueprint — Zapier "Code by Zapier" Step  (v2)
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
// For local testing you can still run:  node zapier-step.js
// ---------------------------------------------------------------------------

// ===== Engine (inlined for Zapier sandbox — v2 three-species model) =========

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

// ===== Helpers ==============================================================

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
    if (hits.length > 0) matchedDimensions.push({ dimension: dimKey, name: dim.name, hits });
  }
  return { totalScore, dimensionScores, matchedDimensions };
}

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
        if (match) excerpts.push(extractExcerpt(text, match.index, match[0].length));
      }
      if (excerpts.length > 0) {
        results.push({ category: marker.category, label: marker.label, forSpecies: sp.name, excerpts });
      }
    }
  }
  return results;
}

function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ===== Build the HTML reply =================================================

function buildReplyHtml(senderName, species, matchedDimensions, tumbleweedHits) {
  const greeting = senderName ? `Hi ${esc(senderName)},` : "Hi,";
  const parts = [];

  parts.push(`<div style="font-family: Georgia, serif; max-width: 600px; color: #333;">`);
  parts.push(`<p>${greeting}</p>`);
  parts.push(`<p>Here's the mirror for the email you just sent.</p>`);

  parts.push(`<h2 style="border-bottom: 2px solid #4a7c59; padding-bottom: 8px; color: #4a7c59;">Species Blueprint Mirror</h2>`);

  if (!species) {
    parts.push(`<p style="color: #8b6914; font-style: italic;">`);
    parts.push(`I couldn't detect a clear species pattern in this email. `);
    parts.push(`This itself may be a signal &mdash; when we're fully in Tumbleweed mode, our natural voice goes quiet.`);
    parts.push(`</p>`);
  } else {
    const colors = { Baobab: "#6b4226", Mangrove: "#2e7d6e", Bamboo: "#5a7d1a" };
    const color = colors[species.name] || "#4a7c59";
    parts.push(`<h3 style="color: ${color}; margin-bottom: 4px;">Detected species: ${esc(species.name)}</h3>`);
    parts.push(`<p style="color: #555; margin-top: 0;"><em>${esc(species.description)}</em></p>`);
    parts.push(`<p style="color: #777; font-size: 0.9em;">Pattern strength: ${matchedDimensions.reduce((n, d) => n + d.hits.length, 0)} marker(s) across ${matchedDimensions.length} dimension(s)</p>`);

    for (const dim of matchedDimensions) {
      parts.push(`<p style="margin-bottom:4px;"><strong>${esc(dim.name)}</strong></p><ul>`);
      for (const hit of dim.hits) {
        parts.push(`<li><strong>${esc(hit.label)}</strong><br/><span style="color:#777;font-size:0.9em;">"${esc(hit.excerpt)}"</span></li>`);
      }
      parts.push(`</ul>`);
    }
  }

  // --- Tumbleweed ---
  const twHeader = species
    ? `Tumbleweed Shift Detection <span style="font-weight:normal;font-size:0.85em;">(anti-${esc(species.name)}: ${esc(species.tumbleweed.summary)})</span>`
    : "Tumbleweed Shift Detection";
  parts.push(`<h3 style="border-top: 1px solid #ccc; padding-top: 12px; color: #b8860b;">${twHeader}</h3>`);

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
    const strongestDim = matchedDimensions.length > 0 ? matchedDimensions[0].name : Object.values(species.dimensions)[0].name;
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    reflection =
      `Your natural ${species.name} pattern is <strong>${esc(strongestDim)}</strong>. ` +
      `This email shows you shifting into a Tumbleweed state by ${esc(shiftActions)}. ` +
      `A ${esc(species.name)} in Tumbleweed looks like ${esc(species.tumbleweed.summary)}. ` +
      `<em>How can you return to your roots?</em>`;
  } else if (species && tumbleweedHits.length === 0) {
    const strongestDim = matchedDimensions.length > 0 ? matchedDimensions[0].name : Object.values(species.dimensions)[0].name;
    reflection =
      `Your natural ${species.name} pattern is <strong>${esc(strongestDim)}</strong>, ` +
      `and this email reads as rooted. You're operating from your trunk. Keep going.`;
  } else if (!species && tumbleweedHits.length > 0) {
    const shiftActions = tumbleweedHits.map((h) => h.label).join("; ");
    const inferredSpecies = tumbleweedHits[0].forSpecies;
    reflection =
      `Your species pattern isn't coming through in this email &mdash; ` +
      `which may mean the Tumbleweed state has taken over. ` +
      `I see you ${esc(shiftActions)}. ` +
      `These shifts suggest a ${esc(inferredSpecies)} acting against their blueprint. ` +
      `Pause. Write one sentence from your rooted ${esc(inferredSpecies)} voice and start again.`;
  } else {
    reflection =
      `This email is neutral &mdash; no strong species signal and no ` +
      `Tumbleweed shifts. If this is a routine message, that's fine. ` +
      `If it's a message that matters to you, consider: what would ` +
      `your rooted self want to say differently?`;
  }

  parts.push(`<p style="font-size:1.05em;line-height:1.6;">${reflection}</p>`);
  parts.push(`</div>`);
  parts.push(`<p style="margin-top:24px;color:#999;font-size:0.85em;">&mdash; Species Blueprint Mirror &bull; a coaching tool, not advice</p>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ===== Zapier entry point ===================================================

async function run() {
  let input;
  if (typeof inputData !== "undefined") {
    input = inputData;
  } else {
    input = {
      emailBody: `
So good seeing you in person today, Evan! Thanks for hosting me. Love
the South Park Commons space and the creative energy.

Below is a bio and here is my website if you want to add it as a
potential service for your community. I'm also happy to offer a promo
rate if that's of interest.

Hope to see you again in person soon!

Sarah`,
      senderName: "Sarah",
    };
    console.log("(Running in local test mode)\n");
  }

  const emailBody = (input.emailBody || "").trim();
  const senderName = (input.senderName || "").trim();

  if (!emailBody) {
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
  const scores = {};
  for (const [key, sp] of Object.entries(SPECIES)) {
    scores[key] = { species: sp, ...scoreSpecies(emailBody, sp) };
  }

  let dominant = null;
  let dominantResult = null;
  for (const result of Object.values(scores)) {
    if (result.totalScore > 0 && (!dominantResult || result.totalScore > dominantResult.totalScore)) {
      dominant = result.species;
      dominantResult = result;
    }
  }

  const matchedDimensions = dominantResult ? dominantResult.matchedDimensions : [];
  const tumbleweedHits = detectTumbleweed(emailBody, dominant);

  // --- Build outputs ---
  const replyHtml = buildReplyHtml(senderName, dominant, matchedDimensions, tumbleweedHits);

  let reflectionPlain;
  if (dominant && tumbleweedHits.length > 0) {
    const dim = matchedDimensions.length > 0 ? matchedDimensions[0].name : Object.values(dominant.dimensions)[0].name;
    reflectionPlain =
      `Your natural ${dominant.name} pattern is ${dim}. ` +
      `This email shows you shifting into a Tumbleweed state by ` +
      `${tumbleweedHits.map((h) => h.label).join("; ")}. ` +
      `A ${dominant.name} in Tumbleweed looks like ${dominant.tumbleweed.summary}. ` +
      `How can you return to your roots?`;
  } else if (dominant) {
    const dim = matchedDimensions.length > 0 ? matchedDimensions[0].name : Object.values(dominant.dimensions)[0].name;
    reflectionPlain = `Your natural ${dominant.name} pattern is ${dim}, and this email reads as rooted. Keep going.`;
  } else if (tumbleweedHits.length > 0) {
    reflectionPlain =
      `Your species pattern isn't visible here. I see you ` +
      `${tumbleweedHits.map((h) => h.label).join("; ")}. ` +
      `Pause \u2014 which species feels like home?`;
  } else {
    reflectionPlain = "Neutral email \u2014 no strong species signal or Tumbleweed shifts.";
  }

  const result = {
    replySubject: "Your Species Blueprint Mirror",
    replyHtml,
    species: dominant ? dominant.name : "undetected",
    tumbleweedCount: tumbleweedHits.length,
    tumbleweedCategories: tumbleweedHits.map((h) => h.category).join(", "),
    reflectionPlain,
  };

  if (typeof output !== "undefined") {
    output = result;
  } else {
    console.log("===== REPLY HTML =====\n");
    console.log(result.replyHtml);
    console.log("\n===== STRUCTURED OUTPUT =====\n");
    console.log(JSON.stringify(result, null, 2));
  }
}

run();
