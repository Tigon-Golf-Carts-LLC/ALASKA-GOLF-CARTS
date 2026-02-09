# Tigon DMS API - Complete Integration Guide

## Overview

This document covers the full integration with the **Tigon DMS (Dealer Management System) API** used to power the TIGON USA golf cart dealership website. The API provides real-time inventory data, store locations, and vehicle details from the Tigon DMS platform.

---

## API Base URL

```
https://api.tigondms.com/wp-website
```

No API key or authentication is required. All endpoints are publicly accessible.

---

## API Endpoints

### 1. Get Carts (Inventory Listing)

- **URL:** `POST /get-carts`
- **Description:** Fetches paginated inventory with optional filters
- **Request Body (JSON):**

```json
{
  "pageNumber": 0,
  "pageSize": 20,
  "searchText": "evolution",
  "priceSortASC": true,
  "isNew": true,
  "isUsed": false,
  "isElectric": true,
  "isGas": false,
  "isStreetLegal": true,
  "isLifted": true,
  "makes": ["evolution"],
  "models": ["d5_ranger_4"],
  "colors": ["sky blue"],
  "seats": ["4"],
  "driveTrain": ["4wd"],
  "storeIds": ["store123"]
}
```

All filter fields are optional. Only `pageNumber` and `pageSize` are recommended.

- **Response:**

```json
{
  "carts": [
    {
      "_id": "6984bb54266ae7d997f64aa9",
      "cartType": {
        "make": "Denago",
        "model": "Nomad XL",
        "year": "2025"
      },
      "retailPrice": 8495,
      "isElectric": true,
      "isUsed": false,
      "cartAttributes": {
        "cartColor": "Gray",
        "seatColor": "Black",
        "driveTrain": "2WD",
        "tireRimSize": "14",
        "tireType": "All Terrain",
        "hasSoundSystem": true,
        "isLifted": false,
        "hasHitch": true,
        "hasExtendedTop": false,
        "passengers": "4"
      },
      "battery": {
        "year": "2025",
        "brand": "Lithium",
        "type": "Lithium",
        "ampHours": "105",
        "batteryVoltage": "51.2",
        "packVoltage": "48",
        "warrantyLength": "5 Years"
      },
      "engine": null,
      "cartLocation": {
        "locationId": "store456",
        "locationDescription": "Hatfield, PA",
        "latestStoreId": "store456"
      },
      "serialNo": "ABC123",
      "vinNo": "VIN12345",
      "title": {
        "isStreetLegal": true,
        "isTitleInPossession": true
      },
      "warrantyLength": "3 Years",
      "odometer": 0,
      "hour": 0,
      "imageUrls": ["image1.jpg", "image2.jpg"],
      "internalCartImageUrls": ["internal1.jpg"],
      "status": "Available"
    }
  ],
  "totalCarts": 50
}
```

### 2. Get Cart By ID (Single Vehicle Detail)

- **URL:** `POST /get-cart-by-id`
- **Description:** Fetches a single cart by its MongoDB `_id`
- **Request Body:**

```json
{
  "cartId": "6984bb54266ae7d997f64aa9"
}
```

- **Response:** Returns a single cart object (same structure as items in `get-carts`)

### 3. Get Stores (Dealership Locations)

- **URL:** `GET /tigon-stores`
- **Description:** Returns all dealership store locations
- **Response:**

```json
[
  {
    "_id": "abc123",
    "storeId": "store456",
    "name": "Tigon - Hatfield",
    "address": {
      "address1": "123 Main St",
      "address2": "",
      "city": "Hatfield",
      "state": "Pennsylvania",
      "postalCode": "19440",
      "country": "USA"
    }
  }
]
```

### 4. Get Cart Models (Dynamic Model List)

- **URL:** `POST /get-cart-models`
- **Description:** Returns available models filtered by make
- **Request Body:**

```json
{
  "makeKeys": ["evolution", "denago"]
}
```

- **Response:**

```json
[
  {
    "_id": "model_id",
    "label": "D5 Ranger 4",
    "makeKey": "evolution",
    "recordOrder": 1,
    "key": "d5_ranger_4"
  }
]
```

### 5. Get Cart Colors (Dynamic Color List)

- **URL:** `POST /get-cart-colors`
- **Description:** Returns available colors filtered by make
- **Request Body:**

```json
{
  "makeKeys": ["evolution"]
}
```

- **Response:**

```json
[
  { "color": "Sky Blue" },
  { "color": "Black" }
]
```

### 6. Get Featured Carts

- **URL:** `POST /get-featured-carts`
- **Description:** Returns featured/promoted carts
- **Request Body:**

```json
{
  "key": "national"
}
```

---

## Image Handling

There are two image URL arrays on each cart object:

| Field | Accessibility | Usage |
|-------|--------------|-------|
| `imageUrls` | **Public** - accessible via S3 | Use these for the website |
| `internalCartImageUrls` | **Private** - not publicly accessible | Do NOT use these |

**S3 Base URL for public images:**

```
https://s3.amazonaws.com/prod.docs.s3/carts/
```

To build a full image URL, concatenate the base URL with the filename:

```
https://s3.amazonaws.com/prod.docs.s3/carts/ + imageUrls[0]
```

**Important:** Most carts (~37 out of 50) only have `internalCartImageUrls` and no public `imageUrls`. For these, display a "Coming Soon" placeholder image:

```
https://tigongolfcarts.com/wp-content/uploads/2024/11/TIGON-GOLF-CARTS-IMAGES-COMING-SOON.jpg
```

---

## Data Schemas (TypeScript/Zod)

These are the Zod schemas used to validate and type the API responses. Place these in `shared/schema.ts`:

```typescript
import { z } from "zod";

export const CartTypeSchema = z.object({
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
});

export const CartAttributesSchema = z.object({
  cartColor: z.string().optional().nullable(),
  seatColor: z.string().optional().nullable(),
  driveTrain: z.string().optional().nullable(),
  tireRimSize: z.string().optional().nullable(),
  tireType: z.string().optional().nullable(),
  hasSoundSystem: z.boolean().optional().nullable(),
  isLifted: z.boolean().optional().nullable(),
  hasHitch: z.boolean().optional().nullable(),
  hasExtendedTop: z.boolean().optional().nullable(),
  passengers: z.string().optional().nullable(),
});

export const BatterySchema = z.object({
  year: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  serialNo: z.string().optional().nullable(),
  ampHours: z.string().optional().nullable(),
  batteryVoltage: z.string().optional().nullable(),
  packVoltage: z.string().optional().nullable(),
  warrantyLength: z.string().optional().nullable(),
  isDC: z.boolean().optional().nullable(),
});

export const EngineSchema = z.object({
  make: z.string().optional().nullable(),
  horsepower: z.string().optional().nullable(),
  stroke: z.string().optional().nullable(),
});

export const CartLocationSchema = z.object({
  locationId: z.string().optional().nullable(),
  locationDescription: z.string().optional().nullable(),
  latestStoreId: z.string().optional().nullable(),
});

export const TitleSchema = z.object({
  isStreetLegal: z.boolean().optional().nullable(),
  isTitleInPossession: z.boolean().optional().nullable(),
  storeID: z.string().optional().nullable(),
});

export const CartSchema = z.object({
  _id: z.string(),
  cartType: CartTypeSchema.optional().nullable(),
  retailPrice: z.number().optional().nullable(),
  isElectric: z.boolean().optional().nullable(),
  isUsed: z.boolean().optional().nullable(),
  cartAttributes: CartAttributesSchema.optional().nullable(),
  battery: BatterySchema.optional().nullable(),
  engine: EngineSchema.optional().nullable(),
  cartLocation: CartLocationSchema.optional().nullable(),
  serialNo: z.string().optional().nullable(),
  vinNo: z.string().optional().nullable(),
  title: TitleSchema.optional().nullable(),
  warrantyLength: z.string().optional().nullable(),
  odometer: z.any().optional().nullable(),
  hour: z.any().optional().nullable(),
  imageUrls: z.array(z.string()).optional().nullable(),
  internalCartImageUrls: z.array(z.string()).optional().nullable(),
  status: z.string().optional().nullable(),
});

export const StoreSchema = z.object({
  _id: z.string(),
  storeId: z.string(),
  name: z.string(),
  address: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

export const CartsResponseSchema = z.object({
  carts: z.array(CartSchema),
  totalCarts: z.number(),
});

export const CartModelSchema = z.object({
  _id: z.string(),
  label: z.string(),
  makeKey: z.string(),
  recordOrder: z.number().optional(),
  key: z.string().optional(),
});

export const CartColorSchema = z.object({
  color: z.string(),
});

export const GetCartsRequestSchema = z.object({
  pageNumber: z.number().default(0),
  pageSize: z.number().default(20),
  searchText: z.string().optional(),
  priceSortASC: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isUsed: z.boolean().optional(),
  isElectric: z.boolean().optional(),
  isGas: z.boolean().optional(),
  isStreetLegal: z.boolean().optional(),
  isNotStreetLegal: z.boolean().optional(),
  isLifted: z.boolean().optional(),
  isNotLifted: z.boolean().optional(),
  makes: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  seats: z.array(z.string()).optional(),
  driveTrain: z.array(z.string()).optional(),
  batteryType: z.array(z.string()).optional(),
  storeIds: z.array(z.string()).optional(),
});

export type Cart = z.infer<typeof CartSchema>;
export type Store = z.infer<typeof StoreSchema>;
export type CartsResponse = z.infer<typeof CartsResponseSchema>;
export type CartModel = z.infer<typeof CartModelSchema>;
export type CartColor = z.infer<typeof CartColorSchema>;
export type GetCartsRequest = z.infer<typeof GetCartsRequestSchema>;
```

---

## Backend Proxy Architecture

The Express backend acts as a proxy between the frontend and the DMS API. This is necessary because:

1. **CORS** - The DMS API doesn't allow direct browser requests
2. **Caching** - In-memory caching reduces API calls and speeds up the site
3. **Query translation** - Frontend uses GET query params, backend converts to POST bodies

### Caching Strategy

| Endpoint | Cache TTL | Reason |
|----------|-----------|--------|
| `/api/stores` | 1 hour (3,600,000ms) | Store locations rarely change |
| `/api/carts` | 2 minutes (120,000ms) | Inventory changes occasionally |
| `/api/cart/:id` | 5 minutes (300,000ms) | Individual cart data is semi-static |
| `/api/cart-models` | 10 minutes (600,000ms) | Models don't change often |
| `/api/cart-colors` | 10 minutes (600,000ms) | Colors don't change often |
| `/api/brands` | 10 minutes (600,000ms) | Brands derived from inventory |
| `/api/slug-map` | 2 minutes (120,000ms) | Must stay in sync with inventory |

### Backend Route Mapping

| Frontend Calls | Backend Route | DMS Endpoint | Method |
|---------------|---------------|--------------|--------|
| `GET /api/stores` | `/api/stores` | `GET /tigon-stores` | GET |
| `GET /api/carts?params` | `/api/carts` | `POST /get-carts` | GET->POST |
| `GET /api/cart/:id` | `/api/cart/:id` | `POST /get-cart-by-id` | GET->POST |
| `POST /api/cart-models` | `/api/cart-models` | `POST /get-cart-models` | POST |
| `POST /api/cart-colors` | `/api/cart-colors` | `POST /get-cart-colors` | POST |
| `GET /api/brands` | `/api/brands` | `POST /get-carts` (derived) | GET->POST |
| `GET /api/slug-map` | `/api/slug-map` | Both `/get-carts` + `/tigon-stores` | GET->POST |

---

## Dynamic Brand Extraction

Brands are NOT provided by a dedicated API endpoint. Instead, they are **dynamically extracted** from the full inventory:

1. Fetch all carts: `POST /get-carts` with `pageSize: 500`
2. Loop through all carts and extract unique `cartType.make` values
3. Generate a `key` for each (lowercase, special chars replaced with `_`)
4. Return as `[{ key: "evolution", label: "Evolution" }]`

This approach ensures the brand list always matches what's actually in inventory.

---

## SEO-Friendly Slug URL System

### How Slugs Are Generated

Vehicle detail pages use descriptive, SEO-friendly URLs instead of MongoDB IDs.

**Format:** `/golfcart/{make}-{model}-{color}-{city}-{state}-{country}`

**Example:** `/golfcart/denago-nomad-xl-gray-hatfield-pennsylvania-usa`

### Slug Generation Algorithm

1. Fetch ALL carts and ALL stores from the DMS API
2. Build a store lookup map (`storeId` -> store data)
3. For each cart:
   - Extract: `make`, `model`, `color` from cart data
   - Look up the store using `cartLocation.locationId` or `cartLocation.latestStoreId`
   - Extract: `city`, `state`, `country` from the store's address
   - Normalize each part: lowercase, replace non-alphanumeric chars with hyphens, trim hyphens
   - Join all parts with hyphens
4. Handle duplicates by appending `-01`, `-02`, etc.
5. Build two maps: `slugToId` and `idToSlug`

### Slug Normalization Function

```typescript
const toSlugPart = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
```

### Duplicate Handling

When two carts produce the same slug (e.g., two black Club Car Precedents at the same location):

- First cart: `club-car-precedent-black-ocean-view-new-jersey-usa`
- Second cart: `club-car-precedent-black-ocean-view-new-jersey-usa-01`
- Third cart: `club-car-precedent-black-ocean-view-new-jersey-usa-02`

### Fallback

If a cart has no make/model/color/location data, it falls back to: `cart-{_id}`

### Frontend Resolution

1. Frontend fetches `/api/slug-map` which returns `{ slugToId, idToSlug }`
2. Cart cards use `idToSlug[cart._id]` to build links
3. Cart detail page uses `slugToId[slug]` to resolve the cart ID, then fetches cart data by ID
4. If the slug isn't found in the map, it falls back to treating the slug as a raw ID (backward compatibility)

---

## Filter System

### Available Filters

| Filter | Query Param | Type | DMS Field |
|--------|-------------|------|-----------|
| Search | `searchText` | string | Full-text search |
| Price Sort | `priceSortASC` | boolean | Sort by price |
| New Only | `isNew` | boolean | New carts |
| Used Only | `isUsed` | boolean | Used carts |
| Electric | `isElectric` | boolean | Electric carts |
| Gas | `isGas` | boolean | Gas carts |
| Street Legal | `isStreetLegal` | boolean | Street legal carts |
| Lifted | `isLifted` | boolean | Lifted carts |
| Makes | `makes` | comma-separated | Brand filter (lowercase, special chars as `_`) |
| Models | `models` | comma-separated | Model filter |
| Colors | `colors` | comma-separated | Color filter |
| Seats | `seats` | comma-separated | Passenger count filter |
| Drive Train | `driveTrain` | comma-separated | Drivetrain filter |
| Store IDs | `storeIds` | comma-separated | Location filter |

### Make Key Format

When filtering by make, the API expects keys in a specific format:
- Original: `"Club Car"` -> Key: `"club_car"`
- Original: `"E-Z-GO"` -> Key: `"e_z_go"`
- Rule: Lowercase, replace all non-alphanumeric characters with underscores

---

## Key Constants

```typescript
export const PHONE_NUMBER = "1-844-844-6638";
export const PHONE_TEL = "tel:1-844-844-6638";
export const S3_CARTS_URL = "https://s3.amazonaws.com/prod.docs.s3/carts/";
export const COMING_SOON_IMAGE = "https://tigongolfcarts.com/wp-content/uploads/2024/11/TIGON-GOLF-CARTS-IMAGES-COMING-SOON.jpg";
```

---

## Financing Partners

The site includes a Financing page with 6 partner cards:

1. **Sheffield BBT** - https://sheffieldbbt.com/apply
2. **BLI Heartland** - https://app.bfrportal.com
3. **DLL Financial** - https://www.dfrportal.com
4. **Roadrunner / Octane** - https://app.roadrunnerfinancial.com
5. **Univest Capital** - https://www.univestcapitalinc.com/apply
6. **Dealer Direct** - https://www.dealerdirect.com

Each vehicle detail page shows a 0% APR / 48-month financing calculation and links to the Financing page.

---

## Important Notes

1. **No authentication required** - The DMS API is public
2. **POST for most endpoints** - Even read operations use POST (except stores)
3. **MongoDB IDs** - All `_id` fields are MongoDB ObjectId strings (24 hex characters)
4. **Image gotcha** - Only `imageUrls` are public; `internalCartImageUrls` will return 403 errors
5. **Make key format** - Uses underscores, not hyphens, for the DMS API filter
6. **Slug format** - Uses hyphens for the URL slugs (different from make keys)
7. **pageSize limit** - Set a reasonable max (100) to prevent abuse; use 500 internally for brand/slug extraction
