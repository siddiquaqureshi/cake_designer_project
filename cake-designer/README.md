# Design-Your-Cake — Phase 1: The Decorating Game (Frontend)

This is phase 1 of the full project: the React/Vite/Tailwind frontend, fully
working on its own with mock data so you can run and demo it right now,
before the Express + PostgreSQL backend exists.

## What's here
- Full decorating flow: shape -> flavor -> layers -> fondant -> frosting ->
  toppings (drag-and-drop, plus tap-to-place for touch) -> text (typed or
  freehand-drawn) -> candles -> confetti reveal.
- A live cake preview (`src/components/CakePreview.jsx`) that every step
  renders into -- this is the "game" feel the brief asked for.
- Home page with the looping muted hero video, "Start Decorating" CTA,
  a Login/Signup modal, and a wishlist star icon.
- A full checkout page (`/order`) matching the layout of the reference
  screenshots: contact, delivery, shipping method, payment, billing,
  order summary with a coupon field.
- React Router v6 with a dynamic `:step` param (`/decorate/shape`,
  `/decorate/flavor`, ...), `useNavigate` for Back/Next.
- Global state via Context API (`AuthContext` for the logged-in user --
  avoids drilling `user`/`login`/`logout` through every layout component --
  and `CakeContext`).
- `useReducer` in `CakeContext` for the multi-step cake object, since
  shape/flavor/layers/fondant/frosting/toppings/text/candles all interact
  (e.g. changing shape clears topping placements) -- a cleaner fit than 8
  separate `useState` calls.
- `useEffect` in `Decorate.jsx` fetching the option catalog on mount,
  with loading/error states and a cleanup function that ignores a late
  response if the component unmounts first.
- Cake assets (toppings/frosting/candles) were background-removed and
  cropped from your photos with rembg, isolated onto transparent PNGs in
  `public/assets/`.

## Running it
```
npm install
npm run dev
```
Then open the printed local URL. No backend or database is required for
this phase -- `src/api/client.js` tries `VITE_API_URL` first and silently
falls back to local mock data (backed by localStorage) if nothing is
running there yet, so wishlist, login, coupons, and orders all work today.

## Coupons to try at checkout
SWEET10 (10% off), CAKE20 (20% off), FIRSTBAKE (15% off).

## Where the backend plugs in later
Every network call goes through `src/api/client.js`. Point
`VITE_API_URL` (a `.env` file, e.g. `VITE_API_URL=http://localhost:4000/api`)
at your Express server once it exists, and each function
(`fetchDecorOptions`, `login`, `signup`, `fetchWishlist`, `saveWishlistItem`,
`validateCoupon`, `placeOrder`) will use it automatically -- no other file
needs to change.

## Not built yet (next phases)
- Express + Sequelize backend, PostgreSQL migrations/seeders, JWT auth,
  bcrypt hashing, protected routes.
- Postman collection, ER diagram, architecture diagram.
- Git history with staged commits (this was generated in one pass -- you'll
  want to `git init` and commit incrementally yourself, or ask me to help
  script a realistic commit sequence).

## Known limitation in this sandbox (not a bug in your copy)
The Google Fonts `@import` in `src/index.css` may 403 in network-restricted
sandboxes; it will load fine on your machine or any normal deployment.
