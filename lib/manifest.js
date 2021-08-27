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

module.exports = {
  strategies: "injectManifest",
  srcDir: "",
  filename: "service-worker.js",
  manifest: {
    name: "Vite PWA",
    short_name: "Vite PWA",
    description: "A Vite starter app ready-to-go as a Progressive Web App.",
    background_color: "#5a0fc8",
    theme_color: "#5a0fc8",
    display: "standalone",
    icons: [
      {
        src: "/images/pwa/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/pwa/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/images/pwa/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};
