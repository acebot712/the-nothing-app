// Define and export the configuration directly
module.exports = {
  name: "The Badge App",
  slug: "the-badge-app",
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
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thebadgeapp",
    buildNumber: "1",
    icon: "./assets/icon.png",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0D0D0D",
    },
    icon: "./assets/icon.png",
    package: "com.thebadgeapp",
    versionCode: 1,
    permissions: [],
  },
  web: {
    favicon: "./assets/favicon.png",
    name: "The Badge App",
    shortName: "Badge App",
    description: "A simple app that shows a special badge when you log in.",
  },
  primaryColor: "#D4AF37",
  assetBundlePatterns: ["**/*"],
};
