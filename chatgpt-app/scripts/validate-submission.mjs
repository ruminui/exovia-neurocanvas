import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const expectedTools = [
  "analyze_ai_output",
  "create_context_capsule",
  "create_neurocanvas_map",
  "compare_ai_outputs",
  "recommend_ai_route",
  "build_proof_pack",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [manifestText, serverSource] = await Promise.all([
  readFile(path.join(root, "chatgpt-app-submission.json"), "utf8"),
  readFile(path.join(root, "src/server.mjs"), "utf8"),
]);
const manifest = JSON.parse(manifestText);

assert(manifest.schema_version === 1, "Submission schema_version must be 1");
assert(manifest.$schema === "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json", "Unexpected submission schema URL");
assert(manifest.app_info?.display_name === "Exovia ProofLayer", "Submission display name is missing or stale");
assert(typeof manifest.app_info?.subtitle === "string" && manifest.app_info.subtitle.length <= 30, "Submission subtitle must be 30 characters or less");
assert(manifest.app_info?.category === "PRODUCTIVITY", "Submission category must be PRODUCTIVITY");

const manifestTools = Object.keys(manifest.tools || {}).sort();
assert(JSON.stringify(manifestTools) === JSON.stringify([...expectedTools].sort()), "Submission tool list does not match the MCP server");

for (const toolName of expectedTools) {
  assert(serverSource.includes(`registerAppTool(server, "${toolName}"`), `MCP server does not register ${toolName}`);
  const tool = manifest.tools[toolName];
  assert(tool?.annotations?.readOnlyHint === true, `${toolName} must explicitly set readOnlyHint=true`);
  assert(tool?.annotations?.openWorldHint === false, `${toolName} must explicitly set openWorldHint=false`);
  assert(tool?.annotations?.destructiveHint === false, `${toolName} must explicitly set destructiveHint=false`);
  assert(typeof tool?.justifications?.read_only_justification === "string", `${toolName} needs a read-only justification`);
  assert(typeof tool?.justifications?.open_world_justification === "string", `${toolName} needs an open-world justification`);
  assert(typeof tool?.justifications?.destructive_justification === "string", `${toolName} needs a destructive-action justification`);
}

assert(Array.isArray(manifest.test_cases) && manifest.test_cases.length === 5, "Submission must contain exactly five positive test cases");
assert(Array.isArray(manifest.negative_test_cases) && manifest.negative_test_cases.length === 3, "Submission must contain exactly three negative test cases");
for (const testCase of manifest.test_cases) {
  assert(expectedTools.includes(testCase.tools_triggered), `Positive test references unknown tool: ${testCase.tools_triggered}`);
  assert(testCase.user_prompt && testCase.expected_output, "Every positive test needs a prompt and expected output");
}
for (const testCase of manifest.negative_test_cases) {
  assert(testCase.tools_triggered === null, "Negative tests must not trigger a tool");
  assert(testCase.user_prompt && testCase.expected_output, "Every negative test needs a prompt and expected output");
}

console.log(`ChatGPT App submission manifest validated: ${expectedTools.length} tools, 5 positive tests, 3 negative tests.`);
console.warn(`Review note: ${expectedTools.length} tools currently omit outputSchema; add explicit output schemas before a public directory submission if required by the final review checklist.`);
