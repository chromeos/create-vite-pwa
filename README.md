# Create Vite PWA

This is an enhancement to the [create Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) package (`npm init vite@latest`) that enhances any of the available Vite starters to make them work as a PWA through [Vite Plugin PWA](https://vite-plugin-pwa.netlify.app/) and [Workbox](https://developers.google.com/web/tools/workbox). Out of the box, you get the following:

- The Vite starter of your choice
- Vite Plugin PWA configured with a basic Web App Manifest
- Service Worker registration through Vite Plugin PWA
- Sample icons to use
- A Service Worker with a basic offline fallback provided by [Workbox Recipes](https://developers.google.com/web/tools/workbox/modules/workbox-recipes#offline_fallback)

## Usage

Run `npm init create-vite-pwa [PROJECT-DIR]`.

You can pass the following flags in to set options instead of going through the prompts:

| Flag                                                | Description                                                                 |
| :-------------------------------------------------- | :-------------------------------------------------------------------------- |
| `-f FRAMEWORK` / `-framework FRAMEWORK`             | Framework to use                                                            |
| `{--ts \| --js}` / `{--typescript \| --javascript}` | Whether to use TypeScript or JavaScript                                     |
| `--overwrite`                                       | If a project directory is included, overwrite its content if it's not empty |
