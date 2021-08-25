function postHTMLAddPWA() {
  return function process(tree) {
    tree.match({tag: 'head'}, node => {
      const space = node.content.find(n => n.startsWith('\n'));
      const lastSpace = node.content.reverse().find(n => n.startsWith('\n'));
      const tab = space.replace('\n', '').length / 2;
      node.content.reverse();

      node.content.pop();
      
      node.content.push(space);
      node.content.push(space);
      node.content.push('<!-- PWA: Web App Manifest, Apple Touch Icon, and Service Worker registration -->');
      node.content.push(space);
      node.content.push({
        tag: 'link',
        attrs: {
          rel: 'manifest',
          href: '/manifest.json'
        }
      });
      node.content.push(space);
      node.content.push({
        tag: 'link',
        attrs: {
          rel: 'apple-touch-icon',
          href: '/images/pwa/icon-192x192.png'
        }
      });
      node.content.push(space);
      node.content.push({
        tag: 'script',
        attrs: {
          type: 'module',
        },
        content: [
          space + ' '.repeat(tab),
          '// Register Service Worker using Vite Plugin PWA',
          space + ' '.repeat(tab),
          `import { registerSW } from 'virtual:pwa-register';`,
          space + ' '.repeat(tab),
          `registerSW();`,
          space,
        ],
      });
      node.content.push(lastSpace);

      return node;
    });

    return tree;
  }
}

module.exports = postHTMLAddPWA;