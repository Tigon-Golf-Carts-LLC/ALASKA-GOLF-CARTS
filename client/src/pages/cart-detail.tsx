import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Phone, ChevronLeft, Zap, Fuel, Shield, Users, MapPin, Calendar, Gauge, Clock, Battery, Wrench, CheckCircle2, Timer, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Cart, Store } from "@shared/schema";
import { formatPrice, getAllCartImages, buildCartTitle, PHONE_NUMBER, PHONE_TEL, STATE_ABBREVIATIONS, COMING_SOON_IMAGE } from "@/lib/constants";
import { useState, useEffect } from "react";
import { SeoHead } from "@/components/seo-head";

function getSecondsUntilNextUpdate() {
  const now = new Date();
  const etStr = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const [h, m, s] = etStr.split(":").map(Number);
  const currentSecs = h * 3600 + m * 60 + s;
  const targetSecs = 22 * 3600 + 55 * 60;
  let diff = targetSecs - currentSecs;
  if (diff <= 0) diff += 86400;
  return diff;
}

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function SpecRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
}

export default function CartDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [countdown, setCountdown] = useState(() => getSecondsUntilNextUpdate());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getSecondsUntilNextUpdate()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: slugMap, isLoading: slugMapLoading } = useQuery<SlugMap>({
    queryKey: ["/api/slug-map"],
  });

  const cartId = slugMap?.slugToId[slug || ""] || slug || "";

  const { data: cart, isLoading: cartLoading, error } = useQuery<Cart>({
    queryKey: ["/api/cart", cartId],
    enabled: !!cartId && !slugMapLoading,
  });

  const isLoading = slugMapLoading || cartLoading;

  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SeoHead title="Golf Cart for Sale | Alaska Golf Carts" description="Golf cart for sale at Alaska Golf Carts. 0% APR financing. Call 1-888-840-4490." />
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/3] rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <SeoHead title="Cart Not Found | Alaska Golf Carts" description="This golf cart may no longer be available. Browse our updated inventory at Alaska Golf Carts." canonical="https://alaskagolfcarts.com/inventory" />
        <h1 className="text-2xl font-bold mb-4">Cart Not Found</h1>
        <p className="text-muted-foreground mb-6">This vehicle may no longer be available.</p>
        <Link href="/inventory">
          <Button data-testid="button-back-inventory">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const make = cart.cartType?.make || "";
  const model = cart.cartType?.model || "";
  const color = cart.cartAttributes?.cartColor || "";
  const title = buildCartTitle(make, model, color);
  const numericPrice = cart.retailPrice || 0;
  const price = formatPrice(numericPrice);
  const isUsed = cart.isUsed === true;
  const isElectric = cart.isElectric === true;
  const isStreetLegal = cart.title?.isStreetLegal === true;
  const year = cart.cartType?.year || "";
  const passengers = cart.cartAttributes?.passengers || "";
  const images = getAllCartImages(cart);

  const detailTitle = `${isUsed ? "Used" : "New"} ${[year, make, model].filter(Boolean).join(" ")} Golf Cart for Sale | Alaska Golf Carts`;
  const detailDesc = `${isUsed ? "Used" : "New"} ${[year, make, model].filter(Boolean).join(" ")} golf cart${color ? ` in ${color}` : ""}${numericPrice ? ` for $${numericPrice.toLocaleString()}` : ""}. 0% APR financing at Alaska Golf Carts. Call 1-888-840-4490.`;
  const seoImageUrl = images[0] !== COMING_SOON_IMAGE ? images[0] : undefined;
  const vehicleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": [year, make, model, color].filter(Boolean).join(" ") || "Golf Cart",
    "fuelType": isElectric ? "Electric" : "Gasoline",
    "itemCondition": isUsed ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
    "url": `https://alaskagolfcarts.com/golfcart/${slug}`,
    "description": detailDesc,
  };
  if (make) vehicleSchema["brand"] = { "@type": "Brand", "name": make };
  if (model) vehicleSchema["model"] = model;
  if (year) vehicleSchema["vehicleModelDate"] = year;
  if (color) vehicleSchema["color"] = color;
  if (cart.vinNo) vehicleSchema["vehicleIdentificationNumber"] = cart.vinNo;
  if (seoImageUrl) vehicleSchema["image"] = seoImageUrl;
  const offersObj: Record<string, unknown> = {
    "@type": "Offer",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": `https://alaskagolfcarts.com/golfcart/${slug}`,
    "seller": { "@type": "AutoDealer", "name": "Alaska Golf Carts", "url": "https://alaskagolfcarts.com", "telephone": "1-888-840-4490" },
  };
  if (numericPrice > 0) offersObj["price"] = numericPrice;
  vehicleSchema["offers"] = offersObj;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <SeoHead
        title={detailTitle}
        description={detailDesc}
        canonical={`https://alaskagolfcarts.com/golfcart/${slug}`}
        ogImage={seoImageUrl}
        schema={vehicleSchema}
      />
      <div className="mb-6">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Inventory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-md bg-muted">
            <img
              src={images[selectedImage]}
              alt={title}
              className="w-full aspect-[4/3] object-cover"
              loading="eager"
              data-testid="img-cart-main"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <Badge variant={isUsed ? "secondary" : "default"}>
                {isUsed ? "Used" : "New"}
              </Badge>
              {isStreetLegal && (
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Street Legal
                </Badge>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-transparent"
                  }`}
                  data-testid={`button-thumb-${i}`}
                >
                  <img src={img} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {year && <span className="text-sm text-muted-foreground">{year}</span>}
            <h1 className="text-2xl sm:text-3xl font-bold mt-1" data-testid="text-cart-title">{title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {isElectric ? <Zap className="h-3 w-3 mr-1" /> : <Fuel className="h-3 w-3 mr-1" />}
              {isElectric ? "Electric" : "Gas"}
            </Badge>
            {passengers && (
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {passengers}
              </Badge>
            )}
            {cart.cartAttributes?.driveTrain && (
              <Badge variant="outline">{cart.cartAttributes.driveTrain}</Badge>
            )}
            {cart.cartAttributes?.isLifted && (
              <Badge variant="outline">Lifted</Badge>
            )}
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-md p-5 space-y-3">
            <p className="text-3xl font-bold text-primary" data-testid="text-cart-price">{price}</p>
            {numericPrice > 0 && (
              <div data-testid="text-financing-price">
                <p className="text-lg font-semibold">
                  As low as {formatPrice(numericPrice / 48)}/mo
                </p>
                <p className="text-sm text-muted-foreground">0% APR for 48 months</p>
              </div>
            )}
          </div>

          {/* Urgency / countdown banner */}
          <div className="rounded-lg border border-primary/40 bg-primary/5 overflow-hidden">
            <div className="bg-primary px-4 py-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-white shrink-0" />
              <span className="text-white text-xs font-bold uppercase tracking-wide">Don't Miss This Deal — Inventory Updates Soon!</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Next inventory update in</p>
                <p className="text-2xl font-extrabold tabular-nums text-primary tracking-tight leading-none mt-0.5" data-testid="text-countdown">
                  {formatCountdown(countdown)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">This cart could be gone.</p>
                <p className="text-xs text-muted-foreground">Call now to lock in your price!</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a href={PHONE_TEL} className="block">
              <Button className="w-full" size="lg" data-testid="button-call-now">
                <Phone className="h-5 w-5 mr-2" />
                Call Now - {PHONE_NUMBER}
              </Button>
            </a>
            <Link href="/financing">
              <Button variant="outline" className="w-full" size="lg" data-testid="button-apply-now">
                Apply Now - 0% Financing
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="specs" className="flex-1" data-testid="tab-specs">Specifications</TabsTrigger>
              <TabsTrigger value="battery" className="flex-1" data-testid="tab-battery">
                {isElectric ? "Battery" : "Engine"}
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1" data-testid="tab-details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-4">
              <Card className="p-4">
                <div className="divide-y">
                  {make && <SpecRow label="Make" value={make} />}
                  {model && <SpecRow label="Model" value={model} />}
                  {year && <SpecRow label="Year" value={year} icon={Calendar} />}
                  {color && <SpecRow label="Color" value={color} />}
                  {cart.cartAttributes?.seatColor && (
                    <SpecRow label="Seat Color" value={cart.cartAttributes.seatColor} />
                  )}
                  {passengers && <SpecRow label="Passengers" value={passengers} icon={Users} />}
                  {cart.cartAttributes?.driveTrain && (
                    <SpecRow label="Drivetrain" value={cart.cartAttributes.driveTrain} />
                  )}
                  {cart.cartAttributes?.tireType && (
                    <SpecRow label="Tires" value={cart.cartAttributes.tireType} />
                  )}
                  {cart.cartAttributes?.tireRimSize && (
                    <SpecRow label="Rim Size" value={`${cart.cartAttributes.tireRimSize}"`} />
                  )}
                  {isStreetLegal && <SpecRow label="Street Legal" value="Yes" icon={Shield} />}
                  {cart.cartAttributes?.hasSoundSystem !== null && cart.cartAttributes?.hasSoundSystem !== undefined && (
                    <SpecRow label="Sound System" value={cart.cartAttributes.hasSoundSystem ? "Yes" : "No"} />
                  )}
                  {cart.cartAttributes?.isLifted !== null && cart.cartAttributes?.isLifted !== undefined && (
                    <SpecRow label="Lift Kit" value={cart.cartAttributes.isLifted ? "Yes" : "No"} />
                  )}
                  {cart.cartAttributes?.hasHitch !== null && cart.cartAttributes?.hasHitch !== undefined && (
                    <SpecRow label="Receiver Hitch" value={cart.cartAttributes.hasHitch ? "Yes" : "No"} />
                  )}
                  {cart.cartAttributes?.hasExtendedTop !== null && cart.cartAttributes?.hasExtendedTop !== undefined && (
                    <SpecRow label="Extended Top" value={cart.cartAttributes.hasExtendedTop ? "Yes" : "No"} />
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="battery" className="mt-4">
              <Card className="p-4">
                <div className="divide-y">
                  {isElectric && cart.battery ? (
                    <>
                      {cart.battery.type && <SpecRow label="Battery Type" value={cart.battery.type} icon={Battery} />}
                      {cart.battery.brand && <SpecRow label="Brand" value={cart.battery.brand} />}
                      {cart.battery.year && <SpecRow label="Battery Year" value={cart.battery.year} />}
                      {cart.battery.ampHours && <SpecRow label="Capacity" value={`${cart.battery.ampHours} Ah`} />}
                      {cart.battery.packVoltage && <SpecRow label="Pack Voltage" value={`${cart.battery.packVoltage}V`} />}
                      {cart.battery.batteryVoltage && <SpecRow label="Cell Voltage" value={`${cart.battery.batteryVoltage}V`} />}
                      {cart.battery.warrantyLength && <SpecRow label="Battery Warranty" value={cart.battery.warrantyLength} icon={Wrench} />}
                    </>
                  ) : cart.engine ? (
                    <>
                      {cart.engine.make && <SpecRow label="Engine" value={cart.engine.make} />}
                      {cart.engine.horsepower && <SpecRow label="Horsepower" value={`${cart.engine.horsepower} HP`} />}
                      {cart.engine.stroke && <SpecRow label="Stroke" value={cart.engine.stroke} />}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No {isElectric ? "battery" : "engine"} information available.
                    </p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card className="p-4">
                <div className="divide-y">
                  <SpecRow label="Condition" value={isUsed ? "Used" : "New"} />
                  <SpecRow label="Power" value={isElectric ? "Electric" : "Gas"} icon={isElectric ? Zap : Fuel} />
                  {cart.vinNo && <SpecRow label="VIN" value={cart.vinNo} />}
                  {cart.serialNo && <SpecRow label="Serial Number" value={cart.serialNo} />}
                  {cart.odometer && <SpecRow label="Odometer" value={String(cart.odometer)} icon={Gauge} />}
                  {cart.hour && <SpecRow label="Hours" value={String(cart.hour)} icon={Clock} />}
                  {cart.warrantyLength && <SpecRow label="Warranty" value={cart.warrantyLength} icon={Wrench} />}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
