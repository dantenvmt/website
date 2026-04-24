// src/utils/resumeTextCleaner.js
// Shared string-cleaning helpers for parsed resume data.
// Fixes common issues from upstream parsers (e.g. Groq): ALL-CAPS company names,
// ALL-CAPS dates like "JULY 23' – MAY 24'", and ALL-CAPS degrees.

// Known acronyms that should stay fully uppercase inside titles.
const ACRONYMS = new Set([
    'SAP', 'KPI', 'KPIs', 'SQL', 'ETL', 'CRM', 'ERP', 'SaaS', 'API',
    'AWS', 'GCP', 'AI', 'ML', 'BI', 'UI', 'UX', 'HR', 'IT', 'CEO',
    'CTO', 'CFO', 'COO', 'USA', 'UK', 'EU', 'UAE', 'JNTU', 'MIT',
    'MBA', 'BBA', 'BS', 'MS', 'PhD', 'BSc', 'MSc', 'B.E.', 'M.S.',
    'B.S.', 'M.E.', 'LLC', 'LLP', 'PLC', 'PVT', 'LTD', 'INC',
    'TCS', 'IBM', 'GRN', 'MR', 'PR', 'BTL', 'COD', 'SSMS',
    'OOP', 'KNN', 'AOV', 'IBGE', 'NLP', 'QA', 'CI/CD',
]);

// Small connector words that stay lowercase in title case (unless first word).
const LOWERCASE_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'for', 'yet', 'so',
    'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'it',
    'via', 'with', 'from', 'into', 'onto', 'upon',
]);

// Return true if the raw string looks "all caps" (i.e. worth converting).
const isMostlyUpper = (s) => {
    if (!s || typeof s !== 'string') return false;
    const letters = s.replace(/[^A-Za-z]/g, '');
    if (letters.length < 3) return false;
    const uppers = letters.replace(/[^A-Z]/g, '');
    // Consider "mostly upper" if >= 80% of letters are uppercase.
    return uppers.length / letters.length >= 0.8;
};

// Capitalize a single token — e.g. "hamdard" -> "Hamdard", "(supply)" -> "(Supply)".
const capitalizeToken = (token) => {
    if (!token) return token;

    const upperToken = token.toUpperCase();
    const cleanToken = upperToken.replace(/[^A-Z0-9]/g, '');
    if (ACRONYMS.has(cleanToken) || ACRONYMS.has(upperToken)) {
        return token.toUpperCase();
    }

    // Preserve short all-caps tokens that contain internal punctuation
    // like "A&M", "R&D", "I/O", "B.S.", "M.S." — these are almost always
    // acronyms that should stay fully uppercase.
    const hasInternalPunct = /[A-Z][&./][A-Z]/.test(upperToken);
    const alphaCount = upperToken.replace(/[^A-Z]/g, '').length;
    if (hasInternalPunct && alphaCount <= 5) {
        return token.toUpperCase();
    }

    // Preserve leading punctuation (e.g. "(", "\"") and trailing punctuation.
    const match = token.match(/^(\W*)(.*?)(\W*)$/);
    if (!match) return token;
    const [, lead, core, trail] = match;
    if (!core) return token;

    const lowered = core.toLowerCase();
    const cased = lowered.charAt(0).toUpperCase() + lowered.slice(1);
    return lead + cased + trail;
};

/**
 * Convert an ALL-CAPS string (or any string) to Title Case.
 * Only runs transformation if the string looks mostly uppercase; otherwise
 * the original casing is preserved (so "Google" stays "Google").
 *
 *   "HAMDARD PAKISTAN" -> "Hamdard Pakistan"
 *   "BACHELOR'S IN BUSINESS ADMINISTRATION (SUPPLY CHAIN)"
 *     -> "Bachelor's in Business Administration (Supply Chain)"
 *   "PAK SUZUKI MOTOR COMPANY" -> "Pak Suzuki Motor Company"
 */
export const toTitleCase = (input) => {
    if (!input || typeof input !== 'string') return input || '';
    if (!isMostlyUpper(input)) return input;

    const tokens = input.split(/(\s+)/); // keep whitespace runs as tokens
    return tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return tok;

        // Lower-case small connector words (unless first real word in the string).
        const clean = tok.replace(/[^A-Za-z]/g, '').toLowerCase();
        const isFirstWord = tokens.slice(0, i).every(t => /^\s+$/.test(t) || t === '');
        if (!isFirstWord && LOWERCASE_WORDS.has(clean)) {
            return tok.toLowerCase();
        }

        return capitalizeToken(tok);
    }).join('');
};

/**
 * Normalize a date string like "JULY 23' – MAY 24'" into "July 23 – May 24".
 * Preserves separators (–, -, /, to), removes stray trailing apostrophes, and
 * title-cases month names. Leaves well-formed dates alone.
 */
export const cleanDateString = (input) => {
    if (!input || typeof input !== 'string') return input || '';

    // Strip trailing apostrophes after year digits: "23'" -> "23".
    let out = input.replace(/(\d{2,4})['']/g, '$1');
    // Normalize multiple spaces.
    out = out.replace(/\s+/g, ' ').trim();

    if (!isMostlyUpper(out)) return out;
    // Title-case each token (months, "Present", "Current", etc.)
    return out.split(/(\s+|[–\-/])/).map(part => {
        if (/^\s+$/.test(part) || /^[–\-/]$/.test(part)) return part;
        return capitalizeToken(part);
    }).join('');
};

/**
 * Coerce a parsed summary field that may be a string, array of strings,
 * or an object with a `.description` / `.text` / `.summary` field, into
 * a single display string. Returns '' if nothing usable is present.
 */
export const extractSummaryText = (parsed) => {
    if (!parsed) return '';

    // Try every plausible field the parser might have returned.
    const candidates = [
        parsed.summary,
        parsed.professional_summary,
        parsed.professionalSummary,
        parsed.summary_description,
        parsed.summaries_description,
        parsed.objective,
        parsed.profile,
        parsed.about,
        parsed.overview,
    ];

    for (const c of candidates) {
        if (!c) continue;
        if (typeof c === 'string' && c.trim()) return c.trim();
        if (Array.isArray(c)) {
            const joined = c
                .map(item => (typeof item === 'string' ? item : (item?.text || item?.description || '')))
                .filter(Boolean)
                .join(' ')
                .trim();
            if (joined) return joined;
        }
        if (typeof c === 'object') {
            const nested = c.text || c.description || c.summary || '';
            if (typeof nested === 'string' && nested.trim()) return nested.trim();
        }
    }

    return '';
};

/**
 * Break up tokens that are longer than `maxChars` by inserting a soft
 * break (zero-width space for HTML, or a space for PDF generation) every
 * `maxChars` characters. This is needed because jsPDF's splitTextToSize
 * only breaks on whitespace, so an unbroken 200-character token will
 * overflow the page margin.
 */
export const softBreakLongTokens = (text, maxChars = 60, breakChar = ' ') => {
    if (!text || typeof text !== 'string') return text || '';
    return text
        .split(/(\s+)/)
        .map(tok => {
            if (/^\s+$/.test(tok) || tok.length <= maxChars) return tok;
            // Insert break every maxChars characters.
            const chunks = [];
            for (let i = 0; i < tok.length; i += maxChars) {
                chunks.push(tok.slice(i, i + maxChars));
            }
            return chunks.join(breakChar);
        })
        .join('');
};