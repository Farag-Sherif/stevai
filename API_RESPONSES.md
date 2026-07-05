# Stevia API - Response Structure & Functionality

All API requests go through `server/api.ts` to `NEXT_PUBLIC_API_URL`. Responses may be wrapped in `data`, `user`, or returned as raw objects depending on the backend.

---

## Auth APIs

### POST `/register`
**Function:** User registration.  
**Response keys:**
| Key | Type | Description |
|-----|------|-------------|
| `status` | `"success" \| "error"` | Registration outcome |
| `token` | `string` | JWT auth token (set in cookie if success) |
| `message` | `string` | Success or error message |
| `error` | `object \| string` | Validation or server errors |
| `errors` | `object` | Field-level validation errors |

---

### POST `/login`
**Function:** User login.  
**Response keys:**
| Key | Type | Description |
|-----|------|-------------|
| `status` | `string` | `"success"` or `"error"` |
| `token` | `string` | JWT token (set in cookie if success) |
| `message` | `string` | Error message if failed |
| `error` | `any` | Error details |

---

### POST `/logout`
**Function:** Logout, clear auth cookie.  
**Response:** Backend-dependent (often empty object).

---

### GET `/user`
**Function:** Get current authenticated user profile.  
**Response keys (may be under `data` or `user`):**
| Key | Type | Description |
|-----|------|-------------|
| `id` | `number` | User ID |
| `fname` | `string` | First name |
| `lname` | `string` | Last name |
| `email` | `string` | Email |
| `phone` | `string` | Phone |
| `addresses` | `array` | User addresses |
| `orders` | `array` | User orders |

---

### POST `/user/edit_profile`
**Function:** Update user profile (name, phone).  
**Body:** `fname`, `lname`, `phone`  
**Response:** Updated user or success/error object.

---

### POST `/user/password`
**Function:** Change password.  
**Body:** `password`  
**Response:** Success/error object.

---

### POST `/password/email`
**Function:** Send password reset code to email.  
**Body:** `email`  
**Response keys:**
| Key | Type | Description |
|-----|------|-------------|
| `status` | `"success" \| "error"` | Result |
| `message` | `string` | Status message |
| `error` | `any` | Error details |

---

### POST `/password/reset`
**Function:** Reset password with token from email.  
**Body:** `email`, `password`, `password_confirmation`, `token`  
**Response:** Success/error object.

---

### POST `/user/addresses/add`
**Function:** Add new address.  
**Body:** `f_name`, `l_name`, `email`, `phone`, `city`, `state?`, `home_phone?`  
**Response:** Created address or success/error.

---

### GET `/user/addresses`
**Function:** List user addresses.  
**Response:** Array of address objects.

---

### POST `/user/addresses/edit/{id}`
**Function:** Update address.  
**Body:** `f_name`, `l_name`, `email`, `phone`, `city`, `state?`, `home_phone?`  
**Response:** Updated address or success/error.

---

### POST `/user/addresses/delete/{id}` or DELETE `/user/addresses/{id}`
**Function:** Delete address.  
**Response:** Success/error object.

---

## Cart APIs

### GET `/cart`
**Function:** Get current user/guest cart.  
**Response keys:**
| Key | Type | Description |
|-----|------|-------------|
| `items` | `array` | Cart items (or `data` or raw array) |
| `item.id` | `number` | Product ID |
| `item.pivot.qty` | `number` | Quantity |
| `item.price`, `item.discount` | `number` | Pricing |

---

### POST `/add-to-cart`
**Function:** Add item to cart.  
**Body:** `item_id`, `qty`, `weight`  
**Response:** Updated cart or success/error. On error: `status: "error"`, `message: "Unauthenticated."`.

---

### POST `/update-qty-cart`
**Function:** Update item quantity.  
**Body:** `item_id`, `qty`  
**Response:** Updated cart or success/error.

---

### POST `/remove-from-cart`
**Function:** Remove item from cart.  
**Body:** `item_id`  
**Response:** Updated cart or success/error.

---

### POST `/remove-all-cart`
**Function:** Clear entire cart.  
**Body:** `{}`  
**Response:** Success/error.

---

### POST `/checkout`
**Function:** Create order and (for `type=gate`) Geidea payment session.  
**Body (logged-in):** `address_id`, `notes`, `type` ("cod"|"gate"), `session_id`, `amount?` (for gate)  
**Body (guest):** `f_name`, `l_name`, `email`, `phone`, `city`, `state?`, `notes`, `cart[]`, `type`, `session_id`, `amount?`  

**مهم – مبلغ الدفع (جيديا):** عند `type=gate` يرسل الفرونت قيمة `amount` (مثلاً "2262.50") وهي نفس المجموع المعروض للمستخدم. **يجب على الباك إند استخدام هذه القيمة بالضبط** عند إنشاء جلسة جيديا. جيديا لا تضيف أي رسوم على المبلغ؛ أي فرق (مثلاً 2294 بدل 2262.50) يعني أن السيرفر يحسب مبلغاً آخر بدل استخدام `amount` المُرسل.

**Important – Payment amount (Geidea):** When `type=gate`, the frontend sends `amount` (e.g. "2262.50") matching the displayed total. **The backend MUST use this exact value** when creating the Geidea session. Geidea does not add any fee; any mismatch (e.g. 2294 instead of 2262.50) means the server is calculating a different amount instead of using the sent `amount`.

**Response keys (gate):**
| Key | Type | Description |
|-----|------|-------------|
| `session.id` / `id` / `session_id` | `string` | Geidea session ID |
| `order.id` / `orderId` | `number` | Local order ID |
| `error` | `string` | e.g. "Invalid amount" if Geidea fails |
| `details` | `string` | Error details |

---

## Wishlist APIs

### GET `/user/my-favorites`
**Function:** Get user wishlist.  
**Response:** Array of `{ item_id, item: {...} }` or `{ item_id }`.

---

### POST `/user/update-fav`
**Function:** Toggle product in wishlist.  
**Body:** `item_id`  
**Response:** Updated wishlist or success/error.

---

## Product APIs

### GET `/best-items`
**Function:** Get featured/best-selling items.  
**Response:** Array of products or `{ data: [...] }`.

---

### GET `/items?page={n}`
**Function:** Get paginated products.  
**Response keys:**
| Key | Type | Description |
|-----|------|-------------|
| `data` | `array` | Product list |
| `data[].id` | `number` | Product ID |
| `data[].name`, `price`, `discount` | `any` | Product fields |

---

### GET `/item/{id}`
**Function:** Get single product details.  
**Response:** Product object with `id`, `name`, `price`, `discount`, `image_path`, `added_value`, etc.

---

### GET `/offers?page={n}&category_id={id}`
**Function:** Get offer products.  
**Response:** Paginated offers (structure similar to `/items`).

---

### GET `/offers/{id}`
**Function:** Get single offer product.  
**Response:** Offer product object.

---

### POST `/items/find`
**Function:** Search products by name.  
**Body:** `name`  
**Response:** Array of matching products.

---

### GET `/brand-items?page={n}`
**Function:** Get brand products.  
**Response:** Paginated products.

---

## Category APIs

### GET `/categories`
**Function:** Get main categories.  
**Response:** Array of `{ id, name, ... }`.

---

### GET `/sub-categories`
**Function:** Get sub-categories.  
**Response:** Array of sub-category objects.

---

### POST `/sub_cafes/find`
**Function:** Get sub-categories by category ID.  
**Body:** `id` (category ID)  
**Response:** Sub-categories or products.

---

### POST `/sub-category/find`
**Function:** Get sub-category by ID with products.  
**Body:** `id` (sub-category ID)  
**Response:** Sub-category with `data`, `items`, etc.

---

### POST `/items/cafes`
**Function:** Get products by sub-category/cafe ID.  
**Body:** `id`  
**Response:** `{ data: [...] }` product array.

---

### GET `/brand-categories`
**Function:** Get brand categories.  
**Response:** Array of brand category objects.

---

## Slider APIs

### GET `/sliders`
**Function:** Homepage sliders.  
**Response:** Array of slider objects.

---

### GET `/sliders-news`
**Function:** News/announcement sliders.  
**Response:** Array of slider objects.

---

### GET `/sliders-categories`
**Function:** Category sliders.  
**Response:** Array of slider objects.

---

### GET `/product-section`
**Function:** Product section sliders.  
**Response:** Array of product slider objects.

---

## Main / Site APIs

### GET `/testimonials`
**Function:** Customer testimonials.  
**Response:** Array of testimonial objects.

---

### GET `/socails`
**Function:** Social media links.  
**Response:** Array of `{ url, icon, ... }`.

---

### GET `/addresse` / `/emails` / `/mobiles` / `/images`
**Function:** Store contact/layout data.  
**Response:** Site config arrays or objects.

---

### GET `/cities`
**Function:** Cities for checkout/addresses (with `states`).  
**Response:** Array of `{ id, name, states: [...], delivery_tax }`.

---

### GET `/orders`
**Function:** Orders (if authenticated).  
**Response:** Array of order objects.

---

### GET `/choices` / `/settings`
**Function:** App choices/settings.  
**Response:** Config object or array.

---

### POST `/contact`
**Function:** Submit contact form.  
**Body:** `name`, `email`, `subject`, `message`  
**Response:** Success/error.

---

### GET `/questions` / `/conditions`
**Function:** FAQ and terms/conditions.  
**Response:** Array or object of content.

---

## Payment APIs

### POST `/payment/callback`
**Function:** Geidea payment success callback.  
**Body:** `orderId` (Geidea order ID)  
**Response:** Backend processes and returns success/error.

---

## Error Response (all APIs)

When the API returns an error (4xx/5xx or backend error):

| Key | Type | Description |
|-----|------|-------------|
| `status` | `"error"` or `number` | Error status |
| `error` | `string` | Error message |
| `message` | `string` | e.g. "Unauthenticated." |
| `details` | `string` | Additional error info |

---

## Note on Response Shapes

The backend may return:
- `{ data: {...} }`
- `{ user: {...} }`
- `{ items: [...] }`
- Raw object or array

`server/api.ts` returns the parsed JSON as-is. Callers (e.g. `extractUserPayload`, `extractCartItems`) normalize these shapes.
