#!/usr/bin/env node

/**
 * Pre-production check script for The Nothing App
 * This script verifies that the application is ready for production deployment
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ASCII art because why not
console.log(`
╔════════════════════════════════════════╗
║  THE NOTHING APP - PRE-PRODUCTION ✓    ║
╚════════════════════════════════════════╝
`);

const rootDir = process.cwd();

// Define colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Logging functions
const log = {
  info: (message) => console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`),
  success: (message) =>
    console.log(`${colors.green}✅ ${message}${colors.reset}`),
  warning: (message) =>
    console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`),
  section: (message) =>
    console.log(
      `\n${colors.bright}${colors.magenta}▶ ${message}${colors.reset}\n`,
    ),
};

// Define checks to be run
const checks = [
  {
    name: "Environment Variables",
    run: checkEnvironmentVariables,
  },
  {
    name: "TypeScript Compilation",
    run: checkTypeScript,
  },
  {
    name: "ESLint Validation",
    run: checkESLint,
  },
  {
    name: "Pre-commit Hooks",
    run: checkPreCommitHooks,
  },
  {
    name: "Required Files",
    run: checkRequiredFiles,
  },
  {
    name: "Dependencies",
    run: checkDependencies,
  },
  {
    name: "EAS Configuration",
    run: checkEASConfig,
  },
];

// Main function to run all checks
async function runChecks() {
  let passedChecks = 0;
  let failedChecks = 0;
  let warningChecks = 0;

  for (const check of checks) {
    log.section(`Checking ${check.name}`);
    try {
      const result = await check.run();
      if (result.status === "pass") {
        log.success(`${check.name} check passed`);
        passedChecks++;
      } else if (result.status === "warning") {
        log.warning(`${check.name} check produced warnings`);
        warningChecks++;
      } else {
        log.error(`${check.name} check failed: ${result.message}`);
        failedChecks++;
      }
    } catch (error) {
      log.error(`Error during ${check.name} check: ${error.message}`);
      failedChecks++;
    }
  }

  // Summary
  log.section("Summary");
  console.log(
    `Passed: ${passedChecks} | Warnings: ${warningChecks} | Failed: ${failedChecks}`,
  );

  if (failedChecks > 0) {
    log.error(
      "Pre-production check failed. Please fix the issues before deploying.",
    );
    process.exit(1);
  } else if (warningChecks > 0) {
    log.warning(
      "Pre-production check passed with warnings. Review them before deploying.",
    );
    process.exit(0);
  } else {
    log.success(
      "All pre-production checks passed! The app is ready for deployment.",
    );
    process.exit(0);
  }
}

// Check environment variables
async function checkEnvironmentVariables() {
  const envPath = path.join(rootDir, ".env");
  const envExamplePath = path.join(rootDir, ".env.example");

  if (!fs.existsSync(envPath)) {
    return {
      status: "fail",
      message: ".env file not found. Create one based on .env.example",
    };
  }

  if (!fs.existsSync(envExamplePath)) {
    return {
      status: "warning",
      message:
        ".env.example file not found. New developers may not know required variables.",
    };
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = [
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    "EXPO_PUBLIC_API_URL",
    "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ];

  const missingVars = requiredVars.filter(
    (v) =>
      !envContent.includes(`${v}=`) ||
      envContent.includes(`${v}=''`) ||
      envContent.includes(`${v}=""`),
  );

  if (missingVars.length > 0) {
    return {
      status: "fail",
      message: `Missing required environment variables: ${missingVars.join(
        ", ",
      )}`,
    };
  }

  return { status: "pass" };
}

// Check TypeScript compilation
async function checkTypeScript() {
  try {
    log.info("Running TypeScript type check...");
    await execAsync("npx tsc --noEmit");
    return { status: "pass" };
  } catch (error) {
    return {
      status: "fail",
      message: "TypeScript compilation failed. See errors above.",
    };
  }
}

// Check ESLint validation
async function checkESLint() {
  try {
    log.info("Running ESLint...");
    await execAsync("npx eslint .");
    return { status: "pass" };
  } catch (error) {
    // ESLint returns non-zero if there are any warnings or errors
    if (error.stdout.includes("warning")) {
      return {
        status: "warning",
        message:
          "ESLint found warnings. Consider fixing them before deployment.",
      };
    }
    return {
      status: "fail",
      message: "ESLint found errors. Please fix them before deploying.",
    };
  }
}

// Check pre-commit hooks
async function checkPreCommitHooks() {
  // Check if pre-commit is installed
  try {
    await execAsync("command -v pre-commit");
  } catch (error) {
    return {
      status: "warning",
      message:
        'pre-commit is not installed. Install it with "pip install pre-commit"',
    };
  }

  // Check if pre-commit config exists
  const preCommitConfigPath = path.join(rootDir, ".pre-commit-config.yaml");
  if (!fs.existsSync(preCommitConfigPath)) {
    return {
      status: "warning",
      message:
        ".pre-commit-config.yaml not found. Pre-commit hooks won't work.",
    };
  }

  // Check if Husky is installed
  const huskyPath = path.join(rootDir, ".husky", "pre-commit");
  if (!fs.existsSync(huskyPath)) {
    return {
      status: "warning",
      message:
        'Husky pre-commit hook not found. Run "npm run prepare" to set it up.',
    };
  }

  // Validate pre-commit configuration
  try {
    log.info("Validating pre-commit configuration...");

    // Read the pre-commit config file
    const configContent = fs.readFileSync(preCommitConfigPath, "utf8");

    // Check for common issues in the config
    const potentialIssues = [];

    // Check for the presence of critical hooks
    if (!configContent.includes("id: trailing-whitespace"))
      potentialIssues.push("Missing trailing-whitespace hook");
    if (!configContent.includes("id: end-of-file-fixer"))
      potentialIssues.push("Missing end-of-file-fixer hook");
    if (!configContent.includes("id: check-yaml"))
      potentialIssues.push("Missing check-yaml hook");
    if (!configContent.includes("id: eslint"))
      potentialIssues.push("Missing eslint hook");
    if (!configContent.includes("id: prettier"))
      potentialIssues.push("Missing prettier hook");
    if (!configContent.includes("id: no-commit-to-branch"))
      potentialIssues.push("Missing no-commit-to-branch hook");

    // Check for types_or with unrecognized types
    if (configContent.includes("types_or: [javascript, typescript, tsx]")) {
      potentialIssues.push(
        "Prettier hook uses unrecognized type tags. Use files: \\.(js|jsx|ts|tsx)$ instead",
      );
    }

    // Try validating with pre-commit tool
    try {
      await execAsync("pre-commit validate-config");
    } catch (validationError) {
      potentialIssues.push(
        `pre-commit validate-config failed: ${validationError.message}`,
      );
    }

    if (potentialIssues.length > 0) {
      return {
        status: "warning",
        message: `Pre-commit configuration has potential issues: ${potentialIssues.join(
          "; ",
        )}`,
      };
    }

    return { status: "pass" };
  } catch (error) {
    return {
      status: "fail",
      message: `Failed to validate pre-commit configuration: ${error.message}`,
    };
  }
}

// Check required files
async function checkRequiredFiles() {
  const requiredFiles = [
    "App.tsx",
    "tsconfig.json",
    "babel.config.cjs",
    "app.json",
    "eas.json",
    "package.json",
    "README.md",
  ];

  const missingFiles = requiredFiles.filter(
    (file) => !fs.existsSync(path.join(rootDir, file)),
  );

  if (missingFiles.length > 0) {
    return {
      status: "fail",
      message: `Missing required files: ${missingFiles.join(", ")}`,
    };
  }

  return { status: "pass" };
}

// Check dependencies for security vulnerabilities
async function checkDependencies() {
  try {
    log.info("Checking for npm vulnerabilities...");
    await execAsync("npm audit --production");
    return { status: "pass" };
  } catch (error) {
    // npm audit returns non-zero if there are any vulnerabilities
    if (error.stdout.includes("npm audit fix")) {
      return {
        status: "warning",
        message:
          'Security vulnerabilities found. Run "npm audit fix" to fix them.',
      };
    }
    return {
      status: "warning",
      message: "Security vulnerabilities found. Review npm audit output.",
    };
  }
}

// Check EAS configuration
async function checkEASConfig() {
  const easConfigPath = path.join(rootDir, "eas.json");
  if (!fs.existsSync(easConfigPath)) {
    return {
      status: "fail",
      message: "eas.json not found. Required for EAS builds.",
    };
  }

  try {
    const easConfig = JSON.parse(fs.readFileSync(easConfigPath, "utf8"));

    // Check for required profiles
    if (!easConfig.build || !easConfig.build.production) {
      return {
        status: "warning",
        message: "Missing production build profile in eas.json",
      };
    }

    return { status: "pass" };
  } catch (error) {
    return {
      status: "fail",
      message: `Invalid eas.json: ${error.message}`,
    };
  }
}

// Run all checks
runChecks().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
