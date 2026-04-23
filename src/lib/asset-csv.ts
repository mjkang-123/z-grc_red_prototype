// Lightweight CSV parser for bulk asset import.
// Expected columns (header required, case-insensitive): kind, name, description, metadata
//
// metadata cell formats (any of):
//   - empty → no metadata
//   - {"role":"edge","vendor":"x"} → parsed as JSON
//   - role=edge;vendor=x            → parsed as key=value pairs (; separated)
//
// Values with commas should be wrapped in double quotes ("..."). Double quotes
// inside a value are escaped as "" (standard RFC 4180).

import { ASSET_KINDS, type AssetKind } from "./asset-kinds";

export type AssetCSVRow = {
  kind: AssetKind;
  name: string;
  description: string;
  metadata: Record<string, string>;
};

export type ParseResult = {
  rows: AssetCSVRow[];
  errors: string[];
};

// Tokenize a single CSV line respecting RFC 4180 quoting.
function tokenizeLine(line: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === ",") {
        tokens.push(cur);
        cur = "";
      } else if (c === '"' && cur === "") {
        inQuotes = true;
      } else {
        cur += c;
      }
    }
  }
  tokens.push(cur);
  return tokens.map((t) => t.trim());
}

function parseMetadataCell(raw: string): Record<string, string> {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  // JSON object form
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          out[String(k)] = String(v);
        }
        return out;
      }
    } catch {
      /* fall through */
    }
  }
  // key=value;key=value form
  const out: Record<string, string> = {};
  for (const pair of trimmed.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

export function parseAssetCSV(csvText: string): ParseResult {
  const rows: AssetCSVRow[] = [];
  const errors: string[] = [];

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.replace(/^﻿/, "")) // strip BOM
    .filter((l, i) => i === 0 || l.trim().length > 0);
  if (lines.length === 0) {
    errors.push("CSV가 비어 있습니다.");
    return { rows, errors };
  }

  const header = tokenizeLine(lines[0]).map((h) => h.toLowerCase());
  const col = {
    kind: header.indexOf("kind"),
    name: header.indexOf("name"),
    description: header.indexOf("description"),
    metadata: header.indexOf("metadata"),
  };
  if (col.kind < 0 || col.name < 0) {
    errors.push(
      "헤더 행에 'kind'와 'name' 컬럼이 필요합니다 (description, metadata는 선택).",
    );
    return { rows, errors };
  }

  const kindSet = new Set<string>(ASSET_KINDS.map((k) => k.kind));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = tokenizeLine(line);
    const kind = (cells[col.kind] ?? "").trim();
    const name = (cells[col.name] ?? "").trim();
    const description =
      col.description >= 0 ? (cells[col.description] ?? "").trim() : "";
    const metadataRaw =
      col.metadata >= 0 ? (cells[col.metadata] ?? "").trim() : "";

    if (!name) {
      errors.push(`행 ${i + 1}: name이 비어 있습니다.`);
      continue;
    }
    if (!kindSet.has(kind)) {
      errors.push(
        `행 ${i + 1}: 알 수 없는 kind "${kind}" (허용: ${Array.from(kindSet).join(", ")}).`,
      );
      continue;
    }
    const metadata = parseMetadataCell(metadataRaw);
    rows.push({ kind: kind as AssetKind, name, description, metadata });
  }

  return { rows, errors };
}
