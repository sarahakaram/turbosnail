#!/usr/bin/env node

"use strict";

// ---------------------------------------------------------------------------
// Daily Growth Ring — CLI entry point
//
// Usage:
//   node audit-day.js                           (runs built-in demos for all 3 species)
//   node audit-day.js --species baobab < day.json
//   node audit-day.js --file day.json           (JSON must include "species")
//   echo '{ ... }' | node audit-day.js --species mangrove
// ---------------------------------------------------------------------------

const fs = require("fs");
const { auditDay } = require("./daily-audit-engine");

// ===== Input Handling =======================================================

function readInput() {
  const args = process.argv.slice(2);

  // --file path/to/day.json
  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    const filePath = args[fileIdx + 1];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: file not found — ${filePath}`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  return null;
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve(null); }
    });
    process.stdin.on("error", () => resolve(null));
  });
}

function getSpeciesArg() {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--species");
  return idx !== -1 && args[idx + 1] ? args[idx + 1].toLowerCase() : null;
}

// ===== Demo Data ============================================================

const DEMOS = {
  baobab: {
    label: "Baobab — back-to-back meetings, no buffer to process",
    input: {
      species: "baobab",
      calendarEvents: [
        { start: "09:00", end: "09:45", title: "Leadership sync" },
        { start: "09:50", end: "10:30", title: "Product review" },
        { start: "10:30", end: "11:15", title: "1:1 with COO" },
        { start: "11:15", end: "12:00", title: "Board prep" },
        { start: "13:00", end: "13:45", title: "Client call" },
        { start: "13:50", end: "14:30", title: "Hiring debrief" },
      ],
      sentEmails: [
        { timestamp: "08:30" },
        { timestamp: "12:10" },
        { timestamp: "12:25" },
        { timestamp: "14:45" },
        { timestamp: "15:10" },
        { timestamp: "16:00" },
      ],
    },
  },

  mangrove: {
    label: "Mangrove — light day, very few interactions",
    input: {
      species: "mangrove",
      calendarEvents: [
        { start: "10:00", end: "10:30", title: "Quick standup" },
      ],
      sentEmails: [
        { timestamp: "09:15" },
        { timestamp: "14:00" },
      ],
    },
  },

  bamboo: {
    label: "Bamboo — peak hours eaten by admin, low output when it matters",
    input: {
      species: "bamboo",
      calendarEvents: [
        { start: "09:00", end: "09:30", title: "All-hands" },
        { start: "10:00", end: "11:00", title: "Ops review" },
        { start: "14:00", end: "15:00", title: "Sprint planning" },
      ],
      sentEmails: [
        { timestamp: "09:45" },
        { timestamp: "12:30" },
        { timestamp: "13:15" },
        { timestamp: "15:30" },
        { timestamp: "16:00" },
      ],
    },
  },
};

// ===== Main =================================================================

async function main() {
  let input = readInput();

  if (!input) {
    input = await readStdin();
  }

  // Merge --species flag if provided.
  const speciesArg = getSpeciesArg();
  if (input && speciesArg) {
    input.species = speciesArg;
  }

  if (input && input.species) {
    // Run a single audit.
    const result = auditDay(input);
    console.log(result.growthRing);
    return;
  }

  // No input — run all three demos.
  console.log("(No input detected — running demos for all three species)\n");

  for (const [key, demo] of Object.entries(DEMOS)) {
    console.log(`\n>>> DEMO: ${demo.label}\n`);
    const result = auditDay(demo.input);
    console.log(result.growthRing);
    console.log("");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
