#!/bin/bash

# CI/CD Build Script for The Nothing App
# Usage: ./scripts/ci-build.sh [options]
# Example: ./scripts/ci-build.sh -e production -p all -c -s -b 123 -u

set -e

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
PLATFORM="all"
CLEAN_BUILD=false
SKIP_TESTS=false
BUILD_NUMBER=""
UPLOAD=false

# Show usage
show_usage() {
  echo -e "${BLUE}Usage:${NC} $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e, --environment ENV   Set environment (development, staging, production)"
  echo "  -p, --platform PLAT     Set platform (ios, android, web, all)"
  echo "  -c, --clean             Perform a clean build"
  echo "  -s, --skip-tests        Skip running tests"
  echo "  -b, --build-number NUM  Set build number"
  echo "  -u, --upload            Upload build to EAS/Expo"
  echo "  -h, --help              Show this help message"
  echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -p|--platform)
      PLATFORM="$2"
      shift 2
      ;;
    -c|--clean)
      CLEAN_BUILD=true
      shift
      ;;
    -s|--skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -b|--build-number)
      BUILD_NUMBER="$2"
      shift 2
      ;;
    -u|--upload)
      UPLOAD=true
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_usage
      exit 1
      ;;
  esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
  echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Must be 'development', 'staging', or 'production'.${NC}"
  exit 1
fi

# Validate platform
if [[ ! "$PLATFORM" =~ ^(ios|android|web|all)$ ]]; then
  echo -e "${RED}Error: Invalid platform '$PLATFORM'. Must be 'ios', 'android', 'web', or 'all'.${NC}"
  exit 1
fi

# Print build configuration
echo -e "${BLUE}=== The Nothing App Build Configuration ===${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Platform: ${GREEN}$PLATFORM${NC}"
echo -e "Clean Build: ${GREEN}$CLEAN_BUILD${NC}"
echo -e "Skip Tests: ${GREEN}$SKIP_TESTS${NC}"
echo -e "Build Number: ${GREEN}${BUILD_NUMBER:-'Auto'}${NC}"
echo -e "Upload Build: ${GREEN}$UPLOAD${NC}"
echo -e "${BLUE}=========================================${NC}"

# Set up environment variables based on environment
setup_environment() {
  echo -e "${BLUE}Setting up environment for ${GREEN}$ENVIRONMENT${NC}..."

  case $ENVIRONMENT in
    development)
      # Use local development values
      export EXPO_PUBLIC_API_URL="http://localhost:3000"
      ;;
    staging)
      # Use staging values
      export EXPO_PUBLIC_API_URL="https://staging-api.thenothingapp.com"
      ;;
    production)
      # Use production values
      export EXPO_PUBLIC_API_URL="https://api.thenothingapp.com"
      ;;
  esac

  # Common environment variables - in a real setup these would be pulled from CI secrets
  if [[ -f .env.$ENVIRONMENT ]]; then
    echo -e "${GREEN}Loading environment variables from .env.$ENVIRONMENT${NC}"
    # source .env.$ENVIRONMENT
    export $(grep -v '^#' .env.$ENVIRONMENT | xargs)
  else
    echo -e "${YELLOW}Warning: .env.$ENVIRONMENT file not found${NC}"
  fi
}

# Clean the project if requested
clean_project() {
  if [ "$CLEAN_BUILD" = true ]; then
    echo -e "${BLUE}Performing clean build...${NC}"
    rm -rf node_modules
    rm -rf dist
    # Clean platform specific caches
    case $PLATFORM in
      ios|all)
        echo -e "${BLUE}Cleaning iOS build cache...${NC}"
        rm -rf ios/build
        ;;
      android|all)
        echo -e "${BLUE}Cleaning Android build cache...${NC}"
        rm -rf android/build
        ;;
    esac

    npm ci
  else
    echo -e "${BLUE}Skipping clean build...${NC}"
    # Just ensure all dependencies are installed
    npm install
  fi
}

# Run tests if not skipped
run_tests() {
  if [ "$SKIP_TESTS" = true ]; then
    echo -e "${YELLOW}Skipping tests as requested${NC}"
  else
    echo -e "${BLUE}Running tests...${NC}"
    npm run lint
    npm run tsc
    npm test -- --watchAll=false
  fi
}

# Build the app for the specified platform
build_app() {
  echo -e "${BLUE}Building app for ${GREEN}$PLATFORM${NC} platform in ${GREEN}$ENVIRONMENT${NC} environment...${NC}"

  # Set the build profile based on environment
  local profile=""
  case $ENVIRONMENT in
    development)
      profile="development"
      ;;
    staging)
      profile="preview"
      ;;
    production)
      profile="production"
      ;;
  esac

  # Build number parameter if specified
  local build_param=""
  if [ -n "$BUILD_NUMBER" ]; then
    build_param="--build-number $BUILD_NUMBER"
  fi

  # Build for the specified platform
  case $PLATFORM in
    ios)
      if [ "$UPLOAD" = true ]; then
        npx eas build --platform ios --profile $profile $build_param
      else
        npx expo prebuild --platform ios
        npx expo run:ios --no-dev --minify
      fi
      ;;
    android)
      if [ "$UPLOAD" = true ]; then
        npx eas build --platform android --profile $profile $build_param
      else
        npx expo prebuild --platform android
        npx expo run:android --no-dev --minify
      fi
      ;;
    web)
      npx expo export:web
      ;;
    all)
      if [ "$UPLOAD" = true ]; then
        npx eas build --platform all --profile $profile $build_param
      else
        npx expo prebuild
        echo -e "${YELLOW}Local builds for all platforms not supported. Please build each platform separately.${NC}"
      fi
      ;;
  esac
}

# Main execution flow
main() {
  setup_environment
  clean_project
  run_tests
  build_app

  echo -e "${GREEN}Build process completed successfully!${NC}"
}

# Run the main function
main
