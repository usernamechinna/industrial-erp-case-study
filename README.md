# Random Joke Generator

A small browser-based random joke generator powered by [JokeAPI](https://jokeapi.dev/). It supports both one-liner and two-part jokes, provides loading/error states, and lets users copy the current joke.

## Run locally

No build step is required. Open `index.html` in a browser, or serve the directory with any static server:

```bash
npx serve .
```

Then visit the URL shown by the server. An internet connection is required because jokes are loaded from the external API.

## Files

- `index.html` — accessible application markup
- `styles.css` — responsive styling
- `app.js` — API integration, rendering, and copy interaction

## API

Requests use JokeAPI's safe-mode endpoint:

`GET https://v2.jokeapi.dev/joke/Any?safe-mode&type=single,twopart`
