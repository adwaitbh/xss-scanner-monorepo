/**
 * Detects the HTML context where a marker string appears in a response.
 *
 * Returns: 'html' | 'attribute' | 'url' | 'script' | 'unknown'
 */
function detectContext(html, marker) {
  const idx = html.indexOf(marker);
  if (idx === -1) return 'unknown';

  const before = html.slice(0, idx);

  // Are we inside a tag (between < and >) or in text/script content?
  const lastOpenTag = before.lastIndexOf('<');
  const lastCloseTag = before.lastIndexOf('>');
  const insideTag = lastOpenTag > lastCloseTag;

  if (insideTag) {
    // We're inside <something ... >  → inside an attribute value
    // Extract the last attribute name before the marker
    const tagSoFar = before.slice(lastOpenTag);
    const attrMatch = tagSoFar.match(/([a-zA-Z-]+)\s*=\s*["']?[^"'\s>]*$/);
    const lastAttr = attrMatch ? attrMatch[1].toLowerCase() : '';

    const urlAttrs = ['href', 'src', 'action', 'formaction', 'data', 'poster'];
    if (urlAttrs.includes(lastAttr)) {
      return 'url';
    }

    return 'attribute';
  }

  // Not inside a tag — check if we're inside a <script> body
  const lastScriptOpen = before.lastIndexOf('<script');
  const lastScriptClose = before.lastIndexOf('</script');
  if (lastScriptOpen > lastScriptClose) {
    return 'script';
  }

  // Default: plain HTML body
  return 'html';
}

module.exports = { detectContext };