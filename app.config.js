// Define and export the configuration directly
module.exports = {
  name: "The Nothing App",
  slug: "the-nothing-app",
  description: "A simple app that shows a special badge when you log in.",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  entryPoint: "./index.ts",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0D0D0D",
  },
  scheme: "com.thenothingapp",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thenothingapp",
    buildNumber: "1",
    icon: "./assets/icon.png",
    jsEngine: "jsc",
    associatedDomains: ["applinks:com.thenothingapp"],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0D0D0D",
    },
    icon: "./assets/icon.png",
    package: "com.thenothingapp",
    versionCode: 1,
    permissions: [],
    jsEngine: "jsc",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "com.thenothingapp",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
    name: "The Nothing App",
    shortName: "Nothing App",
    description: "A simple app that shows a special badge when you log in.",
  },
  primaryColor: "#D4AF37",
  assetBundlePatterns: ["**/*"],
  plugins: ["expo-linking"],
};
