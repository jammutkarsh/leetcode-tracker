# Leetcode Tracker

A Vite + React LeetCode tracker with built-in study plans, custom problem sets, spaced repetition reviews, streak tracking, local browser reminders, and Docker deployment.

## Features

- Track progress across `Blind 75`, `LeetCode 75`, and `NeetCode 150`
- Create custom problem sets by submitting LeetCode problem links
- Track solved problems and spaced repetition reviews
- See current and longest study streaks
- Get local reminders for daily streaks and due reviews through a service worker
- Export and import tracker data as JSON
- Run the app locally or inside Docker

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build
```

## Docker

Build the image:

```bash
docker build -t leetcode-tracker .
```

Run the container:

```bash
docker run --rm -p 8080:80 leetcode-tracker
```

Open `http://localhost:8080`.

## Notifications

Browser reminders are local to the device and browser profile where you enable them. Allow notifications in the app, then choose reminder hours for:

- Daily streak reminder
- Spaced repetition review reminder

## Data storage

All data is stored in browser local storage. Export your tracker data if you want a backup or want to move it to another device.
