# Bridge Planner

A mobile-friendly Death Stranding structure and materials planner built with React, TypeScript, and Vite. Recipe values can be edited in the app to account for structure levels or different material requirements.

## Development

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The production output is in `dist/`. Deploy it to a static host over HTTPS for PWA installation and offline support. No Node.js runtime is needed on the hosting server or on users' phones.

### GitHub Pages

The repository includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages whenever changes are pushed to `main`. In the repository settings, open **Pages** and set the deployment source to **GitHub Actions**. After the first successful deployment, the app is available at `https://mateus-dias-cwb.github.io/DeathStrandingCompanion/` and can be installed from a supported browser. The local development server uses `/`; production builds use the repository subpath automatically.

GitHub Pages must remain enabled for the hosted site to be available. Making the repository private can disable Pages, depending on the account plan; changing it back to public may require selecting **GitHub Actions** again under **Settings → Pages** and rerunning the deployment workflow.

The service worker precaches each production build's HTML, JavaScript, styles, and app icons before activating it. When offline or when the server responds with an error such as 404, it serves the cached app instead; an unsuccessful update cannot replace the last completely cached version. Users need to open the app online at least once after installation to download it, and must reconnect to receive updates. Clearing the browser's site data or uninstalling the PWA also removes its offline copy.

This is an unofficial fan-made companion and is not affiliated with or endorsed by the owners of Death Stranding.
