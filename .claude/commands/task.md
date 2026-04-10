# Task Workflow Command

Execute the complete task development workflow using git worktrees for parallel development.

## 🚨 NON-NEGOTIABLE REQUIREMENT: 100% Test Pass Rate

**ALL TESTS MUST PASS BEFORE TASK COMPLETION**

If any test fails at any stage: **STOP, FIX, RE-RUN** until 100% pass rate is achieved.

## Task Specification

Task file: $ARGUMENTS

## Complete Workflow Steps

1. **Environment Setup**
   - Pull latest code from main branch
   - **Baseline Check: Run `npm test` - All tests must pass before proceeding**
   - Create new git worktree for task isolation
   - Copy env.local file from /Users/cbrane/crcle-platform/.env.local to our new worktree directory so that our API keys are configured to work with our new worktree
   - Copy our settings.local.json file from /Users/cbrane/crcle-platform/.claude/settings.local.json to our new worktree directory into our .claude folder so that our settings are the same for our worktree as in our original project
   - Install dependencies in new worktree 'npm install'
   - **Set up Supabase CLI: Run `supabase link` to connect to cloud project database**
   - Verify development environment setup
   - **Environment Verification: Run `npm test` in new worktree**

2. **Task Analysis & Edge Case Planning**
   - Read and analyze the provided task specification file
   - Break down requirements into actionable steps
   - Identify affected components and systems
   - **CRITICAL: Comprehensive edge case identification**
     - What happens with invalid/missing data?
     - What are the boundary conditions?
     - What external service failures could occur?
     - What user input variations need handling?
     - What network/database connection issues could arise?
     - What permission/authorization edge cases exist?
   - Plan implementation approach with edge cases prioritized
   - **Identify any database schema changes needed (tables, columns, constraints, indexes)**

3. **Development Execution (TDD Approach)**
   - Follow TDD: write failing tests first, then implementation
   - Implement feature following our coding standards
   - **Start with edge case tests before happy path tests**
   - Implement comprehensive error handling for all identified edge cases
   - Add input validation for boundary conditions
   - Implement fallback mechanisms for external service failures
   - Ensure TypeScript strict mode compliance
   - Add proper loading states and error boundaries
   - **Development Check: Run tests after major implementation milestones**

4. **Testing & Validation (Edge Case Focus)**
   - **Prioritize edge case test coverage (60% edge cases, 40% happy path)**
   - Write comprehensive tests covering:
     - All identified edge cases and boundary conditions
     - Error scenarios and recovery mechanisms
     - Integration failures and fallback behaviors
     - Invalid input handling and sanitization
     - Permission denied and unauthorized access scenarios
     - Network timeout and service unavailability
     - Happy path functionality
   - **Critical Validation: Run full test suite - 100% pass rate required**
   - Fix any test failures immediately before proceeding
   - Verify edge case coverage meets requirements

5. **Code Quality Assurance**
   - Run linter on entire codebase and fix all issues
   - Ensure no console.log statements or debug code
   - Verify TypeScript strict mode compliance
   - Remove any commented-out code

6. **Database Changes & Build Validation**
   - **Apply any database changes through Supabase CLI (Cloud Version):**
     - Create migration files: `supabase migration new <migration_name>` for schema changes
     - Review and edit migration SQL files in `supabase/migrations/`
     - Apply migrations to cloud database: `supabase db push`
     - Verify RLS policies and constraints are properly applied
     - Test database changes with real data scenarios
           - **Note: Use `context7` MCP server for Supabase CLI documentation if needed**
   - Run npm run build to ensure production build succeeds
   - Verify no build warnings or errors
   - Test development server functionality
   - Confirm all features work as expected

7. **Final Validation**
   - **Final Test Run: Complete test suite - MUST achieve 100% pass rate**
   - **Final Database Validation: Ensure all cloud database changes are applied and tested**
   - Re-run linter to ensure no issues remain
   - Perform manual testing of implemented features
   - Verify existing functionality remains unaffected
   - **Confirm database migrations are properly applied to cloud database**

## 🚨 Test Failure Protocol

**If ANY test fails:**
1. **STOP development immediately**
2. **Fix the failing test before any other work**
3. **Re-run full test suite**
4. **Only proceed when 100% pass rate is restored**

**NO EXCEPTIONS. NO "FIX IT LATER".**

## Git Worktree Setup (setup worktrees within the trees/ directory in our project)

```bash
# Pull latest from main
git checkout main && git pull origin main

# Verify clean baseline
npm test

# Create new worktree for task
git worktree add trees/crcle-task-[task-name] -b feature/[task-name]

# Navigate to worktree
cd ../crcle-task-[task-name]

# Copy environment file
cp /Users/cbrane/crcle-platform/.env.local .

# Install dependencies
npm install

# Set up Supabase CLI (connects to cloud project)
supabase link

# Verify setup
npm test && npm run build
```

## Success Criteria

Task is complete ONLY when:

1. **🚨 ALL TESTS PASS (100% pass rate) - NON-NEGOTIABLE**
2. **🚨 ALL DATABASE CHANGES APPLIED AND TESTED**
3. No linting errors in entire codebase
4. Production build succeeds without warnings
5. Manual testing confirms expected behavior
6. All requirements from task specification are met
7. Code follows our production standards

## Task File Format

Provide the task specification as a markdown file containing:
- Clear requirements and acceptance criteria
- User stories and workflows to implement
- Technical specifications and constraints
- Testing requirements and scenarios
- Database schema changes if needed

Execute this workflow to ensure comprehensive, production-ready task completion with mandatory 100% test pass rate.