import { cmp } from "./utils.mjs";

// Test framework state
interface TestStats {
  total: number;
  passed: number;
  failed: number;
  suites: number;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  passed: boolean;
  error?: Error;
  duration?: number;
}

const stats: TestStats = { total: 0, passed: 0, failed: 0, suites: 0 };
const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export function describe(suiteName: string, cb: () => void): void {
  const target = process?.env["target"];
  if (target != null && !suiteName.includes(target)) {
    return;
  }

  console.log(`\n${colors.cyan}${colors.bright}○ ${suiteName}${colors.reset}`);

  const suite: TestSuite = { name: suiteName, tests: [] };
  suites.push(suite);
  currentSuite = suite;
  stats.suites++;

  try {
    cb();
  } catch (error) {
    console.log(`${colors.red}Suite "${suiteName}" failed to execute: ${error}${colors.reset}`);
  }

  currentSuite = null;
}

export function test(testName: string, cb: () => void): void {
  const target = process?.env["target"];
  if (target != null && !testName.includes(target)) {
    return;
  }

  const testCase: TestCase = { name: testName, passed: false };
  if (currentSuite) {
    currentSuite.tests.push(testCase);
  }

  stats.total++;
  const startTime = Date.now();

  try {
    cb();
    testCase.passed = true;
    testCase.duration = Date.now() - startTime;
    stats.passed++;
    console.log(`  ${colors.green}✓${colors.reset} ${testName} ${colors.cyan}(${testCase.duration}ms)${colors.reset}`);
  } catch (error) {
    testCase.passed = false;
    testCase.error = error as Error;
    testCase.duration = Date.now() - startTime;
    stats.failed++;
    console.log(`  ${colors.red}✗${colors.reset} ${testName} ${colors.cyan}(${testCase.duration}ms)${colors.reset}`);
    console.log(`    ${colors.red}${(error as Error).message}${colors.reset}`);
  }
}

export function check(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function checkEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    const errorMessage = message || `Expected ${expected}, but got ${actual}`;
    throw new Error(errorMessage);
  }
}

export function checkDeepEqual<T>(actual: T, expected: T, message?: string): void {
  if (!deepEqual(actual, expected)) {
    const errorMessage = message || `Deep equality check failed:\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`;
    throw new Error(errorMessage);
  }
}

export function checkThrows(fn: () => void, message?: string): void {
  try {
    fn();
    throw new Error(message || "Expected function to throw, but it didn't");
  } catch (error) {
    // Success - function threw as expected
  }
}

export function arrayEqual<T>(xs: Array<T>, ys: Array<T>): boolean {
  if (xs.length != ys.length) {
    return false;
  }
  for (let idx = 0; idx < xs.length; idx++) {
    if (xs[idx] !== ys[idx]) {
      return false;
    }
  }
  return true;
}

export function checkArrayEqual<T>(actual: Array<T>, expected: Array<T>, message?: string): void {
  if (!arrayEqual(actual, expected)) {
    const errorMessage = message || `Arrays are not equal:\nActual: [${actual.join(", ")}]\nExpected: [${expected.join(", ")}]`;
    throw new Error(errorMessage);
  }
}

export function justDisplay(x: any, y: any): void {
  console.group("Compare:");
  console.log(x);
  console.log(y);
  console.groupEnd();
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

export function printTestSummary(): void {
  console.log(`\n${colors.bright}Test Summary:${colors.reset}`);
  console.log(`${colors.cyan}Suites: ${stats.suites}${colors.reset}`);
  console.log(`${colors.cyan}Tests:  ${stats.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${stats.passed}${colors.reset}`);

  if (stats.failed > 0) {
    console.log(`${colors.red}Failed: ${stats.failed}${colors.reset}`);
    console.log(`\n${colors.red}${colors.bright}❌ ${stats.failed} test(s) failed${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bright}✅ All tests passed!${colors.reset}`);
  }
}
