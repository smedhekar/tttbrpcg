# Card Drawer (Vite + React)

This is a ready-to-deploy project for the Card Drawer app.

## Deploy without running anything locally

1. **Download this folder as a ZIP** (from ChatGPT download link).
2. Go to **GitHub** (in your browser) → create a new *public* repo → **Upload files** → drag the unzipped project contents into it → **Commit**.
3. Go to **Netlify** → **New site from Git** → pick your GitHub repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - (This repo already has `netlify.toml` with those settings.)
4. Netlify will build and deploy. You’ll get a URL like `https://your-site.netlify.app` you can open on your phone.
5. On your phone, use **Add to Home Screen / Install app** for a fullscreen feel.

## Local dev (optional)
```bash
npm install
npm run dev
```

## Notes
- Upload your four CSVs in the UI (Characters, Items, Locations, Quests). Make sure rows align across sheets.
- No shadcn CLI needed—minimal UI components are included.
