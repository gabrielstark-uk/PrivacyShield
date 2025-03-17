# PrivacyShield

PrivacyShield is an advanced application for detecting and neutralizing potential threats from V2K (Voice-to-Skull), sound cannons, and non-lethal laser weapons.

## Features

- Real-time frequency analysis and threat detection
- Automatic frequency locking for tracking threats
- Advanced countermeasures using phase-cancellation technology
- Detailed reporting system for documenting incidents
- Automatic notification to authorities with location tracking

## Deployment on Vercel

### Prerequisites

- A [Vercel](https://vercel.com) account
- [Git](https://git-scm.com/) installed on your computer
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Vercel CLI](https://vercel.com/docs/cli) (optional)

### Deployment Steps

#### Option 1: Deploy with Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. Follow the prompts to complete the deployment.

#### Option 2: Deploy from the Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).

3. Click "New Project".

4. Import your repository.

5. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. Click "Deploy".

### Environment Variables

For production deployment, you may need to set the following environment variables:

- `NODE_ENV`: Set to `production`
- `PORT`: The port number (default is 3000)

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PrivacyShield
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## License

MIT