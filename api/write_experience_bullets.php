<?php
require_once __DIR__ . '/config.php';

$apiKey = getenv('GROQ_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API key is not configured on the server.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$problems = isset($input['problems']) ? $input['problems'] : [];

if (empty($problems) || count($problems) < 1 || count($problems) > 9) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Between 1 and 9 experience entries are required']);
    exit;
}

$problemsText = '';
foreach ($problems as $i => $p) {
    if (!isset($p['title'], $p['description'], $p['story'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Each problem must include title, description, and story.']);
        exit;
    }
    if (strlen($p['story']) > 4000 || strlen($p['metrics'] ?? '') > 500) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Story or metrics text is too long. Please shorten and try again.']);
        exit;
    }
    $num = $i + 1;
    $mode = isset($p['mode']) && $p['mode'] === 'rewrite' ? 'REWRITE' : 'WRITE';

    $problemsText .= "<problem id=\"{$num}\" mode=\"{$mode}\">\n";
    $problemsText .= "  <title>" . $p['title'] . "</title>\n";
    $problemsText .= "  <role_description>" . $p['description'] . "</role_description>\n";
    $problemsText .= "  <candidate_story>" . $p['story'] . "</candidate_story>\n";
    if (!empty($p['metrics'])) {
        $problemsText .= "  <metrics>" . $p['metrics'] . "</metrics>\n";
    }
    if (!empty($p['existing_bullets'])) {
        $problemsText .= "  <existing_bullets>" . $p['existing_bullets'] . "</existing_bullets>\n";
    }
    if (!empty($p['suggested_keywords']) && is_array($p['suggested_keywords'])) {
        $problemsText .= "  <required_keywords>" . implode(', ', $p['suggested_keywords']) . "</required_keywords>\n";
    }
    $problemsText .= "</problem>\n\n";
}

$bulletCount = count($problems);

$prompt = <<<PROMPT
# ROLE

You are a senior technical recruiter and resume strategist who has reviewed 50,000+ resumes for Google, Meta, Amazon, Microsoft, and Apple. You write resume bullets that pass both ATS keyword filters AND the 6-second human recruiter scan. Your bullets have landed candidates at L5+ engineering roles and senior IC positions at top-tier tech companies.

# TASK

Generate exactly {$bulletCount} resume bullet(s) — one per <problem> block below. Each problem has a MODE attribute telling you which generation strategy to apply.

# THE FAANG BULLET FORMULA

Every elite bullet follows this structure:

  [Strong Action Verb] + [What You Specifically Built/Led/Drove] + [Scope or Scale] + [Quantified Business Impact]

## What separates a great bullet from a mediocre one:

| Weak (avoid)                          | Strong (emulate)                                                                 |
|---------------------------------------|----------------------------------------------------------------------------------|
| "Worked on data pipelines"            | "Architected distributed data pipeline processing 2B+ events/day"                |
| "Helped improve performance"          | "Reduced p99 latency 340ms → 80ms (76%) by rewriting hot path in Rust"           |
| "Responsible for dashboards"          | "Launched exec-facing Tableau suite used by 12 VPs to steer \$40M budget"        |
| "Used machine learning for fraud"     | "Deployed XGBoost fraud model cutting false positives 42%, saving \$2.1M/yr"     |

## Non-negotiable rules for every bullet:

1. **Open with a powerful past-tense verb.** Pick from: Architected, Spearheaded, Engineered, Drove, Scaled, Optimized, Launched, Pioneered, Productionized, Orchestrated, Operationalized, Led, Built, Designed, Reduced, Accelerated, Automated, Migrated, Consolidated, Shipped. Never start with "Responsible for," "Helped," "Assisted," or "Worked on."
2. **Name the specific system.** "the customer-segmentation service," "the anomaly-detection pipeline," "the RAG chatbot" — never vague "solutions," "projects," or "things."
3. **Lead with scope when it's impressive.** Team size, data volume (GB/TB/QPS), user count, revenue managed, number of stakeholders. If the scope is unimpressive, lead with the verb instead.
4. **Quantify the outcome.** Use one of: % improvement, \$ saved or generated, time reduced, latency dropped, throughput gained, error rate cut, adoption increased. If the candidate gave numbers — use them exactly.
5. **Show the business "so-what."** A bullet that ends in "improved latency 40%" is fine. A bullet that ends in "improved latency 40%, unblocking launch of Feature X used by 8M DAU" is elite. Only add the so-what if it is actually in the candidate's story.
6. **20–40 words. Dense. Zero filler.** Cut every word that doesn't earn its place. No "in order to," "as measured by," "utilized," "successfully," "various."
7. **ABSOLUTE CONSTRAINT: Do not fabricate.** Never invent tools, team sizes, metrics, customer names, revenue figures, or outcomes not present in the candidate's story, existing bullets, or metrics. If the story lacks a number, write the bullet without a number rather than invent one. Fabrication is the single worst failure mode.

# MODES

## MODE: WRITE
Generate a brand-new bullet grounded strictly in the <candidate_story>.
- Extract the strongest achievement from the story.
- If the story contains numbers, use them exactly as stated.
- If the story lacks quantification, write a tight qualitative bullet — do NOT invent metrics.
- Target: 20–35 words.

## MODE: REWRITE
Upgrade the <existing_bullets> to FAANG standard while preserving every factual claim.
- Keep the candidate's real metrics, tools, and outcomes — upgrade only the verbs, structure, and density.
- If <required_keywords> is provided, ALL of them MUST appear in the final bullet, woven in naturally.
- You may consolidate multiple weak bullets into one stronger bullet ONLY if they describe the same initiative.
- Target: 20–40 words.

# FEW-SHOT EXAMPLES

## Example 1 — MODE: WRITE

INPUT:
  candidate_story: "I built a customer segmentation model at my company. Used k-means clustering on purchase data. Marketing team used it for their email campaigns. Campaign conversion went from 4.2% to 5.5%. It runs every week now."

OUTPUT:
  "Engineered production k-means customer-segmentation pipeline on weekly cadence, powering marketing email targeting and lifting campaign conversion from 4.2% to 5.5% (+31%) across the active subscriber base."

Why it works: specific verb ("Engineered"), names the system ("k-means customer-segmentation pipeline"), specifies cadence ("weekly"), uses exact numbers, ends with business impact.

## Example 2 — MODE: WRITE (story lacks hard metrics)

INPUT:
  candidate_story: "I created a RAG chatbot with BERT embeddings that pulled from our internal security docs. Analysts used it to look up compliance rules faster."

OUTPUT:
  "Built Retrieval-Augmented Generation chatbot using BERT embeddings over internal security documentation, enabling analysts to surface compliance rules and response protocols on demand during active investigations."

Why it works: no fabricated metrics (the story had none), but still specific ("BERT embeddings," "internal security documentation," "active investigations") and active.

## Example 3 — MODE: REWRITE

INPUT:
  existing_bullets: "Made some dashboards for the finance team using Tableau. They said it was helpful."
  candidate_story: "Finance team had 6 VPs using it for monthly close. Replaced 3 manual Excel reports."
  required_keywords: ["Tableau", "finance", "executive reporting"]

OUTPUT:
  "Launched Tableau executive reporting suite for finance leadership, consolidating 3 manual Excel workflows into a single dashboard used by 6 VPs during monthly close."

Why it works: all three required keywords appear naturally, weak phrasing upgraded ("Made" → "Launched"), pulls real scope from candidate_story (6 VPs, 3 reports), no invented numbers.

## Example 4 — What NOT to do

INPUT:
  candidate_story: "I worked on an ML model for fraud detection."

BAD OUTPUT (fabricated):
  "Deployed XGBoost fraud model on 4.2M daily transactions, cutting false positives 38% and saving \$1.8M annually."

Why it's bad: candidate never mentioned XGBoost, 4.2M transactions, 38%, or \$1.8M. All fabricated. This is the worst failure mode.

GOOD OUTPUT (honest):
  "Developed machine-learning fraud-detection model, productionized into the transaction-review workflow to flag suspicious activity earlier in the approval pipeline."

# YOUR REASONING PROCESS

For each problem, internally (do not output this reasoning, only the final JSON):
1. Read the <candidate_story> and extract every concrete fact: tools named, numbers stated, systems built, business outcomes, scope indicators.
2. Identify the single strongest achievement to feature.
3. Pick the verb that most accurately describes what the candidate did.
4. Draft the bullet using the FAANG formula.
5. Audit: Does every claim trace back to the input? If any element is fabricated, remove it.
6. Audit: In REWRITE mode, are all required_keywords present?
7. Tighten: can any word be cut without losing meaning? Cut it.

# INPUT

{$problemsText}

# OUTPUT FORMAT

Return ONLY a valid JSON array with exactly {$bulletCount} object(s). No prose, no markdown code fences, no commentary. Each object must have exactly two keys:

- "problem_title": the problem title, copied verbatim from the <title> tag above
- "bullet": the bullet text (plain text, no leading "•" or "-" character)

Example output shape:
[
  {"problem_title": "Senior Data Analyst at Renaisons", "bullet": "Engineered ..."},
  {"problem_title": "Graduate Assistant at East Texas A&M", "bullet": "Spearheaded ..."}
]

Return only the JSON array now.
PROMPT;

$requestBody = json_encode([
    'model' => 'openai/gpt-oss-120b',
    'messages' => [['role' => 'user', 'content' => $prompt]],
    'temperature' => 0.3,
    'max_tokens' => 3000,
]);

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 45);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'cURL error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo $response;
    exit;
}

$groqResponse = json_decode($response, true);
$content = $groqResponse['choices'][0]['message']['content'] ?? '';
$content = preg_replace('/```json\s*|\s*```/', '', $content);
$content = trim($content);
if (substr($content, 0, 1) !== '[') {
    preg_match('/\[[\s\S]*\]/m', $content, $matches);
    $content = isset($matches[0]) ? $matches[0] : $content;
}

$bullets = json_decode($content, true);

if (!is_array($bullets) || count($bullets) !== $bulletCount) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to parse AI response. Please try again.']);
    exit;
}

foreach ($bullets as $bullet) {
    if (!isset($bullet['problem_title']) || !isset($bullet['bullet'])) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to parse AI response. Please try again.']);
        exit;
    }
}

echo json_encode(['status' => 'success', 'bullets' => $bullets]);