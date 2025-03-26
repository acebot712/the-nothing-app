# Repository Setup Guide

This guide explains how to properly set up the repository after cloning it.

## Initial Setup

After cloning the repository, follow these steps to ensure everything is properly set up:

1. Install dependencies:

```bash
npm install
```

2. Make scripts executable:

```bash
# Make CI build script executable
chmod +x scripts/ci-build.sh

# Make any other scripts executable
chmod +x server/scripts/*.sh
```

3. Set up pre-commit hooks:

```bash
# Install pre-commit if you don't have it already
pip install pre-commit

# Install the git hooks
pre-commit install

# Verify that hooks are properly installed
pre-commit --version
```

4. Create environment files:

```bash
# Copy example environment file
cp .env.example .env

# For server, if it exists
cp server/.env.example server/.env
```

5. Update environment variables in the `.env` file with your actual values:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Folder Structure Maintenance

When working with this repository, please follow these guidelines:

1. Keep all documentation in the `docs/` directory:
   - `docs/infra/` - For infrastructure and deployment documentation
   - `docs/repo/` - For repository-specific documentation
   - `docs/guidebook/` - For user guides and application documentation

2. Keep configuration files in the root directory:
   - `.env.example` - Template for environment variables
   - `.eslintrc.js` - ESLint configuration
   - `.pre-commit-config.yaml` - Pre-commit hooks configuration
   - `babel.config.cjs` - Babel configuration
   - `tsconfig.json` - TypeScript configuration

3. Use the appropriate directory for app code:
   - `app/` - All application code
   - `server/` - Backend server code
   - `scripts/` - Build and utility scripts

## Pre-commit Hooks

This repository uses pre-commit hooks to ensure code quality and prevent security issues. The hooks will:

1. Run linters on staged files
2. Check for TypeScript errors
3. Format code with Prettier
4. Ensure no sensitive information is committed
5. Check for merge conflicts
6. Verify YAML and JSON files are valid
7. Prevent commits directly to main branch

The pre-commit hooks are configured in `.pre-commit-config.yaml`. If a pre-commit hook fails, address the issues before committing again.

To manually run all pre-commit hooks on all files:

```bash
pre-commit run --all-files
```

## Development Workflow

1. Create a new branch for your feature or fix:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them locally

3. Run production readiness checks:

```bash
npm run preproduction
```

4. Create a pull request following the PR template

## Common Issues

### Pre-commit Hooks Not Running

If pre-commit hooks aren't running:

1. Make sure pre-commit is installed:
   ```bash
   pip install pre-commit
   ```

2. Ensure hooks are installed in the git repository:
   ```bash
   pre-commit install
   ```

3. If you're getting errors about `.pre-commit-config.yaml`, make sure the file exists and is valid:
   ```bash
   pre-commit run --config .pre-commit-config.yaml --all-files
   ```

### Permission Denied for Scripts

If you encounter "Permission denied" errors when running scripts, you need to make them executable:

```bash
chmod +x path/to/script.sh
```

### Environment Variables Not Loading

If environment variables aren't being loaded:

1. Check that your `.env` file exists
2. Ensure it's in the correct location
3. Restart the development server with `--clear` flag:

```bash
npx expo start --clear
```

### Redundant Directories

If you encounter a `the-nothing-app` directory in the root, it can be safely removed:

```bash
rm -rf the-nothing-app
```

This is a redundant directory that's no longer needed.

## Additional Resources

For more detailed information about specific aspects of the project, refer to the following documentation:

- [Production Deployment Guide](../infra/PRODUCTION_DEPLOYMENT.md)
- [Supabase Setup Guide](../infra/SUPABASE_SETUP.md)
- [CI/CD Pipeline Setup](../infra/CI-CD-SETUP.md)
- [Production Readiness](../infra/PRODUCTION-READINESS.md)
