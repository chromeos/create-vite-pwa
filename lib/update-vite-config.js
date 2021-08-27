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

const j = require("jscodeshift");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

function updateViteConfig(project, ts = false) {
  // Try and find Vite config with right TS extension
  let ext = ts ? "ts" : "js";
  let configPath = path.join(project, `vite.config.${ext}`);
  // If not found, try and find Vite config with the other extension
  if (!fs.existsSync(configPath)) {
    ext = ts ? "js" : "ts";
    configPath = path.join(project, `vite.config.${ext}`);
  }

  // Set the contents of the config file
  let config = "";
  if (fs.existsSync(configPath)) {
    config = fs.readFileSync(configPath, "utf8");
  } else {
    config = `import { defineConfig } from "vite";\n\n// https://vitejs.dev/config/\n  export default defineConfig({plugins:[]});`;
  }

  const pwaOptions = require("./manifest");

  const root = j(config);

  root
    // Add VitePWA as an import
    .find(j.ImportDeclaration)
    .forEach((p) => {
      if (p.value.source.value === "vite") {
        const imported = j.template
          .statement`import { VitePWA as pwa} from 'vite-plugin-pwa'`;
        p.insertAfter(imported);
      }
    })
    .toSource();

  root
    .find(j.ArrayExpression)
    // Add VitePWA to the list of plugins
    .forEach((a) => {
      const v = a.parent.value;
      const ggv = a.parent.parent.parent.value;
      if (
        v.type === "Property" &&
        v.key.name === "plugins" &&
        ggv.callee.name === "defineConfig"
      ) {
        a.get("elements").push(
          j.template.expression`pwa(${JSON.stringify(pwaOptions)})`
        );
      }
    });

  // Error, need to choose parser
  const result = prettier.format(root.toSource(), { parser: "babel" });

  fs.writeFileSync(configPath, result);
}

module.exports = updateViteConfig;
