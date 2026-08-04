import deepinfraService from './src/services/deepinfra.service.js';

const DELAY_MS = 60000;

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';

function log(label, data) {
  console.log(`\n${CYAN}━━━ ${label} ${'━'.repeat(Math.max(0, 50 - label.length))}${RESET}`);
  console.log(JSON.stringify(data, null, 2));
}

function pass(label) {
  console.log(`${GREEN}✔ PASS${RESET} — ${label}`);
}

function fail(label, err) {
  console.log(`${RED}✘ FAIL${RESET} — ${label}`);
  console.error(`  ${err.message}`);
  if (err.stack) console.error(err.stack.split('\n').slice(1, 4).join('\n'));
}

function countdown(seconds) {
  return new Promise(resolve => {
    let remaining = seconds;
    const interval = setInterval(() => {
      process.stdout.write(`\r${YELLOW}⏳ Next test in ${remaining}s...${RESET}   `);
      remaining--;
      if (remaining < 0) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(40) + '\r');
        resolve();
      }
    }, 1000);
  });
}

// ─── Test Data ────────────────────────────────────────────────────────────────

const COMPANY_TEXT = `
WaGo Training Co., Ltd. is a Tokyo-based language training company founded in 2018.
We specialize in Japanese business communication for foreign employees in the manufacturing,
hospitality, and logistics sectors. Our head office is located at 2-5-1 Marunouchi,
Chiyoda-ku, Tokyo 100-0005, Japan. We help global teams integrate smoothly into
Japanese work culture through AI-powered pronunciation coaching and scenario-based learning.
`;

const PRONUNCIATION_CASES = [
  {
    label: 'Close match — greeting',
    expected: 'おはようございます',
    actual: 'おはようごさいます',
    context: { romaji: 'ohayou gozaimasu', english: 'Good morning (formal)', topicName: 'Greetings' }
  },
  {
    label: 'Poor match — customer service phrase',
    expected: 'いらっしゃいませ',
    actual: 'いらしゃいませ',
    context: {
      romaji: 'irasshaimase',
      english: 'Welcome (to a shop)',
      topicName: 'Customer Service',
      backgroundContext: 'Retail / hospitality front-of-house',
      aiInstructions: 'Focus on the double-s sound in irasshaimase'
    }
  }
];

const FREE_TALK_MESSAGES = [
  { role: 'user', content: 'こんにちは！今日は天気がいいですね。' }
];

const FREE_TALK_CONTEXT = {
  industry: 'Manufacturing',
  companyName: 'WaGo Training',
  topicName: 'Small Talk',
  backgroundContext: 'Factory floor casual conversation between colleagues',
  vocabularyList: [
    { japanese: '工場', romaji: 'koujou', english: 'factory' },
    { japanese: '同僚', romaji: 'douryou', english: 'colleague' }
  ]
};

const PHRASE_GEN_CASES = [
  {
    label: 'Beginner — Greetings',
    topic: 'Office Greetings',
    difficulty: 'beginner',
    count: 3,
    context: { industry: 'General Business' }
  },
  {
    label: 'Intermediate — Manufacturing safety',
    topic: 'Safety Instructions on the Factory Floor',
    difficulty: 'intermediate',
    count: 3,
    context: { industry: 'Manufacturing' }
  }
];

// ─── Validators ───────────────────────────────────────────────────────────────

function validateCompanyInfo(result) {
  const required = ['name', 'industry', 'address', 'introduction'];
  const missing = required.filter(k => !(k in result));
  if (missing.length) throw new Error(`Missing keys: ${missing.join(', ')}`);
  if (!result.name) throw new Error('Company name was not extracted');
}

function validatePronunciationFeedback(result) {
  if (typeof result.score !== 'number') throw new Error('score must be a number');
  if (result.score < 0 || result.score > 100) throw new Error(`score out of range: ${result.score}`);
  if (typeof result.feedback !== 'string' || !result.feedback) throw new Error('feedback string missing');
  if (!Array.isArray(result.suggestions)) throw new Error('suggestions must be an array');
}

function validateFreeTalk(result) {
  if (!result.japanese) throw new Error('japanese field missing');
  if (!result.romaji && result.romaji !== '') throw new Error('romaji field missing');
  if (!result.english && result.english !== '') throw new Error('english field missing');
}

function validatePhrases(result) {
  if (!Array.isArray(result) || result.length === 0) throw new Error('Expected non-empty array of phrases');
  const first = result[0];
  const required = ['japanese', 'romaji', 'english', 'usageContext'];
  const missing = required.filter(k => !(k in first));
  if (missing.length) throw new Error(`Phrase missing keys: ${missing.join(', ')}`);
}

// ─── Test Runner ──────────────────────────────────────────────────────────────

async function runTests() {
  const results = { passed: 0, failed: 0 };
  const tests = [];

  // Test 1 — extractCompanyInfo
  tests.push(async () => {
    const label = 'extractCompanyInfo — company paragraph';
    try {
      const result = await deepinfraService.extractCompanyInfo(COMPANY_TEXT, 'text');
      log(label, result);
      validateCompanyInfo(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // Test 2 — getPronunciationFeedback (close match)
  tests.push(async () => {
    const c = PRONUNCIATION_CASES[0];
    const label = `getPronunciationFeedback — ${c.label}`;
    try {
      const result = await deepinfraService.getPronunciationFeedback(c.expected, c.actual, c.context);
      log(label, result);
      validatePronunciationFeedback(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // Test 3 — getPronunciationFeedback (poor match with rich context)
  tests.push(async () => {
    const c = PRONUNCIATION_CASES[1];
    const label = `getPronunciationFeedback — ${c.label}`;
    try {
      const result = await deepinfraService.getPronunciationFeedback(c.expected, c.actual, c.context);
      log(label, result);
      validatePronunciationFeedback(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // Test 4 — freeTalkConversation
  tests.push(async () => {
    const label = 'freeTalkConversation — casual greeting with manufacturing context';
    try {
      const result = await deepinfraService.freeTalkConversation(FREE_TALK_MESSAGES, FREE_TALK_CONTEXT);
      log(label, result);
      validateFreeTalk(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // Test 5 — generatePhrases (beginner)
  tests.push(async () => {
    const c = PHRASE_GEN_CASES[0];
    const label = `generatePhrases — ${c.label}`;
    try {
      const result = await deepinfraService.generatePhrases(c.topic, c.difficulty, c.count, c.context);
      log(label, result);
      validatePhrases(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // Test 6 — generatePhrases (intermediate)
  tests.push(async () => {
    const c = PHRASE_GEN_CASES[1];
    const label = `generatePhrases — ${c.label}`;
    try {
      const result = await deepinfraService.generatePhrases(c.topic, c.difficulty, c.count, c.context);
      log(label, result);
      validatePhrases(result);
      pass(label);
      results.passed++;
    } catch (err) {
      fail(label, err);
      results.failed++;
    }
  });

  // ─── Execute with 30s gap ─────────────────────────────────────────────────
  console.log(`\n${CYAN}╔══════════════════════════════════════════════════╗`);
  console.log(`║      DeepInfra Service — Integration Tests       ║`);
  console.log(`║  ${tests.length} tests · 30s delay between each call          ║`);
  console.log(`╚══════════════════════════════════════════════════╝${RESET}\n`);

  for (let i = 0; i < tests.length; i++) {
    console.log(`${YELLOW}[${i + 1}/${tests.length}] Running test...${RESET}`);
    await tests[i]();
    if (i < tests.length - 1) {
      await countdown(60);
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  const total = results.passed + results.failed;
  console.log(`\n${CYAN}━━━ Results ${'━'.repeat(40)}${RESET}`);
  console.log(`${GREEN}Passed: ${results.passed}/${total}${RESET}`);
  if (results.failed > 0) {
    console.log(`${RED}Failed: ${results.failed}/${total}${RESET}`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}✔ All tests passed — DeepInfra API is working correctly.${RESET}\n`);
  }
}

runTests().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
