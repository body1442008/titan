
# TitanChat - Next.js Version

This is the TitanChat application, restructured for deployment on Vercel using Next.js.

## Project Structure

-   `pages/`: Application routes and views.
    -   `_app.tsx`: Global App component, wraps all pages.
    -   `_document.tsx`: Custom HTML document structure.
    -   `index.tsx`: Main chat interface.
    -   `login.tsx`, `signup.tsx`: Authentication pages.
    -   `settings.tsx`, `admin.tsx`: Settings and Admin panels.
-   `components/`: Reusable React components.
-   `context/`: React Context providers for state management.
-   `lib/`: Utility functions and constants.
-   `public/`: Static assets (images, favicons).
-   `styles/`: Global stylesheets.
-   `types/`: TypeScript definitions.

## Getting Started

### Prerequisites

-   Node.js (version 18.x or later recommended)
-   npm or yarn

### Environment Variables

Create a `.env.local` file in the root of the project and add your Gemini API Key:

```
API_KEY=YOUR_GEMINI_API_KEY
```

**Important Security Note**: The `API_KEY` is used as specified by the `@google/genai` SDK guidelines (`process.env.API_KEY`). In a typical secure Next.js application, API keys for client-side calls should be proxied through Next.js API routes to avoid exposing them. This setup assumes the execution context for the SDK initialization has `process.env.API_KEY` available as per guidelines, which is more typical for server-side or build-time usage.

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd titanchat-nextjs
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running Locally

```bash
npm run dev
# or
# yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
# or
# yarn build
```

This will create an optimized production build in the `.next` folder.

### Running in Production Mode (Locally)

After building, you can start the application in production mode:

```bash
npm run start
# or
# yarn start
```

## Deployment to Vercel

1.  **Push your code to a Git repository** (GitHub, GitLab, Bitbucket).
2.  **Sign up or Log in to Vercel**: [https://vercel.com](https://vercel.com)
3.  **Import Project**:
    *   Click on "Add New..." -> "Project".
    *   Select your Git repository.
    *   Vercel will automatically detect that it's a Next.js project and configure the build settings.
4.  **Configure Environment Variables**:
    *   In the Vercel project settings, go to "Environment Variables".
    *   Add `API_KEY` with your Gemini API key value. Ensure it's available for all necessary environments (Production, Preview, Development if testing Vercel's dev environment).
5.  **Deploy**:
    *   Click the "Deploy" button.
    *   Vercel will build and deploy your application. You'll receive a unique URL for your deployment.

Subsequent pushes to your connected Git branch (e.g., `main` or `master`) will automatically trigger new deployments on Vercel.
