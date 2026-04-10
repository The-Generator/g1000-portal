# Claude Code Custom Commands

This repository contains custom slash commands for Claude Code to streamline development workflows with GitHub integration.

## Available Commands

### `/issue`
**Purpose:** Create GitHub issues for features and tasks  
**Usage:** `claude > /issue`  
**Description:** Creates a new GitHub issue to track work that needs to be done. Use this to document features, bugs, or any tasks before starting work.

### `/work` (Main Command)
**Purpose:** Execute work on GitHub issues or ad-hoc tasks  
**Usage:** `claude > /work`  
**Description:** The primary command for getting work done. Begin working on a GitHub issue or provide a task directly. This command handles the complete development workflow including setup, implementation, and testing. This is the recommended way to work on any development tasks.

### `/worktree`
**Purpose:** Set up a git worktree for manual work  
**Usage:** `claude > /worktree`  
**Description:** Creates a git worktree for more manual development work when you don't need the full automated workflow. Useful for exploratory work or when you want more control.

### `/pr`
**Purpose:** Create a pull request from completed work  
**Usage:** `claude > /pr`  
**Description:** Creates a pull request from your current branch with comprehensive validation, including tests, linting, and automated PR description generation.

### `/prime`
**Purpose:** Context prime the codebase  
**Usage:** `claude > /prime`  
**Description:** Analyzes repository structure, reviews documentation, understands tech stack, and establishes coding context before starting work.

## Workflow Guide

The typical workflow for using these commands:

1. **Create issues for features/tasks**
   ```bash
   claude > /issue
   # Create a GitHub issue describing what needs to be done
   ```

2. **Work on the issue** (Main workflow)
   ```bash
   claude > /work
   # Select an issue to work on or provide a task directly
   # This is the primary command for development work
   ```

3. **Alternative: Manual worktree setup**
   ```bash
   claude > /worktree
   # Sets up a worktree if you want to do more manual work
   ```

4. **Create a pull request**
   ```bash
   claude > /pr
   # Creates a PR after you've completed your work
   ```

5. **Context priming (optional)**
   ```bash
   claude > /prime
   # Use this when starting work on a new codebase
   ```

## Common Workflows

### Feature Development Flow
```bash
# Create an issue for the new feature
claude > /issue

# Work on the issue
claude > /work

# Create a PR when done
claude > /pr
```

### Quick Task Flow
```bash
# Jump straight into work without creating an issue
claude > /work
# Provide task description when prompted
# This is the fastest way to get things done
```

### Manual Development Flow
```bash
# Set up a worktree for manual work
claude > /worktree

# Do your development work manually

# Create a PR when ready
claude > /pr
```

## Best Practices

1. **Use `/work` as your primary command** - This is the main way to get development work done
2. **Use `/issue` to track features** - Create GitHub issues before starting major work
3. **Use `/worktree` for exploratory work** - When you need more manual control
4. **Always finish with `/pr`** - Ensures proper validation and PR creation
5. **Start new codebases with `/prime`** - Establishes context before diving in

## Command Features

- **GitHub Integration:** Direct integration with GitHub issues and pull requests
- **Git Worktree Support:** Isolated development environments for parallel work
- **Automated Testing:** Commands ensure tests are run and passing
- **Code Quality:** Automatic linting and build validation
- **Smart PR Creation:** Automated PR titles and descriptions based on work done

## File Structure

```
.claude/
├── README.md                 # Command documentation
├── settings.local.json       # Local settings configuration
└── commands/
    ├── issue.md             # GitHub issue creation
    ├── work.md              # Work execution workflow
    ├── worktree.md          # Worktree setup
    ├── pr.md                # Pull request creation
    └── prime.md             # Context initialization
```

These commands streamline the development workflow: **Create issues, do work, make PRs** - ensuring consistent, high-quality development practices

## Future Roadmap

### Agent Orchestration & Subagents
- **Parent/Child Agent Architecture**: Implement hierarchical agent system with root agent orchestrating multiple subagents
- **Intelligent Task Delegation**: Using `claude -p` headless mode to spawn and coordinate n subagents dynamically
- **Context Synchronization**: Parent/child communication and synchronization throughout the agent system
- **Recursive Delegation**: Subagents can spawn their own subagents for complex task decomposition

### Testing Agents
- **End-to-End Testing**: Dedicated testing agents with integrated MCPs/libraries for comprehensive application testing
- **UI Testing**: Automated UI testing capabilities through specialized testing agents
- **Full Project Testing**: Agents that can build/edit projects and fully test them (including UI) before returning results

### Enhanced Capabilities
- **MCP Integration**: Add more Model Context Protocol servers for expanded functionality
- **External Libraries**: Integrate additional external libraries for Claude Code agents to access
- **Parallel Orchestration**: Enhanced parallel processing and coordination between multiple agents

### Use Cases
1. **Automated Project Development**: Have agents build or edit a project and fully test it (including UI) before returning
2. **Code Analysis & Debate**: Multiple subagents analyzing codebases and debating ideas with the root agent for better decision making
3. **Intelligent Workflow**: Agents that understand when to delegate vs. handle tasks directly

The vision is to create a comprehensive agent ecosystem where complex development tasks are intelligently distributed, thoroughly tested, and seamlessly coordinated.