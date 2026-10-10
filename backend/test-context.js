const { detectContext } = require('./contextDetector');

const cases = [
  {
    name: 'HTML body',
    html: '<div>hello MARKER world</div>',
    expected: 'html',
  },
  {
    name: 'Inside attribute',
    html: '<input value="MARKER">',
    expected: 'attribute',
  },
  {
    name: 'Inside script',
    html: '<script>var x = "MARKER";</script>',
    expected: 'script',
  },
  {
    name: 'Inside href',
    html: '<a href="MARKER">link</a>',
    expected: 'url',
  },
];

let passed = 0;
for (const c of cases) {
  const result = detectContext(c.html, 'MARKER');
  const ok = result === c.expected;
  console.log(`${ok ? '✅' : '❌'} ${c.name}: got "${result}", expected "${c.expected}"`);
  if (ok) passed++;
}

console.log(`\n${passed}/${cases.length} passed`);