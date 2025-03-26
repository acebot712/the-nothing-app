// Define and export the configuration directly
module.exports = {
  name: "The Nothing App",
  slug: "the-nothing-app",
  description: "The world's most exclusive app that does absolutely nothing. Join the elite.",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  entryPoint: "./index.ts",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0D0D0D"
  },
  scheme: "com.thenothingapp",
  metro: {
    config: "./metro.config.cjs"
  },
  babel: {
    config: "./babel.config.cjs"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thenothingapp",
    jsEngine: "jsc",
    buildNumber: "1",
    icon: "./assets/icon.png",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ["fetch"],
      UIStatusBarStyle: "UIStatusBarStyleLightContent"
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0D0D0D"
    },
    icon: "./assets/icon.png",
    package: "com.thenothingapp",
    versionCode: 1,
    permissions: [],
    softwareKeyboardLayoutMode: "pan"
  },
  web: {
    favicon: "./assets/favicon.png",
    name: "The Nothing App - Ultimate Luxury",
    shortName: "The Nothing",
    description: "The world's most exclusive app that does absolutely nothing. Join the elite who have spent thousands on digital bragging rights."
  },
  jsEngine: "hermes",
  primaryColor: "#D4AF37",
  extra: {
    eas: {
      projectId: "97acffa9-73f2-4293-ae60-9a6a8fcd3914"
    },
    appEnvironment: process.env.APP_ENVIRONMENT || 'development'
  },
  owner: "acebot712",
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/97acffa9-73f2-4293-ae60-9a6a8fcd3914"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "your-organization",
          project: "the-nothing-app"
        }
      }
    ]
  }
}; 