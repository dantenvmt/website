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
    $problemsText .= "Problem {$num} [MODE: {$mode}]: " . $p['title'] . "\n";
    $problemsText .= "Description: " . $p['description'] . "\n";
    $problemsText .= "Candidate story / extra context: " . $p['story'] . "\n";
    if (!empty($p['metrics'])) {
        $problemsText .= "Metrics: " . $p['metrics'] . "\n";
    }
    if (!empty($p['existing_bullets'])) {
        $problemsText .= "Candidate's existing bullets (rewrite these, keeping their authentic voice): " . $p['existing_bullets'] . "\n";
    }
    if (!empty($p['suggested_keywords']) && is_array($p['suggested_keywords'])) {
        $problemsText .= "Keywords to naturally weave in where they genuinely fit: " . implode(', ', $p['suggested_keywords']) . "\n";
    }
    $problemsText .= "\n";
}

$bulletCount = count($problems);
$prompt = "You are an expert resume writer with two bullet-writing modes:\n\n"
    . "MODE: WRITE — Write a brand-new achievement bullet grounded strictly in the candidate's story.\n"
    . "  - Starts with a strong past-tense action verb\n"
    . "  - Names what you specifically built, designed, led, or did — drawn ONLY from the candidate's story\n"
    . "  - Includes the quantified result using the candidate's exact numbers\n"
    . "  - Flows naturally — no robotic phrasing like 'as measured by' or 'in order to'\n"
    . "  - 20-35 words, no filler\n"
    . "  - NEVER invent tools, technologies, numbers, or outcomes not stated by the candidate\n\n"
    . "MODE: REWRITE — Rewrite the candidate's existing bullet(s) to FAANG / elite-company standard.\n"
    . "  Google, Meta, Amazon, and Microsoft resume standards:\n"
    . "  - Opens with a powerful past-tense action verb (Architected, Spearheaded, Engineered, Drove, Scaled, Optimized, Reduced, Launched)\n"
    . "  - Leads with scope or scale when impressive (team size, user base, request volume, revenue impact, cost savings)\n"
    . "  - Quantifies everything: latency, throughput, cost reduction, error rate, time saved, revenue generated\n"
    . "  - Names the specific system, product, or initiative — never vague 'projects' or 'solutions'\n"
    . "  - Shows business impact, not just technical activity — what changed because of your work?\n"
    . "  - 20-40 words, dense, zero filler\n"
    . "  - You MUST include ALL suggested keywords in the bullet — they are required for ATS matching\n"                                                                 
    . "  - Work the keywords in naturally so the bullet still reads as strong, human writing\n" 
    . "  - NEVER invent metrics, team sizes, tools, or outcomes not present in existing bullets or candidate story\n"
    . "  - If existing bullets are thin, write a tighter, stronger version of what is already claimed — do not fabricate\n\n"
    . "Write exactly {$bulletCount} bullet(s) — one per problem. Apply the MODE labeled on each problem.\n\n"
    . $problemsText
    . "Return ONLY a valid JSON array with exactly {$bulletCount} object(s). Each object must have:\n"
    . "- \"problem_title\": the problem title (copy exactly from above)\n"
    . "- \"bullet\": the bullet text (no bullet prefix character — just the text)\n\n"
    . "Return only the JSON array, no other text.";

$requestBody = json_encode([
    'model' => 'llama-3.3-70b-versatile',
    'messages' => [['role' => 'user', 'content' => $prompt]],
    'temperature' => 0.4,
    'max_tokens' => 1500,
]);

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

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
