export default function handler(req, res) {
  const query = req.query.query || '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vulnerable Search</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 640px;
      margin: 60px auto;
      padding: 0 20px;
      color: #e6e6e6;
      background: #0a0a0a;
      line-height: 1.6;
    }
    .banner {
      border: 1px solid #7f1d1d;
      background: #1c0a0a;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      color: #fca5a5;
      font-size: 14px;
    }
    .result {
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 16px;
      background: #111;
      margin-top: 16px;
    }
    code {
      background: #171717;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 13px;
    }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="banner">
    ⚠️ This page is <strong>intentionally vulnerable</strong>. The <code>query</code> parameter is reflected server-side into the HTML.
  </div>

  <h1>Vulnerable Search</h1>
  <p>You searched for:</p>

  <div class="result">
    <span id="output">${query}</span>
  </div>

  <p style="margin-top: 24px; font-size: 13px;">
    <a href="/">← back to home</a>
  </p>
</body>
</html>`);
}