Frontend build notes

Build CSS (requires npm install in `frontend`):

```
cd frontend
npm install
npm run build
```

This produces `frontend/build/css/style.css` which can be uploaded to S3 as the production stylesheet.

For Phase 2 we're using the Tailwind CDN and minimal styles. The build pipeline is optional and recommended before S3 deployment.
