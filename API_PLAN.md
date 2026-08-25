# API Endpoints Plan

## Auth
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Log in | No |
| POST | `/auth/logout` | Log out | Yes |

## Products
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/products` | List products (filter by category, search by name) | No |
| GET | `/products/:id` | Get a single product | No |
| POST | `/products` | Create a product | Yes |
| PUT | `/products/:id` | Update a product | Yes |
| DELETE | `/products/:id` | Delete a product | Yes |

## Users
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update current user profile | Yes |
| DELETE | `/users/me` | Delete current user account | Yes |

## Cart
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/cart` | Get current user's cart with items | Yes |
| POST | `/cart/items` | Add a product to the cart | Yes |
| PUT | `/cart/items/:productId` | Update item quantity | Yes |
| DELETE | `/cart/items/:productId` | Remove an item from the cart | Yes |
| DELETE | `/cart` | Empty the cart | Yes |
| POST | `/cart/checkout` | Convert the cart into an order | Yes |

## Orders
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/orders` | List current user's orders | Yes |
| GET | `/orders/:id` | Get a single order with its items | Yes |
| PUT | `/orders/:id` | Update order status | Yes |
| DELETE | `/orders/:id` | Cancel an order | Yes |

## Notes
- Authentication uses Passport local strategy with express-session.
- Passwords are hashed with bcrypt.
- Checkout is mocked (no real payment). The `orders.payment_intent_id` column
  is reserved so a Stripe integration can be added later without a migration.
- Protected routes return `401 Unauthorized` when no user session is present.