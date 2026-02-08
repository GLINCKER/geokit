# Contributing to Geokit

Thank you for your interest in contributing to Geokit! We welcome contributions of all kinds.

## Getting Started

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/geokit.git
cd geokit

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

### Project Structure

```
geokit/
├── packages/
│   ├── geo-audit/      # Core auditing package with rules
│   └── geo-check/      # CLI tool for running audits
```

## Adding a New Rule

1. **Create the rule file** in `packages/geo-audit/src/rules/`:
   ```typescript
   // r99-your-rule.ts
   import { Rule, CheckResult } from '../types';

   export const r99YourRule: Rule = {
     id: 'r99-your-rule',
     name: 'Your Rule Name',
     check: async (context) => {
       // Your check logic here
       return {
         passed: true,
         message: 'Check passed'
       };
     }
   };
   ```

2. **Add to the index** in `packages/geo-audit/src/rules/index.ts`:
   ```typescript
   export { r99YourRule } from './r99-your-rule';
   ```

3. **Write tests** in `packages/geo-audit/src/__tests__/`:
   ```typescript
   // r99-your-rule.test.ts
   import { describe, it, expect } from 'vitest';
   import { r99YourRule } from '../rules/r99-your-rule';

   describe('r99-your-rule', () => {
     it('should pass when...', async () => {
       // Test logic
     });
   });
   ```

4. **Run your tests**:
   ```bash
   # Run all tests
   npm run test

   # Run a specific test file
   npx vitest run src/__tests__/r99-your-rule.test.ts
   ```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npx vitest run src/__tests__/r01-llms-txt.test.ts

# Run tests with coverage
npm run test:coverage
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features or rules
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `chore:` Maintenance tasks

Examples:
```
feat: add r99-check-mobile-meta rule
fix: handle missing robots.txt correctly
docs: update rule examples in README
test: add edge cases for r01-llms-txt
```

## Pull Request Process

1. Fork the repository and create a new branch
2. Make your changes and write tests
3. Ensure all tests pass: `npm run test`
4. Ensure code type-checks: `npm run typecheck`
5. Submit a pull request with a clear description

## Code Style

- Use TypeScript strict mode
- Follow the existing code patterns
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write descriptive test names

## Questions?

Feel free to open an issue for any questions or discussions.

---

Made by [Glincker](https://glincker.com)
