// Import the app.json configuration
const appJson = require('./app.json');

// Re-export the app.json configuration with any dynamic modifications
module.exports = ({ config }) => {
  return {
    ...appJson.expo,
    owner: "acebot712",
    // Add any dynamic configuration here
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        projectId: "97acffa9-73f2-4293-ae60-9a6a8fcd3914"
      }
    }
  };
}; 