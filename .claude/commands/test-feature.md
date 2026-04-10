# Test Feature Command  

Generate comprehensive test suite for a specific feature or component.

## Feature/Component: $ARGUMENTS

## Test Generation Strategy

1. **Test Structure Setup**
   - Create test file following naming convention
   - Set up proper test environment and mocks
   - Import necessary testing utilities and helpers

2. **Happy Path Testing**
   - Test successful completion of main user journey
   - Verify correct UI state changes during normal flow
   - Test successful API interactions and data flow
   - Validate expected outputs for typical inputs

3. **Edge Case Testing**
   - Test with empty, null, or undefined data
   - Test with invalid input formats and types
   - Test boundary conditions (min/max values)
   - Test with malformed or unexpected data structures

4. **Error Scenario Testing**
   - Test network failure handling
   - Test authentication/authorization failures
   - Test database connection issues
   - Test third-party service failures (Stripe, Plaid, Clerk)

5. **Integration Testing**
   - Test interactions with other components
   - Test API endpoint integration
   - Test database operations and transactions
   - Test authentication flow integration

6. **Security Testing** (if applicable)
   - Test authentication and authorization
   - Test input validation and sanitization
   - Test for XSS and injection vulnerabilities
   - Test access control enforcement

## Test Categories Required

### For React Components:
```typescript
describe('Component: [ComponentName]', () => {
  describe('Rendering', () => {
    // Initial render, loading states, prop variations
  })
  describe('User Interactions', () => {
    // Click handlers, form submissions, state updates
  })
  describe('Error Handling', () => {
    // Error states, recovery mechanisms
  })
})
```

### For API Endpoints:
```typescript
describe('API: /api/[endpoint]', () => {
  describe('Authentication', () => {
    // Auth required, valid/invalid tokens
  })
  describe('Authorization', () => {
    // Role-based access, data access controls
  })
  describe('Validation', () => {
    // Input validation, field requirements
  })
  describe('Business Logic', () => {
    // Core functionality, edge cases
  })
})
```

### For Utility Functions:
```typescript
describe('Utility: [FunctionName]', () => {
  describe('Valid Inputs', () => {
    // Expected behavior with correct inputs
  })
  describe('Invalid Inputs', () => {
    // Error handling, type validation
  })
  describe('Edge Cases', () => {
    // Boundary conditions, special cases
  })
})
```

## Performance Requirements

- Unit tests should complete in <10ms each
- Integration tests should complete in <100ms each
- Mock external dependencies appropriately
- Use test data factories for consistent test setup

## Coverage Requirements

- Test all public methods and exported functions
- Test all user-facing functionality
- Test all error conditions and recovery paths
- Test all security-critical code paths

## Success Criteria

Tests are complete when:
- All test categories are covered
- 100% pass rate achieved
- Performance requirements met
- No flaky or intermittent test failures
- Proper mocking of external dependencies

Generate comprehensive tests following our TDD approach and production standards.