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

function postHTMLAddPWA() {
  return function process(tree) {
    tree.match({ tag: "head" }, (node) => {
      const space = node.content.find((n) => n.startsWith("\n"));
      const lastSpace = node.content.reverse().find((n) => n.startsWith("\n"));
      const tab = space.replace("\n", "").length / 2;
      node.content.reverse();

      node.content.pop();

      node.content.push(space);
      node.content.push(space);
      node.content.push(
        "<!-- PWA: Apple Touch Icon, and Service Worker registration. -->"
      );
      node.content.push(
        "<!-- Vite Plugin PWA will add the Web App Manifest during build -->"
      );
      node.content.push(space);
      node.content.push({
        tag: "link",
        attrs: {
          rel: "apple-touch-icon",
          href: "/images/pwa/icon-192x192.png",
        },
      });
      node.content.push(space);
      node.content.push({
        tag: "script",
        attrs: {
          type: "module",
        },
        content: [
          space + " ".repeat(tab),
          "// Register Service Worker using Vite Plugin PWA",
          space + " ".repeat(tab),
          `import { registerSW } from 'virtual:pwa-register';`,
          space + " ".repeat(tab),
          `registerSW();`,
          space,
        ],
      });
      node.content.push(lastSpace);

      return node;
    });

    return tree;
  };
}

module.exports = postHTMLAddPWA;
