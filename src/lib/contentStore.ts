// ─────────────────────────────────────────────────────────────────────────────
// contentStore.ts — SERVER-ONLY
// Reads and writes site content to a persistent JSON file on disk.
// This file must only be imported from Server Components or Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";

// Store in /tmp for Vercel compatibility; falls back to project root /data on VPS
function getStorePath(): string {
  const projectData = path.join(process.cwd(), "data", "site-content.json");
  // On Vercel the cwd is read-only — detect by checking if we can write there
  return projectData;
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

export function readSiteContent(): SiteContent {
  const filePath = getStorePath();
  try {
    if (!fs.existsSync(filePath)) {
      // Create first version with defaults and tracking metadata
      const initialStore = {
        ...DEFAULT_SITE_CONTENT,
        _lastCodeDefaults: DEFAULT_SITE_CONTENT,
      };
      ensureDir(filePath);
      fs.writeFileSync(filePath, JSON.stringify(initialStore, null, 2), "utf-8");
      return DEFAULT_SITE_CONTENT;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const saved = JSON.parse(raw);
    const lastDefaults = saved._lastCodeDefaults || {};

    let hasChanges = false;
    const merged = { ...DEFAULT_SITE_CONTENT, ...saved };

    // Sync any changes made in the code section (DEFAULT_SITE_CONTENT)
    for (const key of Object.keys(DEFAULT_SITE_CONTENT) as Array<keyof SiteContent>) {
      const codeVal = DEFAULT_SITE_CONTENT[key];
      const prevCodeVal = lastDefaults[key];

      // If the value in the code has changed from what it previously was in the code,
      // it means the developer updated this field in the code section.
      if (prevCodeVal !== undefined && !isEqual(codeVal, prevCodeVal)) {
        merged[key] = codeVal as any;
        hasChanges = true;
      }
    }

    // Update the tracking defaults to match the current code state
    if (hasChanges || !saved._lastCodeDefaults) {
      merged._lastCodeDefaults = DEFAULT_SITE_CONTENT;
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8");
    }

    // Clean up internal metadata before returning to UI
    const { _lastCodeDefaults, ...cleanContent } = merged;
    return cleanContent as SiteContent;
  } catch (err) {
    console.error("[contentStore] Failed to read site content:", err);
    return DEFAULT_SITE_CONTENT;
  }
}

export function writeSiteContent(content: SiteContent): void {
  const filePath = getStorePath();
  ensureDir(filePath);
  // Keep the tracking defaults intact when writing new admin values
  let currentStore: any = { ...content };
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const saved = JSON.parse(raw);
      currentStore._lastCodeDefaults = saved._lastCodeDefaults || DEFAULT_SITE_CONTENT;
    } else {
      currentStore._lastCodeDefaults = DEFAULT_SITE_CONTENT;
    }
  } catch {
    currentStore._lastCodeDefaults = DEFAULT_SITE_CONTENT;
  }
  fs.writeFileSync(filePath, JSON.stringify(currentStore, null, 2), "utf-8");
}

