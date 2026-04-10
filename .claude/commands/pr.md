# PR Workflow & Validation Command

Execute the complete PR workflow with comprehensive validation following our production-ready standards.

## Comprehensive PR Workflow Steps

1. **Build comprehensive tests** for all new functionality
2. **Run full test suite** and ensure 100% pass rate
3. **Run linter** and fix all issues
4. **Validate development server** (npm run dev)
5. **Validate production build** (npm run build)
6. **Security review** - comprehensive security validation
7. **Final validation** - re-run tests and linter
8. **Analyze changes** - review git diff and commit history since main
9. **Generate PR title** - create descriptive title following our format standards
10. **Generate PR description** - comprehensive description using our template
11. **Create PR** - use gh pr create with generated title and description
12. **Apply labels** - add appropriate type, priority, size, and area labels

## Validation Requirements

### Test Development
- Create tests for all new functionality
- Focus on critical paths and edge cases
- Include happy path, edge cases, and integration tests
- Ensure 100% pass rate before proceeding

### Code Quality Gates
- Zero linting errors or warnings
- All TypeScript strict mode compliance
- No console.log statements in production code
- No commented-out code blocks

### Functionality Gates
- All new features work as designed
- Existing functionality remains unaffected
- Error handling is comprehensive and user-friendly
- Loading states implemented where appropriate

### Performance Gates
- Build time impact is minimal
- Bundle size increase is justified
- Database queries are optimized
- API response times are acceptable

### Security Gates (Comprehensive Review)
- **Authentication & Authorization**: Verify auth checks at all endpoints, role-based access control
- **Input Validation**: Zod schemas implemented, server-side validation, proper sanitization
- **Data Protection**: RLS policies on database tables, sensitive data handling
- **Injection Prevention**: SQL injection prevention, XSS protection measures
- **API Security**: Proper CORS, rate limiting, error handling without information leakage
- **Environment Security**: No hard-coded secrets, proper environment variable usage
- No sensitive data exposed in logs or errors

## Success Criteria

A branch is ready for PR when:
- All validation steps complete successfully
- Manual testing confirms expected behavior
- Code review checklist items are addressed
- Documentation reflects any necessary updates

## 📝 PR Creation Standards

### **PR Title Format**
Generate title using format: `[type]: [brief description of main change]`

**Examples:**
- `feat: Add smart routing for investor dashboard navigation`
- `fix: Resolve PlaidIDVLink verification flow stuck on preparing`
- `refactor: Improve error handling in authentication components`
- `docs: Add comprehensive PR workflow validation rules`

### **PR Description Template**
Generate comprehensive PR description using this template:

```markdown
## 🎯 Overview
Brief summary of what this PR accomplishes and why it was needed.

## 🔧 Changes Made
### New Features
- [ ] Feature 1: Description of what it does
- [ ] Feature 2: Description of functionality

### Bug Fixes
- [ ] Fix 1: What was broken and how it's fixed
- [ ] Fix 2: Description of resolution

### Improvements
- [ ] Improvement 1: What was enhanced
- [ ] Improvement 2: Performance/UX improvements

## 🧪 Testing
### New Tests Added
- [ ] Test suite for [feature/component]
- [ ] Integration tests for [workflow]
- [ ] API endpoint tests for [endpoints]

### Manual Testing Performed
- [ ] Tested all new user flows
- [ ] Verified existing functionality still works
- [ ] Tested edge cases and error scenarios
- [ ] Validated on different browsers/devices

## 🔍 Technical Details
### Architecture Changes
- Description of any architectural decisions
- Impact on existing systems
- Performance considerations

### Database Changes
- New tables/columns added
- Migration scripts included
- Data integrity considerations

### API Changes
- New endpoints added
- Changes to existing endpoints
- Breaking changes (if any)

## 📋 Validation Checklist
- [ ] All tests pass (100% pass rate)
- [ ] No linting errors or warnings
- [ ] `npm run dev` works without issues
- [ ] `npm run build` completes successfully
- [ ] Manual testing completed for all changes
- [ ] Security review completed
- [ ] Documentation updated (if applicable)
- [ ] Breaking changes documented (if any)

## 🎬 Demo/Screenshots
[Include screenshots or GIFs demonstrating the changes]

## 🔗 Related Issues
Closes #[issue-number]
Related to #[issue-number]
```

### **PR Creation Process**
1. **Analyze git changes** - Review all commits since branching from main
2. **Generate appropriate title** - Use commit messages and changes to create descriptive title
3. **Generate comprehensive description** - Fill out template based on actual changes made
4. **Create PR automatically** - Use `gh pr create` with generated title and description
5. **Apply appropriate labels** - Add type, priority, size, and area labels

### **PR Labels and Categories**
- **Type**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **Priority**: `high`, `medium`, `low`
- **Size**: `small`, `medium`, `large`
- **Area**: `frontend`, `backend`, `database`, `api`, `ui/ux`

## 🚨 Pre-PR Validation Checklist

### **Code Quality Gates**
- [ ] All new code has corresponding tests
- [ ] Test coverage maintains or improves current levels
- [ ] All tests pass without any skipped or pending tests
- [ ] Linter shows zero errors and warnings
- [ ] No `console.log` statements in production code
- [ ] No commented-out code blocks
- [ ] All TypeScript strict mode compliance

### **Functionality Gates**
- [ ] All new features work as designed
- [ ] Existing functionality remains unaffected
- [ ] Error handling is comprehensive and user-friendly
- [ ] Loading states are implemented where appropriate
- [ ] Mobile responsiveness verified (if UI changes)
- [ ] Accessibility standards met (if UI changes)

### **Performance Gates**
- [ ] Build time impact is minimal
- [ ] Bundle size increase is justified
- [ ] Database queries are optimized
- [ ] No unnecessary re-renders or state updates
- [ ] API response times are acceptable

## 🎯 Success Criteria

### **Definition of PR Ready**
A branch is ready for PR when:
- All validation steps complete successfully
- Manual testing confirms expected behavior
- Code review checklist items are addressed
- Documentation reflects any necessary updates
- Team members can easily understand the changes

### **Automatic PR Validation**
- All CI/CD checks pass
- No merge conflicts with target branch
- Branch is up to date with latest main
- Required reviews obtained
- All conversations resolved

**Remember: A great PR tells a story - make it easy for reviewers to understand what you built and why.**

## 🔄 Post-PR Workflow

### **After PR Approval**
1. **Squash and merge** with meaningful commit message
2. **Delete feature branch** to keep repository clean
3. **Monitor deployment** for any issues
4. **Update project documentation** if needed
5. **Celebrate the successful delivery** 🎉

### **If Issues Arise Post-Merge**
1. **Create hotfix branch** immediately
2. **Apply minimal fix** to resolve issue
3. **Follow same validation process** (abbreviated)
4. **Deploy fix quickly** and monitor
5. **Create follow-up tickets** for any technical debt

Execute this complete workflow to ensure production-ready code and create a comprehensive, well-documented pull request.