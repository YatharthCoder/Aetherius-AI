import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { sanitizeErrorForLog } from "../server.js";

test("Resilience Unit Tests - sanitizeErrorForLog", () => {
  // 1. Quota error mapping
  const quotaErr1 = { message: "API_KEY_INVALID: Resource has been exhausted (e.g. 429 quota reached)" };
  assert.strictEqual(sanitizeErrorForLog(quotaErr1), "rate_limit_active");

  const quotaErr2 = new Error("RESOURCE_EXHAUSTED: quota limit reached");
  assert.strictEqual(sanitizeErrorForLog(quotaErr2), "rate_limit_active");

  // 2. Unavailable error mapping
  const tempErr = { message: "503 Service Unavailable: overloaded" };
  assert.strictEqual(sanitizeErrorForLog(tempErr), "service_temp_unavailable");

  // 3. Simple message truncation
  const standardErr = "A very long custom error message to make sure that the sanitization routine successfully truncates it to prevent leaking oversized verbose traces to our UI";
  const sanitized = sanitizeErrorForLog(standardErr);
  assert.ok(sanitized.length <= 100);
  assert.strictEqual(sanitized, "A very long custom error message to make sure that the sanitization routine successfully truncates i");
});

test("MCP Corpus Database Integrity Tests", () => {
  const corpusPath = path.join(process.cwd(), "notes_corpus.json");
  assert.ok(fs.existsSync(corpusPath), "notes_corpus.json file must exist at the project root");

  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf-8"));
  assert.ok(typeof corpus === "object" && corpus !== null, "notes_corpus should be a valid JSON object");
  assert.ok(corpus["Math"], "Math key should exist in notes_corpus");
  assert.ok(Array.isArray(corpus["Math"].concepts), "Math should contain a 'concepts' array");
  assert.ok(Array.isArray(corpus["Math"].lectures), "Math should contain a 'lectures' array");
});

test("MCP Taxonomy Vectors Database Integrity Tests", () => {
  const vectorsPath = path.join(process.cwd(), "taxonomy_vectors.json");
  assert.ok(fs.existsSync(vectorsPath), "taxonomy_vectors.json file must exist at the project root");

  const vectors = JSON.parse(fs.readFileSync(vectorsPath, "utf-8"));
  assert.ok(typeof vectors === "object" && vectors !== null, "taxonomy_vectors should be a valid JSON object");
  assert.ok(Array.isArray(vectors["active recall"]), "active recall key should contain an array of vectors");

  const firstVector = vectors["active recall"][0];
  assert.ok(firstVector.term, "Vectors should have a 'term' field");
  assert.ok(firstVector.definition, "Vectors should have a 'definition' field");
});

test("MCP Analogies Database Integrity Tests", () => {
  const analogiesPath = path.join(process.cwd(), "analogies_db.json");
  assert.ok(fs.existsSync(analogiesPath), "analogies_db.json file must exist at the project root");

  const database = JSON.parse(fs.readFileSync(analogiesPath, "utf-8"));
  assert.ok(typeof database === "object" && database !== null, "analogies_db should be a valid JSON object");
  assert.ok(database.recursion, "Recursion key must exist in analogies_db");
  assert.ok(database.recursion.metaphor, "Recursion analogy must have a 'metaphor' text field");
});
