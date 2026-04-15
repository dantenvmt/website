<?php
require_once __DIR__ . '/config.php';

$apiKey = getenv('GROQ_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API key is not configured on the server.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$jobDescription = isset($input['job_description']) ? trim($input['job_description']) : '';
$existingBullets = isset($input['existing_bullets']) ? trim($input['existing_bullets']) : '';

if (empty($jobDescription)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Job description is required']);
    exit;
}

if (strlen($jobDescription) > 8000) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Job description is too long. Please shorten it and try again.']);
    exit;
}

$bulletSection = !empty($existingBullets)
    ? "Candidate's Existing Resume Bullets:\n" . $existingBullets . "\n\n"
    : "Candidate has no existing resume bullets.\n\n";

$prompt = "Analyze this job description and identify the top 3 specific business problems this role needs to solve. "
    . "Also assess whether the candidate's existing resume bullets demonstrate relevant experience for each problem.\n\n"
    . "Return ONLY a valid JSON array with exactly 3 objects. Each object must have:\n"
    . "- \"id\": number (1, 2, or 3)\n"
    . "- \"title\": short problem title (under 10 words)\n"
    . "- \"description\": one sentence explaining the specific challenge (under 30 words)\n"
    . "- \"ai_has_experience\": boolean — true if the candidate's existing bullets show relevant experience for this problem, false if not or if no bullets exist\n\n"
    . "Job Description:\n" . $jobDescription . "\n\n"
    . $bulletSection
    . "Return only the JSON array, no other text.";

$requestBody = json_encode([
    'model' => 'llama-3.3-70b-versatile',
    'messages' => [['role' => 'user', 'content' => $prompt]],
    'temperature' => 0.3,
    'max_tokens' => 600,
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

$problems = json_decode($content, true);

if (!is_array($problems) || count($problems) !== 3) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to parse AI response. Please try again.']);
    exit;
}

$normalizedProblems = [];
foreach ($problems as $p) {
    if (!isset($p['id'], $p['title'], $p['description'])) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to parse AI response. Please try again.']);
        exit;
    }
    $normalizedProblems[] = [
        'id' => $p['id'],
        'title' => $p['title'],
        'description' => $p['description'],
        'ai_has_experience' => isset($p['ai_has_experience']) ? (bool)$p['ai_has_experience'] : true,
    ];
}

echo json_encode(['status' => 'success', 'problems' => $normalizedProblems]);
