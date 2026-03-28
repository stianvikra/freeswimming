import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const nextDir = path.join(repoRoot, ".next");

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
