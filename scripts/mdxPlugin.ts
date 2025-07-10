import fs from 'fs';
import type { Plugin } from 'vite';

function mdToHtml(md: string): string {
  return md
    .split(/\r?\n/)
    .map(line => {
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.trim() === '') return '';
      return `<p>${line}</p>`;
    })
    .join('');
}

export default function mdxPlugin(): Plugin {
  return {
    name: 'mdx-lite',
    enforce: 'pre',
    load(id) {
      if (id.endsWith('.md') || id.endsWith('.mdx')) {
        const code = fs.readFileSync(id, 'utf-8');
        const html = mdToHtml(code);
        return `export default ${JSON.stringify(html)};`;
      }
    },
    transform(code, id) {
      if (id.endsWith('.md') || id.endsWith('.mdx')) {
        const html = mdToHtml(code);
        const component = `export default ${JSON.stringify(html)};`;
        return { code: component, map: null };
      }
    },
  };
}
