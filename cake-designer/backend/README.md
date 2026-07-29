# Design-Your-Cake — Backend (Express + Sequelize + PostgreSQL)

Implements exactly the schema you supplied (20 tables: auth, inventory,
game-canvas-state, ordering lifecycle, payments/notifications), plus one
deliberate addition -- see "Schema deviation" below.

## Setup

```
cd backend
npm install
cp .env.example .env        # edit DB credentials + JWT_SECRET
createdb cake_designer_dev  # or use pgAdmin4
npm run migrate             # creates all 20 tables
npm run seed                # seeds cake bases, flavors, fondants, frostings,
                             # toppings, candles, and 3 coupon codes
npm run dev                 # http://localhost:4000
```

Frontend: set `VITE_API_URL=http://localhost:4000/api` in the frontend's
`.env` (already there if you're using the zip as shipped) and make sure
`CORS_ORIGIN` in the backend's `.env` matches whatever port Vite actually
runs on (default 5173) -- a mismatch here shows up as a CORS error in the
browser console, not a 401/500.

## What's real vs. what's stubbed
- **Real**: all 20 tables via Sequelize migrations, all associations
  (`hasMany`/`belongsTo`), JWT auth + bcrypt, role-gated middleware
  (Customer/Baker/Admin), file upload via multer with static serving,
  transactional writes (order + order_items + status history all commit
  or roll back together), centralized error handling, express-validator
  input validation.
- **Stubbed**: `payments.stripe_payment_intent_id` is populated with a
  fake `pi_mock_...` id -- there's no real Stripe integration (no live
  keys in this environment). Swapping in the real Stripe SDK is a
  same-shaped change to `paymentController.js` only.
- **Notifications**: `notification_logs` has a working model/route but
  nothing actually sends an SMS/email yet -- it's there for the schema
  and demoable via Postman, not wired to a real provider.

## Schema deviation (flagged, not silent)
`orders.reference_image_url` was added -- it's not in the schema you sent.
The reference-image feature ("customer uploads a photo, baker views it")
needs somewhere to store the file path, and no column anywhere in the
supplied schema does that. Adding it to `orders` (rather than `custom_cakes`)
matches your own description of the feature ("associate it with the
order"). If you'd rather it lived elsewhere, it's a one-column migration
to move.

## Auth model
`role` lives on `users` exactly as specified. The public `/auth/signup`
endpoint always creates a `Customer` (can't self-register as Baker/Admin --
promote via direct DB update or a future admin-only endpoint, same as any
real system). Example to promote someone:
```sql
UPDATE users SET role = 'Baker' WHERE email = 'baker@example.com';
```

## API endpoints
```
POST   /api/auth/signup                     
POST   /api/auth/login
GET    /api/auth/me                          (auth)

GET    /api/options                          combined catalog for the decorator
GET    /api/cake-bases | flavors | fondants | frostings | toppings | candles
POST/PUT/DELETE .../:id                      (Baker/Admin only)

PUT    /api/users/profile                    (auth)
GET/POST/PUT/DELETE /api/users/addresses     (auth)

POST   /api/custom-cakes                     optional auth (nullable user_id for guests)
GET    /api/custom-cakes/mine                (auth)
GET    /api/custom-cakes/:id

POST   /api/coupons/validate
GET/POST/PUT/DELETE /api/coupons             (Baker/Admin only)

POST   /api/orders                           multipart -- address_id, items (JSON), reference_image (file, optional)
GET    /api/orders/mine                      (auth)
GET    /api/orders/all                       (Baker/Admin only -- the dashboard feed)
GET    /api/orders/:id
PATCH  /api/orders/:id/status                (Baker/Admin only)

GET/POST/DELETE /api/wishlist                (auth)
GET    /api/reviews/for-cake/:customCakeId
POST/DELETE /api/reviews                     (auth)

POST   /api/payments                         (auth, mock Stripe)
GET    /api/payments/order/:orderId          (auth)

GET    /api/notifications/mine               (auth)
POST   /api/notifications                    (Baker/Admin only)
```

## Tested against a real database
Every endpoint above was exercised against a live PostgreSQL 16 instance
during development, including: signup/duplicate-signup (409), bad login
(401), unauthenticated wishlist access (401), invalid coupon (404), a full
order with a real multipart file upload, role gating on `/orders/all`
(403 for Customer, 200 for Baker), and status-history append on update.
