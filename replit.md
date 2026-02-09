# TIGON USA - Golf Cart Dealership Website

## Overview
A vehicle dealership website for TIGON USA that pulls inventory from the Tigon DMS API. Displays new and used golf carts with images, pricing, specifications, and "Call Now" CTAs.

## Architecture
- **Frontend**: React + TypeScript + Vite with Tailwind CSS + shadcn/ui
- **Backend**: Express.js proxy to Tigon DMS API with in-memory caching
- **No database needed** - all data comes from external DMS API

## Key Features
- Home page with hero, featured inventory, brands, and store locations
- Full inventory page with filters (condition, power type, brand, model, color, seating, drivetrain, location)
- Individual cart detail pages with image gallery, specs, battery/engine info
- All CTAs are "Call Now" buttons linking to tel:1-844-844-6638
- Dark/light theme toggle
- Responsive design

## External API (Tigon DMS)
Base URL: `https://api.tigondms.com/wp-website`
- `POST /get-carts` - paginated inventory with filters
- `POST /get-cart-by-id` - single cart details
- `GET /tigon-stores` - store locations
- `POST /get-cart-models` - models by make
- `POST /get-cart-colors` - colors by make

## Project Structure
- `client/src/pages/` - Home, Inventory, CartDetail, NotFound
- `client/src/components/` - Header, Footer, CartCard, InventoryFilters, ThemeProvider
- `client/src/lib/constants.ts` - shared constants, helpers
- `server/routes.ts` - API proxy routes with caching
- `shared/schema.ts` - TypeScript types/Zod schemas for DMS data

## S3 Image URLs
Cart images: `https://s3.amazonaws.com/prod.docs.s3/carts/{filename}`

## Theme
Green primary (#22c55e range), dark mode default, Plus Jakarta Sans font
