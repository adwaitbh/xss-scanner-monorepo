# XSS Scanner

A reflected Cross-Site Scripting scanner that discovers parameters, injects payloads, and confirms execution in a real headless browser.

**Live demo:** https://xss-scannerweb.vercel.app

## What it does

1. **Discovers** injectable parameters from the target URL and HTML forms
2. **Injects** reflected XSS payloads into each parameter
3. **Detects reflection** in the response HTML
4. **Confirms execution** by loading the payload URL in a real headless browser and hooking `alert()` dialogs

The output distinguishes between three states:

- **Clean** — no reflection detected
- **Reflected** — payload appears in the response but didn't execute (likely encoded or CSP-blocked)
- **Confirmed XSS** — payload reflected *and* JavaScript executed in a real browser

## Architecture
