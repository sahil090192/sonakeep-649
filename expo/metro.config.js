const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

let withRorkMetro = (metroConfig) => metroConfig;

try {
  ({ withRorkMetro } = require("@rork-ai/toolkit-sdk/metro"));
} catch {
  console.warn("[metro] @rork-ai/toolkit-sdk not installed; using Expo default Metro config.");
}

module.exports = withRorkMetro(config);
