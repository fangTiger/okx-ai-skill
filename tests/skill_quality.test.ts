import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const skill = readFileSync('skills/agentic-contest-trader/SKILL.md', 'utf8');
const contestConfig = JSON.parse(readFileSync('config/contest.config.json', 'utf8')) as {
  execution: { primary_stack: string[] };
};
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};

function frontmatter() {
  const match = skill.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, 'SKILL.md must start with YAML frontmatter');

  return Object.fromEntries(
    match[1].split('\n').map((line) => {
      const separator = line.indexOf(':');
      assert.notEqual(separator, -1, `Invalid frontmatter line: ${line}`);
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
  );
}

test('skill has compact YAML metadata for discovery', () => {
  const metadata = frontmatter();

  assert.equal(metadata.name, 'agentic-contest-trader');
  assert.match(metadata.description, /^Use when /);
  assert.equal(metadata.description.length < 500, true);
  assert.equal(skill.split('\n').length < 220, true);
});

test('trigger description covers likely contest user phrasing without over-triggering', () => {
  const requiredTerms = [
    'OKX Agentic Wallet Trading Competition',
    'Agentic Trading Contest',
    'OnchainOS',
    'Agentic Wallet',
    'Solana',
    'X Layer',
    'General market chat',
    'Token price lookup',
  ];

  for (const term of requiredTerms) {
    assert.equal(skill.includes(term), true, `Missing trigger or guardrail term: ${term}`);
  }
});

test('skill requires OnchainOS as primary information source and Agentic Wallet execution', () => {
  assert.equal(skill.includes('主要数据源和交易工具必须是 OnchainOS 与 Agentic Wallet'), true);
  assert.equal(skill.includes('Use OnchainOS as the primary signal source'), true);
  assert.deepEqual(contestConfig.execution.primary_stack, ['OnchainOS', 'Agentic Wallet']);
});

test('instructions explain why checks exist and define an output format', () => {
  assert.equal(skill.includes('because contest decisions need chain-native information'), true);
  assert.equal(skill.includes('decision: proceed | reject | watch'), true);
  assert.equal(skill.includes('scripts/check_compliance.ts'), true);
  assert.equal(skill.includes('Proceed example:'), true);
  assert.equal(skill.includes('Reject example:'), true);
});

test('efficiency criteria are supported by reusable local scripts', () => {
  assert.equal(packageJson.scripts.test.includes('node --test'), true);
  assert.equal(packageJson.scripts['validate:config'].includes('scripts/validate_config.ts'), true);
  assert.equal(packageJson.scripts['check:compliance'].includes('scripts/check_compliance.ts'), true);
  assert.equal(packageJson.scripts.summarize.includes('scripts/summarize_trades.ts'), true);
});
