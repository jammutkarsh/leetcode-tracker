import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve("src/data");
const apiBase = "https://leetcode-api-pied.vercel.app";

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  questionId?: string;
  [key: string]: unknown;
}

interface QuestionMeta {
  questionId: string;
  title: string;
}

const replaceWord = (input: string, fromWord: string, toWord: string): string =>
  input
    .split(" ")
    .map((part) => (part === fromWord ? toWord : part))
    .join(" ");

const LEETCODE_URL_BASE = "https://leetcode.com/problems";

const buildLeetcodeUrl = (slug: string): string =>
  `${LEETCODE_URL_BASE}/${slug}`;

const normalizeWhitespace = (input: string): string =>
  input.split(" ").filter(Boolean).join(" ").trim();

const toBasicTokenString = (input: string, separator: string): string => {
  const lower = String(input || "")
    .trim()
    .toLowerCase();
  let output = "";
  let lastWasSeparator = false;

  for (const char of lower) {
    const isAlphaNumeric =
      (char >= "a" && char <= "z") || (char >= "0" && char <= "9");

    if (isAlphaNumeric) {
      output += char;
      lastWasSeparator = false;
      continue;
    }

    if (!lastWasSeparator) {
      output += separator;
      lastWasSeparator = true;
    }
  }

  while (output.startsWith(separator)) {
    output = output.slice(separator.length);
  }

  while (output.endsWith(separator)) {
    output = output.slice(0, -separator.length);
  }

  return output;
};

const slugifyTitle = (title: string): string => toBasicTokenString(title, "-");

const normalizeTitle = (title: string): string => {
  let normalized = String(title || "").toLowerCase();
  normalized = normalized.split("(prefix tree)").join("");
  normalized = normalized.split("to form target triplet").join("");
  normalized = normalizeWhitespace(normalized.split("traversal").join(" "));
  normalized = replaceWord(normalized, "bst", "binary search tree");
  normalized = replaceWord(normalized, "ii", "2");
  normalized = replaceWord(normalized, "iii", "3");
  normalized = replaceWord(normalized, "iv", "4");
  return toBasicTokenString(normalized, " ");
};

const buildSearchVariants = (title: string): string[] => {
  const variants = new Set<string>([title]);
  variants.add(title.split("BST").join("Binary Search Tree"));
  variants.add(title.split("Trie").join("Trie (Prefix Tree)"));
  variants.add(`${title} Traversal`);
  return Array.from(variants).filter(Boolean);
};

const shouldProcessFile = (data: unknown): data is ProblemItem[] =>
  Array.isArray(data) &&
  data.length > 0 &&
  data.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.title === "string" &&
      typeof item.slug === "string" &&
      typeof item.id === "string",
  );

const fetchQuestionMeta = async (slug: string): Promise<QuestionMeta> => {
  const response = await fetch(
    `${apiBase}/problem/${encodeURIComponent(slug)}`,
  );
  if (response.ok) {
    const payload = await response.json();
    const questionId = payload.questionId || payload.questionFrontendId;
    if (!questionId || !payload.title) {
      throw new Error(`Incomplete metadata for ${slug}`);
    }

    return {
      questionId: String(questionId),
      title: payload.title,
    };
  }

  throw new Error(`Lookup failed for ${slug}: ${response.status}`);
};

const searchQuestionMeta = async (title: string): Promise<QuestionMeta> => {
  for (const variant of buildSearchVariants(title)) {
    const response = await fetch(
      `${apiBase}/search?query=${encodeURIComponent(variant)}`,
    );
    if (!response.ok) {
      throw new Error(`Search failed for ${variant}: ${response.status}`);
    }

    const results = await response.json();
    const normalizedVariant = normalizeTitle(variant);
    const bestMatch = Array.isArray(results)
      ? results.find((item) => {
          const normalizedCandidate = normalizeTitle(item?.title || "");
          return (
            normalizedCandidate === normalizedVariant ||
            normalizedCandidate.includes(normalizedVariant) ||
            normalizedVariant.includes(normalizedCandidate)
          );
        })
      : null;

    if (!bestMatch) {
      continue;
    }

    const questionId =
      bestMatch.questionId || bestMatch.questionFrontendId || bestMatch.id;
    if (!questionId || !bestMatch.title) {
      throw new Error(`Incomplete search metadata for ${title}`);
    }

    return {
      questionId: String(questionId),
      title: bestMatch.title,
    };
  }

  throw new Error(`No title match for ${title}`);
};

const main = async (): Promise<void> => {
  const filenames = await readdir(dataDir);
  const cache = new Map<string, QuestionMeta>();

  const failures: string[] = [];

  for (const filename of filenames) {
    if (!filename.endsWith(".json")) {
      continue;
    }

    const filePath = path.join(dataDir, filename);
    const content = await readFile(filePath, "utf8");
    const data = JSON.parse(content);

    if (!shouldProcessFile(data)) {
      continue;
    }

    let changed = false;
    const nextData: ProblemItem[] = [];

    for (const item of data) {
      try {
        let meta = cache.get(item.slug);
        if (!meta) {
          try {
            meta = await fetchQuestionMeta(item.slug);
          } catch {
            meta = await searchQuestionMeta(item.title);
          }
          cache.set(item.slug, meta);
        }

        const nextId = `custom-${slugifyTitle(meta.title)}-${meta.questionId}`;
        const nextItem: ProblemItem = {
          ...item,
          id: nextId,
          title: meta.title,
          questionId: meta.questionId,
          url: buildLeetcodeUrl(item.slug),
        };

        if (
          nextItem.id !== item.id ||
          nextItem.title !== item.title ||
          nextItem.url !== item.url ||
          String(item.questionId || "") !== meta.questionId
        ) {
          changed = true;
        }

        nextData.push(nextItem);
      } catch (error) {
        failures.push(
          `${filename}:${item.slug} -> ${(error as Error).message}`,
        );
        nextData.push(item);
      }
    }

    if (changed) {
      await writeFile(
        filePath,
        `${JSON.stringify(nextData, null, 2)}\n`,
        "utf8",
      );
      console.log(`Updated ${filename}`);
    } else {
      console.log(`No changes for ${filename}`);
    }
  }

  if (failures.length) {
    console.error("Failures:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
