# AI Agent Documentation - Portfolio Events API

---

### The crucial rules for AI Agent Developer

## Core Engineering Principles

Programming is deterministic engineering, not trial-and-error problem solving. Given identical inputs and environment states, the same code produces consistent outputs. Follow systematic development approach:

## Pre-Development Assessment Workflow

Before any code changes, (at the beginning of eac iteration) address these questions:

- **What**: Clear requirements and specifications
- **Why**: Business logic and purpose understanding
- **Expectations**: Predicted outcomes and success criteria of the current iteration not generaly
- **Risks**: Potential failure modes and side effects
- **Rollback**: Recovery procedures to restore previous state

## Rollback Safety Protocol

Maintain comprehensive rollback mechanisms:

- Version control with meaningful commits
- Database backups before schema changes
- Deployment snapshots for infrastructure changes
- Test environment isolation to prevent production impact

## ITERATION IMPLEMENTATION DIRECTIVE

You are a test AI AGENT development specialist. Follow these strict requirements:
Core Rules

ITERATION IMPLEMENTATION DIRECTIVE

You are a test AI AGENT development specialist. Follow these strict requirements:
Core Rules

1. MANDATORY: AT THE BEGINNING OF THE EACH ITERATION GIVE INFO AS EXPLAINED IN CLAUDE.md FILE.

2. NEVER use any type - Always use proper TypeScript types

3. MANDATORY: 100% coverage for ALL THREE metrics
   - Statements coverage: 100% (REQUIRED)
   - Branch coverage: 100% (REQUIRED)
   - Functions coverage: 100% (REQUIRED)
   - ABSOLUTE MINIMUM if 100% impossible: 80% for each metric

4. Apply these rules at every step of test creation Workflow:
   Per Iteration Workflow (from CLAUDE.md) → Write ONE test / ONE file → Fix TS errors → Fix lint → Run test → Report coverage → Wait for confirmation → If it is needed create unit tests one by one → improve unit test coverage fullfil the requirements → check full coverage for nit tests and make imrovement until the all files coverage meet requirements, If it is needed create integration tests one by one → improve integration test coverage fullfil the requirements, check full coverage for nit tests and make imrovement until the all files coverage meet requirements → Repeat

The Complete Iteration Pattern:

1. Start Iteration (from CLAUDE.md requirements)

2. Write ONE test OR ONE file (never both)
   - Either add one test to existing test file
   - OR modify one source file
   - NEVER multiple tests in single iteration

3. Fix TypeScript errors (if any)
   - Run npx tsc --noEmit to check

4. Fix lint errors (if any)
   - Run npm run lint

5. Run tests
   - Execute relevant test command

6. Report coverage
   - Show exact coverage metrics
   - All four metrics: statements, branches, functions, lines

7. Wait for confirmation

- STOP and wait for user to say "proceed" or similar.

8. Unit Tests Phase (if needed)
   - Create unit tests ONE BY ONE
   - Each test follows steps 2-7
   - Improve coverage incrementally
   - Continue until all files meet requirements (100% or min 80%)

9. Integration Tests Phase (if needed)
   - Create integration tests ONE BY ONE
   - Each test follows steps 2-7
   - Improve coverage incrementally
   - Continue until all files meet requirements

10. Repeat
    - Go back to step 1 for next iteration

Key Rules I Must Follow: - NEVER skip waiting for confirmation - NEVER add multiple tests at once - ALWAYS report coverage after running tests - ALWAYS fix TS/lint errors before running tests - NEVER proceed if coverage decreases

This ensures systematic, predictable development where each change is isolated, tested, and validated before moving forward.

Success Criteria

- ✅ Zero TypeScript/lint errors
- ✅ 100% coverage for ALL THREE metrics (statements, branches, functions) OR minimum 80% each if impossible
- ✅ All tests passing
- ✅ Complete file before proceeding

### Unit Test Engineering Principles

**Core Philosophy**: Unit testing validates isolated component behavior in complete isolation from external dependencies. Mock all external dependencies to test pure business logic. Think systematically—coding is not trial-and-error problem solving. Programming is engineering, and it follows deterministic principles. Given identical inputs and environment states, the same code produces consistent outputs. Avoid ad-hoc development. Don't implement without predicting outcomes. At each development phase, address these questions: What (requirements/specification), Why (business logic/purpose), Expectations(What we expect as result), Risks (failure modes/side effects). Ensure rollback mechanisms are in place—maintain version control, database backups, and deployment snapshots so any change can be reverted without data loss. After execution, immediately validate results against expected behaviour and be prepared to rollback if outcomes don't match expectations.

## Unit Test Systematic Approach

**Per Iteration Workflow**:

1. **Rationale**: Why this unit test is necessary for component validation
2. **Specification**: What specific method/function behavior will be tested
3. **Expected Output**: Predicted function return values, state changes, method calls
4. **Risk Assessment**: Potential failure modes (invalid inputs, edge cases, error conditions)
5. **Rollback Plan**: How to restore clean test state (mock resets, object restoration)
6. **Post-execution Validation**: Verify test results, coverage metrics, TypeScript compliance
7. DON'T START TO EXECUTE THE ITERATION BEFORE MY CONFIRMATION.

**CRITICAL WORKFLOW ENFORCEMENT - The Atomic Testing Rule**:

**Rule**: NEVER add multiple tests in a single iteration. This rule exists to prevent test interference and maintain debugging capabilities.

**What happens when violated**:

- Previously covered branches can lose coverage due to test interference
- Mock pollution between tests can break existing test execution
- Shared state contamination affects test isolation
- Impossible to identify which specific change caused the regression
- Coverage can appear to "improve" while actually breaking existing coverage

**Real-world consequence example**:

- BEFORE: Previously covered lines under branch coverage
- AFTER adding multiple tests: Same lines lost branch coverage despite higher total percentage
- Result: Higher coverage percentage but broken existing coverage - logically impossible unless test interference occurred

**Why one test per iteration matters**:

- Immediate identification of breaking changes
- Clean rollback capability to last working state
- Preservation of existing test coverage
- Maintainable and debuggable test development
- Prevention of cumulative test interference bugs

**Enforcement**: If any existing coverage decreases after adding a test, the iteration MUST be rolled back and the interference identified before proceeding.

- ✅ After making changes, check lint/TypeScript errors BEFORE running tests
- ✅ Run tests with coverage after each iteration
- ✅ Provide formatted coverage results

**Expected Coverage Format**:

```
Test Suites: 36 passed, 36 total
Tests:       802 passed, 802 total
Snapshots:   0 total
Time:        5.203 s
Ran all test suites.
```

**Coverage Requirements**: ALL metrics must be ≥80%:

- Statements: ≥80%
- Branches: ≥80%
- Functions: ≥80%
- Lines: ≥80%

### Integration Test Engineering Principles

**Core Philosophy**: Integration testing validates component interactions and end-to-end request-response cycles. Test the complete middleware chain: HTTP → Middleware → Controllers → Services → Database → Response.

## Integration Test Systematic Approach

**Per Iteration Framework**:

1. **Rationale**: Why this integration test is necessary for system validation
2. **Specification**: What end-to-end scenario will be tested (HTTP request → response)
3. **Expected Output**: Predicted HTTP status, response body, database state changes
4. **Risk Assessment**: Potential failure modes (server errors, database issues, middleware failures)
5. **Rollback Plan**: How to restore clean test state (database cleanup, server reset)
6. **Post-execution Validation**: Verify HTTP response, database state, side effects

**Integration Test Iteration Rules**:

## Test Organization Structure

**Mirror Directory Structure**: Test folders must mirror src structure exactly:

```

test/
├── unit/                    # Unit tests mirror src/
│   ├── controllers/         # Mirror src/controllers/
│   ├── services/           # Mirror src/services/
│   ├── middleware/         # Mirror src/middleware/
│   └── utils/              # Mirror src/utils/
├── integration/            # Integration tests
│   ├── controllers/        # End-to-end controller tests
│   └── services/           # Service integration tests
└── e2e/                    # End-to-end application tests

```

**Test File Naming**: `{filename}.spec.ts` for unit tests, `{filename}.integration.spec.ts` for integration tests

**Jest Configuration**: Separate configs for each test type:

- `test/jest-unit.json` - Unit test configuration
- `test/jest-integration.json` - Integration test configuration
- `test/jest-e2e.json` - E2E test configuration
