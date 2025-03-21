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
- [Node.js](https://nodejs.org/) (version 20 or higher)
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

3. Use the deployment script to avoid file conflicts:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   This script will:
   - Check for and remove conflicting files
   - Run the Vercel deployment process

   Alternatively, you can manually remove conflicting files and then deploy:
   ```bash
   # Remove conflicting files
   rm -f api/index.js
   # Deploy
   vercel
   ```

4. Follow the prompts to complete the deployment.

#### Option 2: Deploy from the Vercel Dashboard

1. **Important**: Before pushing to your repository, make sure to remove the conflicting file:
   ```bash
   rm -f api/index.js
   ```

2. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

3. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).

4. Click "New Project".

5. Import your repository.

6. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

7. Add this to the Build & Development Settings:
   - Add an Override for the Install Command: `rm -f api/index.js && npm install`
   This will ensure the conflicting file is removed during the build process.

8. Click "Deploy".

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

### Standard Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

### Docker Deployment

PrivacyShield can be easily deployed using Docker. We provide two deployment options:

#### Development Deployment

```bash
# Make scripts executable
chmod +x make-scripts-executable.sh
./make-scripts-executable.sh

# Deploy with Docker for development
npm run docker:deploy
```

#### Production Deployment

```bash
# Make scripts executable
chmod +x make-scripts-executable.sh
./make-scripts-executable.sh

# Deploy with Docker for production
npm run docker:deploy:prod
```

For more detailed Docker deployment instructions, see [Docker Deployment Guide](README.docker.md).

## Dependency Management

PrivacyShield uses stable versions of all dependencies, including:

- React 18.2.0
- Express 4.18.2
- Drizzle ORM 0.29.3
- Tailwind CSS 3.3.3
- TypeScript 5.3.3
- Stripe 14.11.0

To update dependencies to their latest versions:

```bash
# Make scripts executable
chmod +x make-scripts-executable.sh
./make-scripts-executable.sh

# Update dependencies
npm run update-deps
```

If you encounter dependency issues during deployment, you can fix them with:

```bash
# Fix dependencies
npm run fix-deps

# Generate lockfile
npm run generate-lockfile
```

This will use a known working set of dependency versions from package.json.fixed and generate a compatible package-lock.json file.

## Troubleshooting

### Vercel Deployment Errors

#### File Conflicts

If you encounter this error:
```
Error: Two or more files have conflicting paths or names. Please make sure path segments and filenames, without their extension, are unique. The path "api/index.js" has conflicts with "api/index.ts".
```

This is caused by having both `api/index.js` and `api/index.ts` in the same directory. To fix this:

1. Remove the conflicting file:
   ```bash
   rm -f api/index.js
   ```

2. Use the deployment script:
   ```bash
   ./deploy.sh
   ```

3. Or modify your Vercel project settings to include a pre-install command:
   ```
   rm -f api/index.js
   ```

#### Other Issues

- Make sure all dependencies are correctly installed
- Check that your environment variables are properly set
- Verify that your build commands are correct

## License

MIT