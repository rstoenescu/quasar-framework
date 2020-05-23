const appPaths = require("../app-paths");

module.exports = function esmCompat(fileBase) {
  const appPackageJson = require(appPaths.resolve.app("package.json"));
  const fileExtension = appPackageJson.type === "module" ? "cjs" : "js";

  return `${fileBase}.${fileExtension}`;
};
