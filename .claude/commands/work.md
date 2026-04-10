# Work Command - Execute Tasks with Production Excellence

**Task Source:** $ARGUMENTS (GitHub issue URL/ID or task description)

## 🎯 Core Principles:
- **Plan Thoroughly:** Deep analysis, edge case identification, clear implementation path
- **Execute Precisely:** Follow standards, commit often, rollback when needed
- **Ship Confidently:** Validated, tested, production-ready code

### 1. **Worktree Environment Setup**
1. Pull latest code from main branch
2. Create a new git worktree with branch name based on the task in the /trees directory
3. Copy .env.local from /Users/cbrane/crcle-platform/.env.local to new worktree
4. Copy entire .claude folder contents from /Users/cbrane/crcle-platform/.claude to new worktree
5. Run npm install in new worktree
6. Export SUPABASE_DB_PASSWORD from .env.local (using the SUPABASE_DB_PW value) and run: supabase link --project-ref updxiwjdqmwxigvlvmtd
7. Show the new worktree path and confirm setup is complete

### 2. **Task Definition & Planning**
- **GitHub Issue:** If URL/ID provided, use `gh issue view` to pull full details
- **Direct Task:** Use provided description as specification
- **Deep Analysis:**
  - Break down into concrete implementation steps
  - Identify ALL affected systems and components  
  - Map database schema changes (tables, constraints, RLS policies)
  - **Edge Case Planning (CRITICAL):**
    - Invalid/missing data scenarios
    - Permission/authorization failures
    - External service failures
    - Network/database connection issues
    - Boundary conditions and limits

### 3. **Implementation Execution**
- **Code with Production Standards:**
  - Follow existing patterns and conventions
  - TypeScript strict mode - no `any` types
  - Proper error handling and user feedback
  - Loading states and error boundaries
- **Commit Frequently:** After each logical unit of work
- **Database Changes:** 
  - Create migrations: `supabase migration new <name>`
  - Apply to cloud: `supabase db push`
  - Verify RLS policies are in place
- **Use Available Resources:**
  - Supabase MCP for database operations
  - Context7 MCP for documentation needs
- **Version Control:**
  - Commit after each logical unit (feature, fix, refactor)
  - Use `git commit -m "wip: [description]"` before experiments
  - Rollback with `git reset --hard HEAD~1` if approach fails

### 4. **Quality Validation**
- **Write Tests:** Cover core functionality and edge cases (after implementation) - use vitest
- **Run Full Test Suite:** `npm test` - fix any failures immediately
- **Lint Check:** `npm run lint` - zero tolerance for warnings
- **Build Validation:** `npm run build` - must succeed cleanly
- **Security Scan:** Use `mcp__supabase__get_advisors` to check for vulnerabilities

### 5. **Final Checklist**
- [ ] All requirements implemented
- [ ] Edge cases handled gracefully  
- [ ] Tests pass (100% rate)
- [ ] Linter passes (zero warnings)
- [ ] Build succeeds
- [ ] Database changes applied and tested
- [ ] Commits are clean with meaningful messages
- [ ] Manual testing confirms expected behavior

## 📋 Task Format Examples

**GitHub Issue:**
```
https://github.com/org/repo/issues/123
# or just
#123
```

**Direct Task:**
```
Add investor portfolio export functionality with CSV and PDF formats
```

## 🚫 Failure Protocol
- **Test/Build Failures:** Stop, analyze root cause, fix properly (no patches)
- **Complex Issues:** Commit WIP, consider rollback, restart with better approach
- **Database Issues:** Verify migrations, check RLS policies, test with real data

**Remember: Ship production-ready code. Every commit should be deployable.**