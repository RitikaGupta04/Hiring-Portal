#!/usr/bin/env node
/*
 Auto-generates frontend data lists from CSV/Excel files.
 Input folder: ./data
 Supported files (any combination, optional):
   - countries.csv or countries.xlsx
   - country-codes.csv or country-codes.xlsx
   - colleges.csv or colleges.xlsx

 Columns:
  countries: [name] or [country]
  country-codes: [code,label] OR [country,dial_code]
  colleges: [name] or [college] or [university]

 Output files (overwritten only if inputs exist):
   - ./src/lib/countries.js
   - ./src/lib/country-codes.js
   - ./src/lib/colleges.js
*/

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx/xlsx.mjs';
// Enable filesystem for Node usage
XLSX.set_fs(fsSync);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.resolve(rootDir, 'data');
const libDir = path.resolve(rootDir, 'src', 'lib');

const banner = (src) => `// Auto-generated from ${src} by scripts/generate-lists.mjs\n// Do NOT edit manually. Edit the CSV/Excel and re-run.\n`;

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

function readSheetToJson(filePath) {
  const wb = XLSX.readFile(filePath, { cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function toArrayUniqueClean(list) {
  return Array.from(new Set(list.map(v => String(v).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function cleanCollegeName(s) {
  if (!s) return '';
  let name = String(s);
  // remove replacement chars
  name = name.replace(/\uFFFD/g, '');
  // remove surrounding quotes
  name = name.replace(/^\s*["']+|["']+\s*$/g, '');
  // remove trailing (Id: ...)
  name = name.replace(/\s*\(Id:.*\)\s*$/i, '');
  // remove leading numeric codes like '100001-' or '1.' or '1 -'
  name = name.replace(/^\s*\d+[\-\.\)]*\s*/g, '');
  // remove leading stray commas or punctuation
  name = name.replace(/^[,;:\s]+/, '');
  // collapse multiple spaces
  name = name.replace(/\s{2,}/g, ' ');
  return name.trim();
}

// Simple CSV text parser that handles quoted fields and newlines.
function parseCsvText(text) {
  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        // escaped quote
        field += '"';
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (ch === ',')) {
      cur.push(field);
      field = '';
      continue;
    }
    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      // handle CRLF
      if (ch === '\r' && text[i + 1] === '\n') { i++; }
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = '';
      continue;
    }
    field += ch;
  }
  // push last
  if (field !== '' || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  // trim fields
  return rows.map(r => r.map(f => f.trim()));
}

async function generateCountries() {
  const csv = path.join(dataDir, 'countries.csv');
  const xlsx = path.join(dataDir, 'countries.xlsx');
  let src = null;
  if (await fileExists(csv)) src = csv; else if (await fileExists(xlsx)) src = xlsx; else return false;

  const rows = readSheetToJson(src);
  let names = rows.map(r => (r.name || r.country || '').toString().trim()).filter(Boolean);
  // Clean obvious artifacts (ids, leading numbers, stray quotes/commas)
  names = names.map(cleanCollegeName).filter(Boolean);
  const arr = toArrayUniqueClean(names);
  const out = `${banner(path.basename(src))}export const COUNTRIES = ${JSON.stringify(arr, null, 2)};\n`;
  await fs.writeFile(path.join(libDir, 'countries.js'), out, 'utf8');
  return true;
}

function buildCodeLabelRow(r) {
  // Accept either { code, label } or { country, dial_code }
  let code = (r.code ?? '').toString().trim();
  let label = (r.label ?? '').toString().trim();
  const country = (r.country ?? r.name ?? '').toString().trim();
  const dial = (r.dial_code ?? r.dialCode ?? '').toString().trim();

  if (!code && dial) code = dial.startsWith('+') ? dial : `+${dial}`;
  if (!label && (country || code)) {
    label = country && code ? `${country} (${code})` : (country || code);
  }

  if (!code || !label) return null;
  return { code, label };
}

async function generateCountryCodes() {
  const csv = path.join(dataDir, 'country-codes.csv');
  const xlsx = path.join(dataDir, 'country-codes.xlsx');
  let src = null;
  if (await fileExists(csv)) src = csv; else if (await fileExists(xlsx)) src = xlsx; else return false;

  const rows = readSheetToJson(src);
  const mapped = rows
    .map(buildCodeLabelRow)
    .filter(Boolean)
    .reduce((acc, r) => {
      // de-dup by code
      if (!acc.find(x => x.code === r.code)) acc.push(r);
      return acc;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  const out = `${banner(path.basename(src))}export const COUNTRY_CODES = ${JSON.stringify(mapped, null, 2)};\n`;
  await fs.writeFile(path.join(libDir, 'country-codes.js'), out, 'utf8');
  return true;
}

async function generateColleges() {
  const csv = path.join(dataDir, 'colleges.csv');
  const xlsx = path.join(dataDir, 'colleges.xlsx');
  let src = null;
  if (await fileExists(csv)) src = csv; else if (await fileExists(xlsx)) src = xlsx; else return false;

  const rows = readSheetToJson(src);
  // Try standard keys first
  let names = rows.map(r => (r.name || r.college || r.university || '').toString().trim()).filter(Boolean);

  // If no names found, try a text-parsing fallback (handles CSV files where the header
  // row was parsed as a single quoted cell like: "S. No.,University Name,College Name,...")
  if (!names.length) {
    try {
      const txt = await fs.readFile(src, 'utf8');
      let parsedRows = parseCsvText(txt);
      // If the parser returned rows where each row is a single field that itself
      // contains commas (this happens when the entire CSV line was wrapped in
      // quotes), re-parse each single-field row to split it into real fields.
      if (parsedRows && parsedRows.length > 0 && parsedRows[0].length === 1 && parsedRows[0][0].includes(',')) {
        parsedRows = parsedRows.map(r => parseCsvText(r[0]));
        // parseCsvText returns an array of rows; for each invocation we want the first row
        parsedRows = parsedRows.map(p => (Array.isArray(p) && p[0]) ? p[0] : []);
      }
      if (parsedRows && parsedRows.length > 0) {
        const header = parsedRows[0].map(h => (h || '').toString().toLowerCase());
        // find best column for college name
        let idx = header.findIndex(h => h.includes('college') && h.includes('name'));
        if (idx === -1) idx = header.findIndex(h => h === 'college' || h === 'college name' || h === 'college_name' || h.includes('college'));
        if (idx === -1) {
          // Try university/inst
          idx = header.findIndex(h => h.includes('university') || h.includes('institution') || h.includes('inst'));
        }
        if (idx !== -1) {
          const extracted = parsedRows.slice(1).map(r => r[idx] || '').filter(Boolean).map(s => s.replace(/\"/g, '"').trim());
          names = extracted;
        } else {
          // As a last resort, try column 2 or 3
          const extracted = parsedRows.slice(1).map(r => r[2] || r[1] || '').filter(Boolean).map(s => s.replace(/\"/g, '"').trim());
          names = extracted;
        }
      }
    } catch (e) {
      // ignore and fall through
    }
  }

  // Apply cleaning heuristics to all extracted names (remove trailing IDs, leading numbers, stray quotes)
  names = names.map(cleanCollegeName).filter(Boolean);

  const arr = toArrayUniqueClean(names);
  const out = `${banner(path.basename(src))}export const COLLEGES = ${JSON.stringify(arr, null, 2)};\n`;
  await fs.writeFile(path.join(libDir, 'colleges.js'), out, 'utf8');
  return true;
}

(async () => {
  try {
    const [c1, c2, c3] = await Promise.all([
      generateCountries(),
      generateCountryCodes(),
      generateColleges(),
    ]);
    const done = [c1, c2, c3].some(Boolean);
    if (!done) {
      console.log('[generate-lists] No data files found in ./data; keeping existing hard-coded lists.');
    } else {
      console.log('[generate-lists] Data lists generated successfully.');
    }
  } catch (e) {
    console.error('[generate-lists] Failed:', e);
    process.exit(1);
  }
})();
