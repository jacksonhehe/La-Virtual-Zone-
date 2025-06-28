import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

// Check the main entry page for WCAG 2.0 A and AA compliance

test('index.html has no WCAG A/AA accessibility violations', async () => {
  const html = readFileSync('index.html', 'utf8');
  const { window } = new JSDOM(html);

  const results = await axe.run(window.document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  });

  expect(results.violations).toHaveLength(0);
});
