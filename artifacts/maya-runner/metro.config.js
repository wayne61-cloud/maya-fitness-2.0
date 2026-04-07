const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Support monorepo
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Web shims: native modules not supported on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      filePath: path.resolve(projectRoot, "shims/react-native-maps.web.js"),
      type: "sourceFile",
    };
  }
  if (platform === "web" && moduleName === "react-native-webview") {
    return {
      filePath: path.resolve(projectRoot, "shims/react-native-webview.web.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
