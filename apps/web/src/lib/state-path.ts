import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

function getConfiguredStateDir() {
  const configured = process.env.APP_STATE_DIR?.trim();
  if (configured) {
    return path.resolve(configured);
  }

  return path.resolve(process.cwd(), "../../work");
}

export function resolveStatePath(fileName: string) {
  return path.join(getConfiguredStateDir(), fileName);
}

async function ensureDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function readJsonState<T>(input: {
  fileName: string;
  defaultState: T;
  legacyFilePaths?: string[];
}) {
  const statePath = resolveStatePath(input.fileName);
  await ensureDirectory(statePath);

  try {
    const raw = await readFile(statePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    for (const legacyPath of input.legacyFilePaths ?? []) {
      try {
        const raw = await readFile(legacyPath, "utf8");
        const parsed = JSON.parse(raw) as T;
        await writeFile(statePath, JSON.stringify(parsed, null, 2), "utf8");
        return parsed;
      } catch {
        // Keep searching legacy locations.
      }
    }

    await writeFile(statePath, JSON.stringify(input.defaultState, null, 2), "utf8");
    return input.defaultState;
  }
}

export async function writeJsonState<T>(input: { fileName: string; state: T }) {
  const statePath = resolveStatePath(input.fileName);
  await ensureDirectory(statePath);
  await writeFile(statePath, JSON.stringify(input.state, null, 2), "utf8");
  return input.state;
}
