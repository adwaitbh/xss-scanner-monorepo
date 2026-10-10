const { buildPayload } = require('./payloads');

const marker = 'TEST_MARKER_123';

const contexts = ['html', 'attribute', 'script', 'url'];

for (const ctx of contexts) {
  const result = buildPayload(ctx, marker);
  console.log(`[${ctx}]`);
  console.log(`  payload:   ${result.payload}`);
  console.log(`  onLoad:    ${result.triggersOnLoad}`);
  console.log(`  desc:      ${result.description}`);
  console.log('');
}