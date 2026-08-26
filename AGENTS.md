# Base44 Dev Environment

## Overview
Simple calculator app — pure HTML/CSS/JS served by Vite dev server (live reload).

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
The app is served on host port 3000 (mapped to Vite's 5173 inside the container).

## Notes
- No build step; Vite serves static `index.html`, `style.css`, `script.js` directly.
- `npm install` runs at container start (installs Vite dev dependency).
- No external services, databases, or secrets required.
