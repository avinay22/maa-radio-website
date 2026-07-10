// ─────────────────────────────────────────────────────────────────────────────
// productsStore.ts — SERVER-ONLY
// Reads and writes the products list to a persistent JSON file on disk.
// This file must only be imported from Server Components or Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { Product, INITIAL_PRODUCTS } from "@/data/products";

function getStorePath(): string {
  return path.join(process.cwd(), "data", "products.json");
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

export function readProducts(): Product[] {
  const filePath = getStorePath();
  try {
    if (!fs.existsSync(filePath)) {
      // Create first version with defaults and tracking metadata
      const initialStore = {
        products: INITIAL_PRODUCTS,
        _lastCodeDefaults: INITIAL_PRODUCTS,
      };
      ensureDir(filePath);
      fs.writeFileSync(filePath, JSON.stringify(initialStore, null, 2), "utf-8");
      return INITIAL_PRODUCTS;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const saved = JSON.parse(raw);
    
    // Support transition from simple array format in previous implementation
    let savedList: Product[] = [];
    let lastDefaults: Product[] = [];
    if (Array.isArray(saved)) {
      savedList = saved;
      lastDefaults = [];
    } else {
      savedList = saved.products || [];
      lastDefaults = saved._lastCodeDefaults || [];
    }

    let hasChanges = false;
    const syncedList = [...savedList];

    // Check if any product in INITIAL_PRODUCTS was added, modified, or deleted in code
    for (const codeProd of INITIAL_PRODUCTS) {
      const prevCodeProd = lastDefaults.find((p) => p.id === codeProd.id);
      
      // If a product is newly added in code, or exists in code but was modified in code
      if (!prevCodeProd) {
        // Newly added in code - prepend it if not already in saved list
        if (!syncedList.some((p) => p.id === codeProd.id)) {
          syncedList.unshift(codeProd);
          hasChanges = true;
        }
      } else if (!isEqual(codeProd, prevCodeProd)) {
        // Modified in code - update in synced list
        const idx = syncedList.findIndex((p) => p.id === codeProd.id);
        if (idx !== -1) {
          syncedList[idx] = codeProd;
        } else {
          syncedList.unshift(codeProd);
        }
        hasChanges = true;
      }
    }

    // Check if any product was deleted from INITIAL_PRODUCTS in code
    if (lastDefaults.length > 0) {
      for (const prevCodeProd of lastDefaults) {
        if (!INITIAL_PRODUCTS.some((p) => p.id === prevCodeProd.id)) {
          // Deleted from code - remove it from synced list
          const idx = syncedList.findIndex((p) => p.id === prevCodeProd.id);
          if (idx !== -1) {
            syncedList.splice(idx, 1);
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges || Array.isArray(saved)) {
      const newStore = {
        products: syncedList,
        _lastCodeDefaults: INITIAL_PRODUCTS,
      };
      fs.writeFileSync(filePath, JSON.stringify(newStore, null, 2), "utf-8");
    }

    return syncedList;
  } catch (err) {
    console.error("[productsStore] Failed to read products:", err);
    return INITIAL_PRODUCTS;
  }
}

export function writeProducts(products: Product[]): void {
  const filePath = getStorePath();
  ensureDir(filePath);
  const currentStore = {
    products,
    _lastCodeDefaults: INITIAL_PRODUCTS,
  };
  fs.writeFileSync(filePath, JSON.stringify(currentStore, null, 2), "utf-8");
}

