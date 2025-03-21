// Minimal server for fallback
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PrivacyShield</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
          }
          h1 {
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>PrivacyShield</h1>
          <p>The application is running in minimal mode.</p>
          <p>This is a fallback server that is used when the full application build is not available.</p>
          <p>API Health Status: OK</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', mode: 'minimal', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Minimal server running on port ${port}`);
});