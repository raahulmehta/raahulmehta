#!/usr/bin/env node
/**
 * generate-readme.js
 *
 * Rebuilds the "Recent Work" table in README.md from projects-data.json.
 *
 * HOW TO ADD A NEW PROJECT:
 *   1. Open projects-data.json
 *   2. Add a new object to the array, e.g.:
 *      {
 *        "id": 20,
 *        "client": "My New Client",
 *        "link": "https://example.com",   // or null if no public link
 *        "description": "One or two sentences on what you actually built and shipped.",
 *        "stack": ["Next.js", "GSAP"],
 *        "period": "Jul 2026"
 *      }
 *   3. Run:  node generate-readme.js
 *   4. README.md is updated in place. Commit it.
 *
 * The script only touches the region between the markers:
 *   <!-- PROJECTS-TABLE:START -->
 *   <!-- PROJECTS-TABLE:END -->
 * Everything else in README.md is left untouched.
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "projects-data.json");
const README_FILE = path.join(__dirname, "README.md");

const START_MARKER = "<!-- PROJECTS-TABLE:START -->";
const END_MARKER = "<!-- PROJECTS-TABLE:END -->";

function loadProjects() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const projects = JSON.parse(raw);
  // Keep whatever order is in the JSON file (newest first is the convention used here).
  return projects;
}

function formatStack(stack) {
  return stack.map((s) => `\`${s}\``).join(" ");
}

function formatClientCell(project) {
  const label = `**${project.client}**`;
  if (project.link) {
    return `[${label}](${project.link})`;
  }
  return label;
}

function buildTable(projects) {
  const header =
    "| # | Client | What I Built | Stack | Period |\n" +
    "|---|--------|---------------|-------|--------|";

  const rows = projects.map((p, index) => {
    const num = String(index + 1).padStart(2, "0");
    return `| ${num} | ${formatClientCell(p)} | ${p.description} | ${formatStack(
      p.stack
    )} | ${p.period} |`;
  });

  return [header, ...rows].join("\n");
}

function main() {
  const projects = loadProjects();
  const table = buildTable(projects);

  let readme = fs.readFileSync(README_FILE, "utf8");

  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      "Could not find PROJECTS-TABLE markers in README.md. Aborting so nothing is overwritten."
    );
    process.exit(1);
  }

  const before = readme.slice(0, startIdx + START_MARKER.length);
  const after = readme.slice(endIdx);

  const newReadme = `${before}\n${table}\n${after}`;

  fs.writeFileSync(README_FILE, newReadme, "utf8");
  console.log(`README.md updated with ${projects.length} projects.`);
}

main();
