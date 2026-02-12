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
