# KisanSetu

Run locally with `npm install` and `npm run dev`.

## Online integrations

- The guest flow can request the browser's location and retrieves current conditions from Open-Meteo when online. If location/network access is unavailable, it deliberately falls back to saved demo context.
- `VITE_NRSC_CONTEXT_API_URL` is an optional HTTPS endpoint you control. It receives `{ latitude, longitude }` and should return authorised NRSC/remote-sensing and risk context. Credentials and restricted NRSC access must stay on that server.
- `VITE_ASSISTANT_API_URL` is an optional HTTPS endpoint you control. It receives `{ question, context }` and should return `{ answer }`. That server may call an AI provider and a web-search service, apply citations/safety checks, and keep all API keys private.

Never put an AI provider key, NRSC credential, government-login credential, Aadhaar number, OTP, banking data, or insurance policy number in Vite environment variables or browser storage.
