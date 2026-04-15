# AI Write Modal Overhaul — Design Spec
Date: 2026-04-14

## Overview

Five targeted changes to the AI Write experience modal and supporting API files:
1. Remove the one-use-per-JD limit on AI Write
2. Remove the "existing bullets" reference display
3. Allow multiple experience entries per problem
4. AI determines relevance before showing confirmation UI
5. FAANG-style rewrite prompt for the rewrite path

---

## 1. Remove AI Write Usage Limit

**Files:** `src/pages/resume/experience.js`

Remove all code related to per-JD locking:
- `aiWriteUsed` state
- `getAiWriteKey()` function
- `handleAiGenerated()` callback
- `localStorage.getItem/setItem` calls for `aiwrite_*` keys
- The `useEffect` that reads from localStorage on mount
- The `aiWriteUsed` prop passed to `ExperienceItem`
- The disabled state and "AI Write Used" label on the button in `ExperienceItem`

The AI Write button should be enabled whenever a job description exists. The `onGenerated` prop on `AIWriteExperienceModal` is also removed since there is nothing to mark anymore.

---

## 2. Remove "Existing Bullets" Display Section

**Files:** `src/components/resume/AIWriteExperienceModal.js`

Remove the read-only box that displays `experiences.map(e => e.bullets).join('\n')` when a user confirms `yes`. The AI already receives existing bullets in the payload — there is no reason to show them to the user.

---

## 3. Multiple Experience Entries Per Problem

**Files:** `src/components/resume/AIWriteExperienceModal.js`

### State shape change

```js
// Before
answers = [{ story: '', metrics: '' }, ...]  // one entry per problem

// After
answers = [{ experiences: [{ story: '', metrics: '' }] }, ...]  // array of entries per problem
```

### UI

For any problem that reaches the write-box stage (confirmed No, or confirmed Yes + wants rewrite), render:
- One `story` textarea + `metrics` input per experience entry
- An "Add another experience" button below the last entry that appends `{ story: '', metrics: '' }` to `answers[i].experiences`
- Keyword chips appear once above all entries for that problem (not repeated)

### Payload construction

When building the payload for `write_experience_bullets.php`, combine all entries for a problem:
```js
const combinedStory = answers[i].experiences.map(e => e.story).filter(Boolean).join('\n\n');
const combinedMetrics = answers[i].experiences.map(e => e.metrics).filter(Boolean).join(', ');
```

### Validation

A problem is resolved (has story) if `answers[i].experiences.some(e => e.story.trim().length > 0)`.

---

## 4. AI Determines Relevance

### 4a. `analyze_problems.php` changes

**Input:** Add `existing_bullets` (string) alongside `job_description`.

**Prompt change:** Instruct the AI to also assess, for each problem, whether the candidate's existing bullets demonstrate relevant experience. Return `ai_has_experience: true/false` per problem.

**Output shape:**
```json
[
  { "id": 1, "title": "...", "description": "...", "ai_has_experience": true },
  { "id": 2, "title": "...", "description": "...", "ai_has_experience": false },
  { "id": 3, "title": "...", "description": "...", "ai_has_experience": true }
]
```

Validation: still requires exactly 3 problems, now also checks `ai_has_experience` is a boolean.

### 4b. `AIWriteExperienceModal.js` — passing existing bullets

In `analyzeProblems()`, include `existing_bullets` in the request body:
```js
existing_bullets: experiences.map(e => e.bullets).filter(Boolean).join('\n')
```

### 4c. Per-problem UI logic

For each problem, render based on `problem.ai_has_experience`:

**`ai_has_experience = false`**
- Render: `"No relevant experience detected — skipped."`
- Auto-resolved, no bullet generated for this problem.

**`ai_has_experience = true`**
- Show confirmation dropdown: "Do you have experience solving this?"
  - **Confirmed No** → show write box (multi-entry) with keyword chips → generates bullet from scratch
  - **Confirmed Yes** → show second dropdown: "Want AI to rewrite your bullets with relevant keywords?"
    - **Wants rewrite Yes** → show write box (multi-entry) with keyword chips → generates bullet (FAANG-style rewrite)
    - **Wants rewrite No** → show "Skipped — keeping your existing bullets." label → no bullet generated

### 4d. `allResolved` and `hasAtLeastOneToGenerate` logic

```js
const allResolved = problems.every((problem, i) => {
    if (!problem.ai_has_experience) return true;  // auto-skip
    const confirmed = experienceConfirmed[i];
    const rewrite = wantsAiRewrite[i];
    if (confirmed === null) return false;
    if (confirmed === 'no') return answers[i].experiences.some(e => e.story.trim().length > 0);
    if (confirmed === 'yes' && rewrite === null) return false;
    if (confirmed === 'yes' && rewrite === 'yes') return answers[i].experiences.some(e => e.story.trim().length > 0);
    if (confirmed === 'yes' && rewrite === 'no') return true;  // skip
    return false;
});

const hasAtLeastOneToGenerate = problems.some((problem, i) => {
    if (!problem.ai_has_experience) return false;
    const confirmed = experienceConfirmed[i];
    const rewrite = wantsAiRewrite[i];
    if (confirmed === 'no') return answers[i].experiences.some(e => e.story.trim().length > 0);
    if (confirmed === 'yes' && rewrite === 'yes') return answers[i].experiences.some(e => e.story.trim().length > 0);
    return false;
});
```

### 4e. Payload filter

Only include problems where a bullet should be generated:
```js
.filter(({ p, idx }) => {
    if (!p.ai_has_experience) return false;
    const confirmed = experienceConfirmed[idx];
    const rewrite = wantsAiRewrite[idx];
    return confirmed === 'no' || (confirmed === 'yes' && rewrite === 'yes');
})
```

Each problem in the payload includes `mode: 'rewrite'` (confirmed yes + wants rewrite) or `mode: 'write'` (confirmed no).

---

## 5. FAANG-Style Rewrite Prompt

**Files:** `api/write_experience_bullets.php`

### Two prompt modes

The server receives `mode` per problem. Build the prompt differently per mode.

**`mode: 'write'` (write from scratch):** Keep the current honest X-Y-Z prompt. The user described an experience they had; generate an accurate, quantified bullet.

**`mode: 'rewrite'` (FAANG-style rewrite):** Replace the current bullet-writing instructions with a FAANG/elite-resume framing:

```
You are a resume writer for FAANG-level candidates. Rewrite the candidate's existing bullet(s)
to match the standard of top Google, Meta, Amazon, and Microsoft resumes.

FAANG bullet standards:
- Opens with a powerful past-tense action verb (Architected, Spearheaded, Engineered, Drove, Scaled)
- Leads with scope or scale when impressive (team size, user base, request volume, revenue impact)
- Quantifies everything: latency, throughput, cost savings, error rate reduction, time saved
- Names the specific system, product, or initiative — not vague "projects" or "solutions"
- Shows business impact, not just technical activity
- 20–40 words — dense, no filler

STRICT: Do not invent numbers, team sizes, tools, or outcomes not present in the existing bullets
or candidate story. If existing bullets are thin, write a tighter, stronger version of what is
already claimed — do not fabricate beyond it.

Weave in suggested keywords only where they genuinely reflect the candidate's work.
```

### Prompt construction

The PHP builds a single prompt string. For each problem in the batch, append the problem context block (title, description, story, metrics, existing_bullets if present, suggested_keywords if present). The prompt prefix switches based on `mode`.

Since a single request may contain a mix of `write` and `rewrite` problems, build per-problem instruction blocks that include the mode-specific framing inline. Alternatively, split into two separate AI calls if the batch is mixed — but a single call with per-problem instructions labeled clearly is simpler and preferred.

**Approach:** Keep single call. Include mode-specific instruction per problem block:
```
Problem 1 [MODE: REWRITE — FAANG style]:
...

Problem 2 [MODE: WRITE — honest, grounded]:
...
```

The system prompt at the top sets expectations for both modes, and the per-problem label tells the model which standard to apply.

---

## Data Flow Summary

```
User opens AI Write modal
  → analyzeProblems({ job_description, existing_bullets })
  ← [{ id, title, description, ai_has_experience }, ...]

For each problem:
  ai_has_experience = false → auto-skip (no UI shown)
  ai_has_experience = true  → show confirmation dropdown
    confirmed = 'no'          → show multi-entry write box → [mode: write]
    confirmed = 'yes'
      rewrite = 'yes'         → show multi-entry write box → [mode: rewrite]
      rewrite = 'no'          → skip

User clicks Generate Bullets
  → writeBullets({ problems: [{ title, description, story, metrics, mode, existing_bullets?, suggested_keywords? }] })
  ← [{ problem_title, bullet }, ...]

User selects bullets, assigns to experiences → Insert
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/resume/experience.js` | Remove usage limit, `aiWriteUsed` state, localStorage, `onGenerated` prop |
| `src/components/resume/AIWriteExperienceModal.js` | AI relevance flow, multi-entry answers, remove existing bullets display, pass existing_bullets to analyze |
| `api/analyze_problems.php` | Accept `existing_bullets`, return `ai_has_experience` per problem |
| `api/write_experience_bullets.php` | Accept `mode` per problem, apply FAANG prompt for rewrite mode |
