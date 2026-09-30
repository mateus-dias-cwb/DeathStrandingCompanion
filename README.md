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

This is an unofficial fan-made companion and is not affiliated with or endorsed by the owners of Death Stranding.
