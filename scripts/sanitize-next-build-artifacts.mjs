import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const nextDir = path.join(repoRoot, ".next");
const nextServerDir = path.join(nextDir, "server");

function removeMacMetadata(dir) {
  for (const entry of readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    const entryStat = statSync(entryPath);

    if (entryStat.isDirectory()) {
      removeMacMetadata(entryPath);
      continue;
    }

    if (entry === ".DS_Store") {
      rmSync(entryPath, { force: true });
      console.log(`[sanitize-next-build] removed ${path.relative(repoRoot, entryPath)}`);
    }
  }
}

if (existsSync(nextDir)) {
  removeMacMetadata(nextDir);
}

// Next.js may try to replace .next/server during build. If Finder or another
// macOS process drops metadata there, the replace step can fail with ENOTEMPTY.
// This directory is generated output, so clearing it before build is safe.
if (existsSync(nextServerDir)) {
  rmSync(nextServerDir, { force: true, recursive: true });
  console.log(`[sanitize-next-build] removed ${path.relative(repoRoot, nextServerDir)}`);
}
