"use strict";

// ---------------------------------------------------------------------------
// Daily Audit Engine — Pattern Alignment from Behavioral Metadata
//
// Unlike the email engine (content analysis), this engine measures whether
// your DAY structurally supported your species' blueprint.
//
// Input:  { species, calendarEvents: [{ start, end }], sentEmails: [{ timestamp }] }
// Output: Growth Ring — constraints detected + species-specific re-rooting actions.
// ---------------------------------------------------------------------------

const { SPECIES } = require("./species-engine");

// ===== 1. Time Helpers ======================================================

/**
 * Parse "HH:MM" into minutes-since-midnight.
 */
function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Duration in minutes between two "HH:MM" strings.
 */
function durationMinutes(start, end) {
  return parseTime(end) - parseTime(start);
}

// ===== 2. Metric Extractors =================================================

/**
 * From a sorted list of calendar events, compute:
 *   - totalMeetingMinutes
 *   - bufferGaps: [{ afterEvent, beforeEvent, gapMinutes }]
 *   - shortestBuffer: number | null
 */
function computeCalendarMetrics(events) {
  if (!events || events.length === 0) {
    return { totalMeetingMinutes: 0, bufferGaps: [], shortestBuffer: null };
  }

  // Sort by start time.
  const sorted = [...events].sort((a, b) => parseTime(a.start) - parseTime(b.start));

  let totalMeetingMinutes = 0;
  const bufferGaps = [];

  for (let i = 0; i < sorted.length; i++) {
    totalMeetingMinutes += durationMinutes(sorted[i].start, sorted[i].end);

    if (i > 0) {
      const gap = parseTime(sorted[i].start) - parseTime(sorted[i - 1].end);
      bufferGaps.push({
        afterEvent: sorted[i - 1].title || `Event ${i}`,
        beforeEvent: sorted[i].title || `Event ${i + 1}`,
        gapMinutes: gap,
      });
    }
  }

  const shortestBuffer = bufferGaps.length > 0
    ? Math.min(...bufferGaps.map((g) => g.gapMinutes))
    : null;

  return { totalMeetingMinutes, bufferGaps, shortestBuffer };
}

/**
 * From a list of sent-email timestamps, compute:
 *   - totalSent: number
 *   - peakHourSent: number  (emails sent between peakStart–peakEnd)
 *   - estimatedEmailMinutes: totalSent * minutesPerEmail
 */
function computeEmailMetrics(sentEmails, peakStart, peakEnd) {
  if (!sentEmails || sentEmails.length === 0) {
    return { totalSent: 0, peakHourSent: 0, estimatedEmailMinutes: 0 };
  }

  const peakStartMin = parseTime(peakStart);
  const peakEndMin = parseTime(peakEnd);
  const MINUTES_PER_EMAIL = 3;

  let peakHourSent = 0;
  for (const email of sentEmails) {
    const t = parseTime(email.timestamp);
    if (t >= peakStartMin && t < peakEndMin) peakHourSent++;
  }

  return {
    totalSent: sentEmails.length,
    peakHourSent,
    estimatedEmailMinutes: sentEmails.length * MINUTES_PER_EMAIL,
  };
}

// ===== 3. Growth Challenge Rules ============================================

const GROWTH_CHALLENGES = {
  baobab: {
    id: "fragmentation",
    name: "Fragmentation",
    test(calMetrics, _emailMetrics) {
      // A Baobab needs buffer for internal processing.
      // Flag if any gap between meetings is < 15 minutes.
      const fragmented = calMetrics.bufferGaps.filter((g) => g.gapMinutes < 15);
      if (fragmented.length === 0) return null;
      return {
        constraint: "Fragmentation",
        detail:
          `${fragmented.length} transition(s) with less than 15 minutes of buffer. ` +
          `Your Think-to-Talk processing needs unbroken space to complete a thought ` +
          `before the next input arrives.`,
        evidence: fragmented.map(
          (g) => `${g.gapMinutes} min between "${g.afterEvent}" and "${g.beforeEvent}"`
        ),
        action:
          "Block at least one 30-minute 'processing hold' between your densest meetings. " +
          "Treat it like a meeting with yourself — your Baobab trunk needs that stillness to produce its best output.",
      };
    },
  },

  mangrove: {
    id: "isolation",
    name: "Isolation",
    test(calMetrics, emailMetrics) {
      // A Mangrove needs social interaction to think.
      // Flag if total meeting + email time < 120 minutes.
      const socialMinutes = calMetrics.totalMeetingMinutes + emailMetrics.estimatedEmailMinutes;
      if (socialMinutes >= 120) return null;
      return {
        constraint: "Isolation",
        detail:
          `Only ${socialMinutes} minutes of social-processing time today ` +
          `(${calMetrics.totalMeetingMinutes} min in meetings + ~${emailMetrics.estimatedEmailMinutes} min in email). ` +
          `Your Talk-to-Think processing needs interaction to form ideas — ` +
          `below 2 hours, you're running on fumes.`,
        evidence: [
          `${calMetrics.totalMeetingMinutes} min of meetings`,
          `${emailMetrics.totalSent} emails sent (~${emailMetrics.estimatedEmailMinutes} min)`,
          `${socialMinutes} min total social processing (threshold: 120 min)`,
        ],
        action:
          "Schedule a 20-minute 'thinking-out-loud' call with a trusted colleague, " +
          "or send a voice memo instead of an email. Your Mangrove roots grow in the space between people.",
      };
    },
  },

  bamboo: {
    id: "maintenance-friction",
    name: "Maintenance Friction",
    peakStart: "09:00",
    peakEnd: "12:00",
    test(_calMetrics, emailMetrics) {
      // A Bamboo's peak hours should be spent on interest-driven output.
      // Low sent volume during peak hours suggests admin/maintenance is
      // crowding out the hyper-focus window.
      if (emailMetrics.peakHourSent >= 3) return null;
      return {
        constraint: "Maintenance Friction",
        detail:
          `Only ${emailMetrics.peakHourSent} email(s) sent during your peak focus window ` +
          `(9:00–12:00). Your Hyper-Focused Processing is strongest in this window — ` +
          `low output suggests maintenance tasks are absorbing your activation energy.`,
        evidence: [
          `${emailMetrics.peakHourSent} emails sent during peak hours (9:00–12:00)`,
          `${emailMetrics.totalSent} emails sent all day`,
        ],
        action:
          "Batch all admin, Slack, and routine replies to after 12:00. " +
          "Protect your morning for the one thing that lights you up. " +
          "A Bamboo in flow doesn't need permission to go deep — clear the runway.",
      };
    },
  },
};

// ===== 4. Public API ========================================================

/**
 * Audit a day's metadata against a species blueprint.
 *
 * @param {object} input
 * @param {string} input.species - "baobab" | "mangrove" | "bamboo"
 * @param {Array}  input.calendarEvents - [{ start: "HH:MM", end: "HH:MM", title? }]
 * @param {Array}  input.sentEmails - [{ timestamp: "HH:MM" }]
 *
 * @returns {{ species, metrics, challenge, growthRing, growthRingHtml }}
 */
function auditDay(input) {
  const speciesKey = (input.species || "").toLowerCase();
  const species = SPECIES[speciesKey];

  if (!species) {
    const valid = Object.keys(SPECIES).join(", ");
    throw new Error(`Unknown species "${input.species}". Valid: ${valid}`);
  }

  const rule = GROWTH_CHALLENGES[speciesKey];

  // Compute metrics.
  const calMetrics = computeCalendarMetrics(input.calendarEvents);

  const peakStart = rule.peakStart || "09:00";
  const peakEnd = rule.peakEnd || "12:00";
  const emailMetrics = computeEmailMetrics(input.sentEmails, peakStart, peakEnd);

  // Run the species-specific challenge test.
  const challenge = rule.test(calMetrics, emailMetrics);

  // Build outputs.
  const growthRing = buildGrowthRingPlain(species, calMetrics, emailMetrics, challenge);
  const growthRingHtml = buildGrowthRingHtml(species, calMetrics, emailMetrics, challenge);

  return {
    species: { name: species.name, description: species.description },
    metrics: { calendar: calMetrics, email: emailMetrics },
    challenge,
    growthRing,
    growthRingHtml,
  };
}

// ===== 5. Plain-text Growth Ring ============================================

function buildGrowthRingPlain(species, calMetrics, emailMetrics, challenge) {
  const lines = [];

  lines.push("=".repeat(68));
  lines.push("  DAILY GROWTH RING");
  lines.push("=".repeat(68));
  lines.push("");
  lines.push(`  Species:  ${species.name}`);
  lines.push("");

  // --- Metrics ---
  lines.push("  Today's metadata:");
  lines.push(`    Meetings:       ${calMetrics.totalMeetingMinutes} min total`);
  if (calMetrics.shortestBuffer !== null) {
    lines.push(`    Shortest gap:   ${calMetrics.shortestBuffer} min`);
  }
  lines.push(`    Emails sent:    ${emailMetrics.totalSent} (${emailMetrics.peakHourSent} during peak hours)`);
  lines.push("");

  // --- Challenge or Rooted ---
  lines.push("-".repeat(68));

  if (!challenge) {
    lines.push("  No Growth Challenges detected. Your day aligned with your");
    lines.push(`  ${species.name} blueprint. Another ring of solid growth.`);
    lines.push("-".repeat(68));
    lines.push("");
    lines.push(`  Today your ${species.name} pattern was structurally supported.`);
    lines.push("  Keep building on this rhythm tomorrow.");
  } else {
    lines.push(`  GROWTH CHALLENGE DETECTED: ${challenge.constraint.toUpperCase()}`);
    lines.push("-".repeat(68));
    lines.push("");
    lines.push(`  ${challenge.detail}`);
    lines.push("");

    if (challenge.evidence.length > 0) {
      lines.push("  Evidence:");
      for (const e of challenge.evidence) {
        lines.push(`    - ${e}`);
      }
      lines.push("");
    }

    lines.push("  " + "-".repeat(40));
    lines.push("  YOUR DAILY GROWTH RING");
    lines.push("  " + "-".repeat(40));
    lines.push("");
    lines.push(
      wrapText(
        `Today your pattern was challenged by ${challenge.constraint}. ` +
        `To return to your natural ${species.name} pattern tomorrow, ` +
        `try: ${challenge.action}`,
        66, 2
      )
    );
  }

  lines.push("");
  lines.push("=".repeat(68));

  return lines.join("\n");
}

// ===== 6. HTML Growth Ring ==================================================

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildGrowthRingHtml(species, calMetrics, emailMetrics, challenge) {
  const colors = { Baobab: "#6b4226", Mangrove: "#2e7d6e", Bamboo: "#5a7d1a" };
  const color = colors[species.name] || "#4a7c59";
  const parts = [];

  parts.push('<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">');
  parts.push(`<h2 style="text-align: center; border-bottom: 2px solid ${color}; padding-bottom: 8px; color: ${color};">Daily Growth Ring</h2>`);
  parts.push(`<p style="color: #777; font-size: 0.9em;">Species: <strong style="color: ${color};">${esc(species.name)}</strong></p>`);

  // --- Metrics ---
  parts.push('<table style="width: 100%; border-collapse: collapse; font-size: 0.95em; margin-bottom: 16px;">');
  parts.push(`<tr><td style="padding: 4px 8px; color: #555;">Meetings</td><td style="padding: 4px 8px;"><strong>${calMetrics.totalMeetingMinutes} min</strong></td></tr>`);
  if (calMetrics.shortestBuffer !== null) {
    parts.push(`<tr><td style="padding: 4px 8px; color: #555;">Shortest buffer</td><td style="padding: 4px 8px;"><strong>${calMetrics.shortestBuffer} min</strong></td></tr>`);
  }
  parts.push(`<tr><td style="padding: 4px 8px; color: #555;">Emails sent</td><td style="padding: 4px 8px;"><strong>${emailMetrics.totalSent}</strong> (${emailMetrics.peakHourSent} during peak hours)</td></tr>`);
  parts.push("</table>");

  // --- Challenge or Rooted ---
  if (!challenge) {
    parts.push(`<div style="background: #f0f7f0; border-left: 4px solid ${color}; padding: 16px;">`);
    parts.push(`<p style="color: ${color}; margin-top: 0;"><strong>No Growth Challenges detected.</strong></p>`);
    parts.push(`<p style="line-height: 1.6;">Your day aligned with your ${esc(species.name)} blueprint. Another ring of solid growth. Keep building on this rhythm tomorrow.</p>`);
    parts.push("</div>");
  } else {
    parts.push('<div style="background: #fdf6e3; border-left: 4px solid #b8860b; padding: 16px;">');
    parts.push(`<h3 style="color: #b8860b; margin-top: 0;">Growth Challenge Detected: ${esc(challenge.constraint)}</h3>`);
    parts.push(`<p style="line-height: 1.6;">${esc(challenge.detail)}</p>`);

    if (challenge.evidence.length > 0) {
      parts.push("<ul>");
      for (const e of challenge.evidence) {
        parts.push(`<li style="color: #777; font-size: 0.9em;">${esc(e)}</li>`);
      }
      parts.push("</ul>");
    }

    parts.push('<div style="background: #f7f3e9; border-left: 4px solid #4a7c59; padding: 12px; margin-top: 12px;">');
    parts.push('<p style="margin-top: 0; color: #4a7c59;"><strong>Your Daily Growth Ring</strong></p>');
    parts.push(
      `<p style="font-size: 1.05em; line-height: 1.6;">` +
      `Today your pattern was challenged by <strong>${esc(challenge.constraint)}</strong>. ` +
      `To return to your natural <strong>${esc(species.name)}</strong> pattern tomorrow, ` +
      `try: ${esc(challenge.action)}</p>`
    );
    parts.push("</div>");
    parts.push("</div>");
  }

  parts.push('<p style="margin-top: 24px; color: #999; font-size: 0.85em;">&mdash; Daily Growth Ring &bull; a pattern alignment tool, not advice</p>');
  parts.push("</div>");

  return parts.join("\n");
}

// ===== 7. Text Wrap (shared) ================================================

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

// ===== Exports ==============================================================

module.exports = {
  auditDay,
  GROWTH_CHALLENGES,
  computeCalendarMetrics,
  computeEmailMetrics,
};
