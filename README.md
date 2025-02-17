# BTSE Assignment: Order Book

https://serious-lynx-a67.notion.site/Order-Book-38158d30a1f8415f9823f2c7d7e5d5a1

## About the project

This is a BTSE assignment project that features an orderbook for BTC-PFC trading history live update. The trading history and last price data are provided via websocket.

## Running the project

```bash
npm install
npm run dev
```

## Tech stack used

- NextJS
  - The most popular framework of the React community, easy to use and supports out-of-the-box project scaffolding, which is useful for quick project bootstrapping.
  - Since TailwindCSS often drags down local performance, I use turbopack mode to accelerate transformation process.
- TailwindCSS
  - Atomic CSS styled framework for rapid styling. Low configuration needed, reduced bundle size via atomic css structure, no need for naming components (utility-first)
- @svgr/webpack
  - webpack loader for svgr, an transformer that converts SVG files to react components for convenient usage.
- zod
  - A typeScript schema declaration & validation library. I use this to verify the untyped data from the websocket.
