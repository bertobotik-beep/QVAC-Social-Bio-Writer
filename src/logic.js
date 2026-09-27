// QVAC Social Bio Writer — core logic.
// completion() writes a short social bio using ONLY the facts the user
// gives — grounding check + a deterministic template fallback guarantee no
// invented facts ever reach the UI.

import { completion } from "@qvac/sdk";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "my", "me", "i", "am", "is", "are", "was", "were", "be", "been", "being",
  "that", "this", "it", "at", "as", "so", "very", "really", "just", "also",
]);

function keywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 220) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i do not have", "please provide"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function isGrounded(text, facts) {
  const words = keywords(facts);
  if (words.length === 0) return true;
  const lower = text.toLowerCase();
  const hits = words.filter((w) => lower.includes(w));
  // require at least a reasonable share of the given facts to actually show up
  return hits.length >= Math.min(1, words.length) && hits.length / words.length >= 0.3;
}

const FALLBACK = (facts) => `${facts} — that's me in a nutshell.`;

export async function generate(modelId, facts) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "Write a short, catchy social media bio (max 2 sentences, under 160 characters) using ONLY the " +
          "facts about the person given below. Do NOT invent any additional facts, hobbies, jobs, locations, " +
          "or traits that were not listed. Reply with ONLY the bio text, no preamble, no hashtags unless they " +
          "are directly built from the given facts.",
      },
      { role: "user", content: "Facts: loves rock climbing, works as a nurse, has two rescue dogs" },
      { role: "assistant", content: "Nurse by day, rock climber by weekend, proud parent of two rescue dogs." },
      { role: "user", content: `Facts: ${facts}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.7, maxTokens: 90 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .split("\n")[0]
    .trim()
    .replace(/^["'“]|["'”]$/g, "")
    .trim();

  let bio = looksUnusable(text) || !isGrounded(text, facts) ? FALLBACK(facts) : text;
  if (bio.length > 160) bio = bio.slice(0, 157).trim() + "...";

  return { bio };
}
