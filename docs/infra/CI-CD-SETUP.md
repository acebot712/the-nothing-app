# CI/CD Pipeline Setup for The Nothing App

This document outlines the CI/CD pipeline configuration for The Nothing App, designed to ensure code quality, automate testing, and streamline the deployment process.

## Overview

Our CI/CD pipeline is implemented using GitHub Actions and provides:

- Automated code quality checks
- Test execution
- Build automation
- Deployment to multiple environments
- Release managemen

## Workflow Files

The CI/CD pipeline is defined in the following workflow files:

- **Pull Request Checks**: `.github/workflows/pull-request.yml`
- **Unit Tests**: `.github/workflows/unit-tests.yml`
- **Security Scanning**: `.github/workflows/security-scan.yml`
- **Deployment Workflow**: `.github/workflows/deploy.yml`

## Pull Request Workflow

The pull request workflow runs whenever a PR is opened, updated, or reopened. It performs the following checks:

1. **Code Quality**:
   - ESLint for code style and potential issues
   - TypeScript type checking
   - Detection of console.log statements

2. **Build Preview**:
   - Creates a preview build of the application
   - Uploads the build artifacts for testing

3. **Bundle Size Report**:
   - Analyzes the build size and reports it as a comment on the PR

4. **Dependency Check**:
   - Identifies outdated dependencies
   - Recommends updates for security and performance

## Unit Tests Workflow

The unit tests workflow runs on push to main and develop branches, as well as on pull requests. It includes:

1. **Unit Tests**:
   - Runs Jest tests with coverage reporting
   - Uploads coverage reports to Codecov

2. **Component Tests**:
   - Tests React Native components
   - Uploads test artifacts

3. **Performance Tests**:
   - Validates bundle size
   - Checks for performance regressions

## Security Scanning Workflow

The security scanning workflow runs weekly and on changes to dependencies. It includes:

1. **Dependency Vulnerability Scanning**:
   - Uses npm audit to identify vulnerabilities
   - Creates or updates GitHub issues for found vulnerabilities

2. **Code Security Scanning**:
   - Uses GitHub CodeQL to identify security issues
   - Provides detailed reports on potential vulnerabilities

3. **Secrets Detection**:
   - Scans for hardcoded secrets
   - Checks for committed environment files

## Deployment Workflow

The deployment workflow runs on:
- Pushes to the main branch
- Tagged releases (format: `v*`)
- Manual triggers with environment selection

It includes the following stages:

1. **Pre-deployment Checks**:
   - Runs linting and type checking
   - Verifies no critical issues exis

2. **iOS Build and Submission**:
   - Builds the iOS application
   - Submits to App Store (only for tagged releases)

3. **Android Build and Submission**:
   - Builds the Android application
   - Submits to Play Store (only for tagged releases)

4. **Backend Deployment**:
   - Deploys server components to the appropriate environmen

5. **Release Creation**:
   - Creates a GitHub release with automatic changelog
   - Only runs for tagged releases

6. **Team Notification**:
   - Notifies the team of deployment status

## Environment Configuration

The pipeline supports three environments:

1. **Development**: For local testing and development work
2. **Staging**: For pre-release testing and verification
3. **Production**: For public release

Each environment uses specific environment variables configured as GitHub secrets.

## Required Secrets

The following secrets must be configured in the GitHub repository:

- `EXPO_TOKEN`: For Expo/EAS integration
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_API_URL`: API URL for the environmen
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `CODECOV_TOKEN`: For uploading test coverage reports
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Build Scrip

A helper script is provided to simplify build processes both locally and in CI:

```bash
./scripts/ci-build.sh -e <environment> -p <platform> [options]
```

Options:
- `-e, --environment`: Set environment (development, staging, production)
- `-p, --platform`: Set platform (ios, android, web, all)
- `-c, --clean`: Perform a clean build
- `-s, --skip-tests`: Skip running tests
- `-b, --build-number`: Set specific build number
- `-u, --upload`: Upload build to EAS/Expo
- `-h, --help`: Show help message

## Manual Deploymen

To manually trigger a deployment:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Select the target environment (staging or production)
5. Click "Run workflow" to start the deploymen

## Release Process

To create a new release:

1. Update the app version in `app.json`
2. Create and push a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The deployment workflow will automatically:
   - Run all checks
   - Build the application
   - Submit to app stores (if it's a production release)
   - Create a GitHub release with changelog

## Adding or Modifying Workflows

When modifying the CI/CD workflows:

1. Test changes locally when possible
2. Make small, incremental changes
3. Document changes in PR descriptions
4. Monitor the first few runs after changes to ensure proper functionality

## Troubleshooting

Common issues and solutions:

1. **Build Failures**:
   - Check environment variables/secrets
   - Verify EAS configuration
   - Ensure dependencies are correctly specified

2. **Deployment Issues**:
   - Verify credentials for app stores
   - Check network connectivity to deployment targets
   - Review logs for specific error messages

3. **Pipeline Timing Out**:
   - Consider optimizing the build process
   - Break down complex steps
   - Cache dependencies and build artifacts

## Maintenance and Monitoring

Regular maintenance tasks:

1. Update GitHub Actions versions periodically
2. Review and update dependencies
3. Monitor build times and optimize as needed
4. Audit secrets and permissions

## Ensuring CI Build Script is Executable

The CI build script needs to be executable to run properly. After cloning the repository, you may need to make it executable:

```bash
chmod +x scripts/ci-build.sh
```

This is especially important when running the script locally or in environments where file permissions are strictly enforced.

## Contac

For questions or issues related to the CI/CD pipeline, contact:

- DevOps Team Lead: devops@thenothingapp.com
- Engineering Manager: engineering@thenothingapp.com
