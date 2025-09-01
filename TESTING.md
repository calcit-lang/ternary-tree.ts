# Testing Guide

## Overview

This project uses a custom lightweight testing framework that provides colored output, test organization, and detailed error reporting.

## Running Tests

### Basic Commands

```bash
# Build and run all tests
yarn test

# Only compile (useful for checking TypeScript errors)
yarn build

# Run tests manually after building
node lib/test.mjs
```

### Selective Testing

```bash
# Run only list tests (any test with "list" in the name)
yarn test:list

# Run only map tests (any test with "map" in the name)
yarn test:map

# Use environment variable for custom filtering
TARGET=specific-test-name yarn test
```

## Test Framework Features

### Test Organization

- **Test Suites**: Use `describe()` to group related tests
- **Individual Tests**: Use `test()` for specific test cases
- **Colored Output**: Green ✓ for passing tests, red ✗ for failing tests
- **Timing**: Shows execution time for each test

### Assertion Functions

#### Basic Assertions

```typescript
check(condition: boolean, message?: string)
```

#### Equality Checks

```typescript
checkEqual<T>(actual: T, expected: T, message?: string)
checkDeepEqual<T>(actual: T, expected: T, message?: string)
```

#### Array Comparisons

```typescript
checkArrayEqual<T>(actual: Array<T>, expected: Array<T>, message?: string)
arrayEqual<T>(xs: Array<T>, ys: Array<T>): boolean
```

#### Exception Testing

```typescript
checkThrows(fn: () => void, message?: string)
```

#### Debug Utilities

```typescript
justDisplay(actual: any, expected: any)  // For comparing values visually
```

### Example Test Structure

```typescript
import { describe, test, check, checkEqual, checkArrayEqual } from "./test-utils.mjs";

export function runMyTests() {
  describe("My Component Tests", () => {
    test("should do something basic", () => {
      const result = myFunction();
      check(result !== null, "Result should not be null");
      checkEqual(result.status, "success");
    });

    test("should handle arrays correctly", () => {
      const actual = [1, 2, 3];
      const expected = [1, 2, 3];
      checkArrayEqual(actual, expected);
    });

    test("should throw on invalid input", () => {
      checkThrows(() => {
        myFunction(null);
      }, "Should throw on null input");
    });
  });
}
```

## Test Output

The framework provides:

- **Suite Organization**: Clear grouping with cyan headers
- **Individual Results**: Green checkmarks for passing tests
- **Timing Information**: Execution time for each test
- **Error Details**: Clear error messages with stack traces
- **Summary Statistics**: Total tests, passed, failed counts
- **Exit Codes**: Non-zero exit code on test failures

## Current Test Coverage

### TernaryTreeList Tests (15 tests)

- Initialization and basic operations
- List insertions and modifications
- Concatenation and merging
- Equality checking and comparison
- Balancing and structure integrity
- Iteration and traversal
- Slicing and reversal
- Index finding and mapping
- Stress testing

### TernaryTreeMap Tests (12 tests)

- Map initialization and creation
- Association and containment checking
- Structure integrity validation
- Dissociation operations
- Array conversion and iteration
- Equality and shape comparison
- Map merging with various strategies
- Value mapping transformations
- Large dataset handling

## Adding New Tests

1. Create test functions in existing or new test files
2. Use the `describe()` and `test()` structure
3. Import and call your test function in `test.mts`
4. Use appropriate assertion functions for validation
5. Run `yarn test` to verify everything works

## Performance Considerations

- Tests include timing information to identify slow operations
- Stress tests (like concat loop test) help identify performance regressions
- Structure integrity checks validate the internal tree consistency
