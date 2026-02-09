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

export const S3_CARTS_URL = "https://s3.amazonaws.com/prod.docs.s3/carts/";
export const COMING_SOON_IMAGE = "https://tigongolfcarts.com/wp-content/uploads/2024/11/TIGON-GOLF-CARTS-IMAGES-COMING-SOON.jpg";
export const PHONE_NUMBER = "1-844-844-6638";
export const PHONE_TEL = "tel:1-844-844-6638";
