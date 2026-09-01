/**
 * Regression tests for `shared/cart-data.ts`.
 *
 * This logic used to live behind the DMS API. On a static host it runs in the
 * browser against the prebuilt snapshot, so a mistake here silently shows the
 * wrong inventory instead of failing a request. Self-contained: builds its own
 * fixtures, hits no network.
 *
 * Run with `npm test`.
 */

import {
  buildBrands,
  buildSlugMap,
  getCartImageUrls,
  hasOnlyUnpublishedPhotos,
  filterCarts,
  parseCartFilters,
  parsePriceSort,
  sortCarts,
  type AnyCart,
} from "../shared/cart-data";

const stores = [
  {
    _id: "s1",
    storeId: "store1",
    name: "Alaska Golf Carts - Anchorage",
    address: { city: "Anchorage", state: "Alaska", country: "USA" },
  },
];

const MAKES = ["Club Car", "EZGO", "Yamaha", "Denago"];

// 12 carts: electric when i%2===0, used when i%3===0, lifted when i%4===0,
// street legal when i%2===0, passengers cycle 2/4/6, drivetrain alternates
// 2WD / 4X4, and every fifth cart has no photos.
const carts: AnyCart[] = Array.from({ length: 12 }, (_, i) => ({
  _id: `cart${i}`,
  cartType: { make: MAKES[i % MAKES.length], model: `Model ${i % 3}`, year: `${2023 + (i % 3)}` },
  retailPrice: 8000 + i * 250,
  isElectric: i % 2 === 0,
  isUsed: i % 3 === 0,
  cartAttributes: {
    cartColor: ["Black", "White", "Sky Blue"][i % 3],
    driveTrain: i % 2 ? "4X4" : "2WD",
    isLifted: i % 4 === 0,
    passengers: `${2 + (i % 3) * 2}`,
  },
  cartLocation: { locationId: "store1", latestStoreId: "store1" },
  title: { isStreetLegal: i % 2 === 0 },
  vinNo: `VIN${1000 + i}`,
  imageUrls: i % 5 === 0 ? [] : [`cart${i}-a.jpg`],
}));

let failures = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : ` — expected ${expected}, got ${actual}`}`);
}

function countFor(query: string): number {
  return filterCarts(carts, parseCartFilters(new URLSearchParams(query))).length;
}

check("no filters returns everything", countFor(""), 12);
check("condition=used", countFor("condition=used"), 4);
check("condition=new", countFor("condition=new"), 8);
check("isUsed=true matches condition=used", countFor("isUsed=true"), 4);
check("both conditions selected filters nothing out", countFor("isNew=true&isUsed=true"), 12);
check("isElectric=true", countFor("isElectric=true"), 6);
check("isGas=true", countFor("isGas=true"), 6);
check("both power types selected filters nothing out", countFor("isElectric=true&isGas=true"), 12);
check("isLifted=true", countFor("isLifted=true"), 3);
check("isStreetLegal=true", countFor("isStreetLegal=true"), 6);
check("seats=4 Passenger matches passengers \"4\"", countFor("seats=4%20Passenger"), 4);
check("multiple seat counts", countFor("seats=2%20Passenger,6%20Passenger"), 8);
check("driveTrain=4X4", countFor("driveTrain=4X4"), 6);
check("driveTrain=2X4 matches stored \"2WD\"", countFor("driveTrain=2X4"), 6);
check("colors", countFor("colors=black"), 4);
check("models", countFor("models=model%200"), 4);
check("makes by display name", countFor("make=Club%20Car"), 3);
check("makes by DMS key", countFor("makes=club_car"), 3);
check("storeIds", countFor("storeIds=store1"), 12);
check("unknown storeId matches nothing", countFor("storeIds=nope"), 0);
check("free-text search", countFor("search=Yamaha"), 3);
check("search matches VIN", countFor("searchText=VIN1005"), 1);
check("filters combine", countFor("condition=used&make=Club%20Car"), 1);

// New carts with photos lead; price sort only reorders within a bucket.
const ascending = sortCarts(carts, parsePriceSort(new URLSearchParams("priceSortASC=true")));
check(
  "price-ascending sort still leads with a new cart that has photos",
  ascending[0].isUsed !== true && ascending[0].imageUrls.length > 0,
  true
);
const leadPrices = ascending
  .filter((cart) => cart.isUsed !== true && cart.imageUrls.length > 0)
  .map((cart) => cart.retailPrice);
check(
  "prices ascend within the leading bucket",
  leadPrices.every((price, i) => i === 0 || price >= leadPrices[i - 1]),
  true
);

const descending = sortCarts(carts, parsePriceSort(new URLSearchParams("priceSortASC=false")));
const descPrices = descending
  .filter((cart) => cart.isUsed !== true && cart.imageUrls.length > 0)
  .map((cart) => cart.retailPrice);
check(
  "prices descend within the leading bucket",
  descPrices.every((price, i) => i === 0 || price <= descPrices[i - 1]),
  true
);

// Slugs are the site's permalinks, so they must stay stable and collision-free.
const slugMap = buildSlugMap(carts, stores);
check("every cart gets a slug", Object.keys(slugMap.idToSlug).length, 12);
check("slugs are unique", Object.keys(slugMap.slugToId).length, 12);
check(
  "slug shape is make-model-color-city-state-country",
  slugMap.idToSlug.cart0,
  "club-car-model-0-black-anchorage-alaska-usa"
);
check(
  "rebuilding produces identical slugs",
  buildSlugMap(carts, stores).idToSlug.cart7,
  slugMap.idToSlug.cart7
);

// Collision suffixes decide real URLs, so a reordered API response must not
// reshuffle them — that would change live permalinks on a nightly rebuild.
const reordered = [...carts].reverse();
check(
  "a reordered API response produces identical slugs",
  buildSlugMap(reordered, stores).idToSlug,
  slugMap.idToSlug
);

// Three identical carts: the base slug and its suffixes must stay pinned to the
// same cart regardless of the order they arrive in.
const triplets = [0, 1, 2].map((n) => ({ ...carts[0], _id: `triplet${n}` }));
const forward = buildSlugMap(triplets, stores).idToSlug;
const backward = buildSlugMap([...triplets].reverse(), stores).idToSlug;
check("colliding carts keep their suffix when reordered", backward, forward);

const collisionCarts = [carts[0], { ...carts[0], _id: "duplicate" }];
check(
  "colliding slugs get a numeric suffix",
  buildSlugMap(collisionCarts, stores).idToSlug.duplicate,
  "club-car-model-0-black-anchorage-alaska-usa-01"
);

// Only imageUrls is publicly hosted. internalCartImageUrls objects 404 in the
// bucket (verified by scripts/check-images.ts against live data), so linking
// them would show broken images and put dead URLs in the sitemap.
const BUCKET = "https://s3.amazonaws.com/prod.docs.s3/carts/";
check(
  "website photos resolve to bucket URLs",
  getCartImageUrls({ imageUrls: ["b.jpg"] }),
  [`${BUCKET}b.jpg`]
);
check(
  "in-house photos are never linked, even alongside website photos",
  getCartImageUrls({ internalCartImageUrls: ["a.jpg"], imageUrls: ["b.jpg"] }),
  [`${BUCKET}b.jpg`]
);
check(
  "a cart pictured only in-house has nothing the site can show",
  getCartImageUrls({ internalCartImageUrls: ["a.jpg"] }),
  []
);
check("every website photo is returned, in order",
  getCartImageUrls({ imageUrls: ["a.jpg", "c.jpg"] }),
  [`${BUCKET}a.jpg`, `${BUCKET}c.jpg`]
);
check(
  "absolute URLs are left alone rather than prefixed twice",
  getCartImageUrls({ imageUrls: ["https://cdn.example.com/x.jpg"] }),
  ["https://cdn.example.com/x.jpg"]
);
check("a cart with no photos resolves to nothing", getCartImageUrls({}), []);

// Flags carts whose photos exist in the DMS but were never published.
check(
  "in-house-only carts are flagged as unpublished",
  hasOnlyUnpublishedPhotos({ internalCartImageUrls: ["a.jpg"], imageUrls: [] }),
  true
);
check(
  "a cart with website photos is not flagged",
  hasOnlyUnpublishedPhotos({ internalCartImageUrls: ["a.jpg"], imageUrls: ["b.jpg"] }),
  false
);
check(
  "a cart with no photos at all is not flagged as unpublished",
  hasOnlyUnpublishedPhotos({}),
  false
);

check("brands are derived and sorted", buildBrands(carts).map((b) => b.label), [
  "Club Car",
  "Denago",
  "EZGO",
  "Yamaha",
]);
check("brand keys are DMS make keys", buildBrands(carts)[0].key, "club_car");

console.log(failures === 0 ? "\nAll cart-data checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
