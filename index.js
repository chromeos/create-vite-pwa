#!/usr/bin/env node

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const inquirer = require("inquirer");
const chalk = require("chalk");
const {
  emptyDirSync,
  ensureDirSync,
  copySync,
  moveSync,
  writeJsonSync,
} = require("fs-extra");
const argv = require("minimist")(process.argv.slice(2), {
  string: ["_"],
  boolean: true,
});
const posthtml = require("posthtml");
const fs = require("fs");
const path = require("path");

// Add Search List as prompt type
inquirer.registerPrompt("search-list", require("inquirer-search-list"));

// Set up frameworks and colors
const frameworks = Object.entries({
  vanilla: "yellow",
  vue: "green",
  react: "cyan",
  preact: "magenta",
  "lit-element": "blue",
  svelte: "red",
}).map(([name, color]) => ({
  name: chalk[color](name),
  value: name,
  color,
}));

// Get default args
let targetDir = argv._[0];
let framework = argv.framework || argv.f;
let typescript = argv.typescript || argv.ts;
let overwrite = argv.overwrite;
const defaultProjectName = !targetDir ? "vite-pwa" : targetDir;

if (targetDir === undefined) {
  overwrite = false;
}

// Start the inquisition!
inquirer
  .prompt([
    {
      type: "input",
      name: "dir",
      message: "Project name:",
      default: defaultProjectName,
      when: () => defaultProjectName === "vite-pwa",
    },
    {
      type: "confirm",
      name: "overwrite",
      default: false,
      message: ({ dir }) =>
        (dir === "."
          ? "Current directory"
          : `Target directory "${dir || targetDir}"`) +
        " is not empty. Remove existing files and continue?",
      when: ({ dir }) => !isEmpty(dir) && overwrite !== true,
    },
    {
      type: "input",
      name: "package",
      message: "Package name:",
      default: ({ dir }) =>
        dir ? toValidPackageName(dir) : toValidPackageName(targetDir),
      validate: (package) =>
        isValidPackageName(package) ? true : "Invalid package name",
      when: (answers) =>
        continuePrompts(answers) &&
        (answers.dir
          ? !isValidPackageName(answers.dir)
          : !isValidPackageName(targetDir)),
    },
    {
      type: "search-list",
      name: "framework",
      message: "Select a framework:",
      default: () =>
        framework
          ? isAvailableFramework(framework)?.value
          : frameworks[0].value,
      choices: frameworks,
      when: (answers) =>
        continuePrompts(answers) &&
        (framework ? !isAvailableFramework(framework) : true),
    },
    {
      type: "confirm",
      name: "typescript",
      default: typescript === undefined ? false : true,
      message: "Use TypeScript?",
      when: continuePrompts && typescript === undefined,
    },
  ])
  .then((answers) => {
    if (continuePrompts(answers) === false) {
      throw new Error(chalk.red("✖") + " Operation cancelled");
    }

    const options = Object.assign(
      {
        dir: targetDir,
        framework: framework ? framework.toLowerCase() : "",
        package: targetDir,
        typescript,
        overwrite,
      },
      Object.assign({ package: answers.dir }, answers)
    );

    // Processing files
    const cwd = process.cwd();
    const createViteDir = path.dirname(require.resolve("create-vite"));
    const renameFiles = {
      _gitignore: ".gitignore",
    };

    const root = path.join(cwd, options.dir);

    if (options.overwrite) {
      emptyDirSync(root);
    } else {
      ensureDirSync(root);
    }

    const {color} = isAvailableFramework(options.framework);

    console.log(`\nScaffolding ${chalk[color](options.framework)} project${options.typescript ? chalk.bold(' with TypeScript') : ''} in:\n${root}`);

    const template = options.framework + (options.typescript ? "-ts" : "");

    // Copy files in
    copySync(path.join(createViteDir, `template-${template}`), root);
    copySync(path.join(__dirname, "templates"), root);
    for (const [oldName, newName] of Object.entries(renameFiles)) {
      moveSync(path.join(root, oldName), path.join(root, newName));
    }

    // Update package file
    const pkg = require(path.join(root, "package.json"));
    pkg.name = options.package;
    writeJsonSync(
      path.join(root, "package.json"),
      require("./lib/update-package")(pkg, options.typescript),
      { spaces: 2 }
    );

    // Update index.html to include PWA stuff
    const indexHTML = fs.readFileSync(path.join(root, "index.html"), "utf-8");
    const updatedHTML = posthtml()
      .use(require("./lib/posthtml-add-pwa.js")())
      .process(indexHTML, { sync: true }).html;
    fs.writeFileSync(path.join(root, "index.html"), updatedHTML);

    // Update Vite Config
    require("./lib/update-vite-config")(root, options.typescript);

    // Close out
    const pkgManager = getPkgManager();
    console.log("\nDone. Now run:\n");
    if (root !== cwd) {
      console.log(`  cd ${path.relative(cwd, root)}`);
    }
    switch (pkgManager) {
      case "yarn":
        console.log(`  yarn`);
        console.log("  yarn dev");
        break;
      default:
        console.log(`  ${pkgManager} install`);
        console.log(`  ${pkgManager} run dev`);
        break;
    }
    console.log();
  })
  .catch((e) => {
    console.error(e.message);
  });

// Prompt Helper Functions
function continuePrompts({ dir, overwrite }) {
  if (
    !(
      fs.existsSync(dir || targetDir) &&
      fs.readdirSync(dir || targetDir).length === 0
    ) &&
    overwrite === false
  ) {
    return false;
  }

  return true;
}

function isEmpty(dir) {
  if (!fs.existsSync(dir || targetDir)) return true;

  return fs.readdirSync(dir || targetDir).length === 0;
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

function isAvailableFramework(fr) {
  return frameworks.find((f) => f.value === fr.toLowerCase());
}

/**
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
function getPkgManager(userAgent = process.env.npm_config_user_agent) {
  if (!userAgent) return "npm";
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return pkgSpecArr[0] || "npm";
}
