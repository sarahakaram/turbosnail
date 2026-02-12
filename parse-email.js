#!/usr/bin/env node

"use strict";

// ---------------------------------------------------------------------------
// Species Blueprint Email Parser — CLI entry point
//
// Usage:
//   echo "email text" | node parse-email.js
//   node parse-email.js < email.txt
//   node parse-email.js --file path/to/email.txt
//   node parse-email.js --text "inline email body"
// ---------------------------------------------------------------------------

const fs = require("fs");
const { analyseEmail } = require("./species-engine");

// ===== Input Handling =======================================================

function readEmailFromArgs() {
  const args = process.argv.slice(2);

  const textIdx = args.indexOf("--text");
  if (textIdx !== -1 && args[textIdx + 1]) {
    return args[textIdx + 1];
  }

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

// ===== Demo Email ===========================================================

const DEMO_EMAIL = `
So good seeing you in person today, Evan! Thanks for hosting me. Love
the South Park Commons space and the creative energy.

Below is a bio and here is my website if you want to add it as a
potential service for your community. I'm also happy to offer a promo
rate if that's of interest.

Hope to see you again in person soon!

Sarah

Sarah helps founders upgrade their internal operating system, to best
support their external growth. A former Managing Director at Google,
she spent 12 years scaling teams and growing the mobile app store
business from $10M to $1B. Having also founded and exited a mobile
gaming startup, and developed new business lines at LivingSocial and
shopkick, Sarah understands the realities of hyper-growth from both
the founder and executive perspective.

Through her practice, Anbara, Sarah partners with leaders to unlock
autonomy, mastery, and purpose. She is a PCC-certified executive
coach, who is dedicated to helping leaders turn their unique identities
into their greatest leadership superpowers. Sarah is also an author of
a weekly leadership newsletter, The Wake Up, and serves as a board
member for Women of MENA in Tech.
`;

// ===== Main =================================================================

async function main() {
  let emailBody = readEmailFromArgs();

  if (!emailBody) {
    emailBody = await readEmailFromStdin();
  }

  if (!emailBody || emailBody.trim().length === 0) {
    emailBody = DEMO_EMAIL;
    console.log("(No input detected — running with built-in demo email)\n");
  }

  const result = analyseEmail(emailBody);
  console.log(result.mirror);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
