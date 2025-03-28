# Pre-commit Hooks Configuration

This document explains how the pre-commit hooks are configured in this repository and how to use them effectively.

## Overview

This repository uses a combination of [pre-commit](https://pre-commit.com/) and [Husky](https://typicode.github.io/husky/) to enforce code quality standards and prevent sensitive information from being committed.

## Setup

To set up the pre-commit hooks:

1. Install pre-commit (if not already installed):

```bash
pip install pre-commi
```

2. Install the git hooks:

```bash
pre-commit install
```

## Available Hooks

The following hooks are configured in `.pre-commit-config.yaml`:

### Standard Hooks (from pre-commit-hooks)

- **trailing-whitespace**: Removes trailing whitespace
- **end-of-file-fixer**: Ensures files end with a newline
- **check-yaml**: Validates YAML files
- **check-added-large-files**: Prevents large files from being committed
- **check-merge-conflict**: Checks for files with merge conflict strings
- **detect-private-key**: Checks for private keys
- **no-commit-to-branch**: Prevents direct commits to the `main` branch

### Code Quality Hooks

- **ESLint**: Enforces JavaScript/TypeScript code quality rules
- **Prettier**: Ensures consistent code formatting
- **TypeScript Check**: Verifies TypeScript types are valid

### Security Hooks

- **check-env-vars**: Prevents hardcoded environment variables from being committed

## Integration with Husky

This repository also uses Husky to integrate pre-commit with the standard Git workflow. The Husky configuration in `.husky/pre-commit` will:

1. Try to run pre-commit hooks firs
2. If pre-commit is not installed, fall back to a set of manual checks:
   - TypeScript type checking
   - ESLint on staged files
   - Check for console.log statements

## Usage

### Running Hooks Manually

To run all pre-commit hooks manually on all files:

```bash
pre-commit run --all-files
```

To run a specific hook:

```bash
pre-commit run <hook-id>
```

### Skipping Hooks

In rare cases where you need to bypass the pre-commit hooks (not recommended for production code):

```bash
git commit -m "Your message" --no-verify
```

## Troubleshooting

### Hooks Not Running

If pre-commit hooks aren't running:

1. Check if pre-commit is installed:
   ```bash
   pre-commit --version
   ```

2. Verify hooks are installed:
   ```bash
   pre-commit install
   ```

3. Check if the `.pre-commit-config.yaml` file exists and is valid

### Failed Hooks

If a hook fails:

1. Read the error message to understand what's wrong
2. Fix the issues in your code
3. Run `git add` to stage your changes
4. Try committing again

### Updating Hooks

To update the pre-commit hooks to the latest versions:

```bash
pre-commit autoupdate
```

## Customizing Hooks

To customize the pre-commit configuration:

1. Edit the `.pre-commit-config.yaml` file
2. Add, remove, or modify hooks as needed
3. Run `pre-commit run --all-files` to test your changes
