import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, ChevronRight, Tag, Shield, MapPin, Truck, Award, RefreshCw, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import type { CartsResponse, Store } from "@shared/schema";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import heroBg from "@assets/DISCOUNTED_GOLF_CARTS_DEALERSHIP_1770671250863.png";

interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
}

const TICKER_ITEMS = [
  "🔥 WHOLESALE PRICES",
  "✦ NEW & USED INVENTORY",
  "🚗 NATIONWIDE DELIVERY",
  "⚡ ELECTRIC & GAS CARTS",
  "🏷️ UPDATED DAILY",
  "📞 CALL " + PHONE_NUMBER,
  "🔥 WHOLESALE PRICES",
  "✦ NEW & USED INVENTORY",
  "🚗 NATIONWIDE DELIVERY",
  "⚡ ELECTRIC & GAS CARTS",
  "🏷️ UPDATED DAILY",
  "📞 CALL " + PHONE_NUMBER,
];

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=8"],
  });

  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const { data: brands } = useQuery<Array<{ key: string; label: string }>>({
    queryKey: ["/api/brands"],
  });

  const { data: slugMap } = useQuery<SlugMap>({
    queryKey: ["/api/slug-map"],
  });

  return (
    <div>
      {/* Scrolling ticker */}
      <div className="bg-foreground text-background overflow-hidden py-2">
        <div className="flex ticker-animate whitespace-nowrap">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-6">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Discounted Golf Carts Showroom" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 relative w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded mb-5" data-testid="badge-hero-tag">
              <Tag className="h-3.5 w-3.5" />
              Wholesale Prices — Inventory Updated Daily
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 text-white" data-testid="text-hero-title">
              Discounted
              <span className="text-primary block">Golf Carts.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/75 max-w-lg mb-8 leading-relaxed" data-testid="text-hero-description">
              Browse wholesale-priced new and used golf carts from top brands —
              electric, gas, street legal, and more. Updated every day with the best deals.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/inventory">
                <Button size="lg" className="font-bold text-base px-6" data-testid="button-browse-inventory">
                  Browse Inventory
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <a href={PHONE_TEL}>
                <Button variant="outline" size="lg" className="font-bold text-base backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 px-6" data-testid="button-hero-call">
                  <Phone className="h-4 w-4 mr-2" />
                  {PHONE_NUMBER}
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: CheckCircle2, label: "No-Haggle Pricing" },
                { icon: Zap, label: "Electric & Gas" },
                { icon: Truck, label: "Ships Nationwide" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-white/70 text-sm">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props bar */}
      <section className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: RefreshCw, label: "Updated Daily", desc: "Inventory at 10:55 PM EST" },
              { icon: Shield, label: "Warranty Included", desc: "Coverage on all carts" },
              { icon: Award, label: "Top Brands", desc: "Denago, Evolution & more" },
              { icon: Truck, label: "Nationwide Delivery", desc: "We ship across the US" },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center gap-3 px-6 py-5 ${i % 2 === 0 && i >= 2 ? "md:border-none" : ""}`}>
                <div className="shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by brand */}
      {brands && brands.length > 0 && (
        <section className="py-12 border-b" data-testid="section-brands">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Browse by Make</p>
                <h2 className="text-2xl font-extrabold">Shop by Brand</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link key={brand.key} href={`/inventory?make=${encodeURIComponent(brand.label)}`}>
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-5 font-semibold hover:border-primary hover:text-primary transition-colors"
                    data-testid={`button-brand-${brand.key}`}
                  >
                    {brand.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured inventory */}
      <section className="py-12" data-testid="section-featured">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                {featured?.totalCarts ? `${featured.totalCarts.toLocaleString()} carts available` : "Fresh inventory"}
              </p>
              <h2 className="text-2xl font-extrabold">Latest Discounted Inventory</h2>
              <p className="text-sm text-muted-foreground mt-1">Wholesale prices updated daily — don't miss a deal</p>
            </div>
            <Link href="/inventory">
              <Button variant="outline" className="hidden sm:flex font-semibold" data-testid="button-view-all">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => <CartCardSkeleton key={i} />)
              : featured?.carts.map((cart) => <CartCard key={cart._id} cart={cart} slug={slugMap?.idToSlug[cart._id]} />)}
          </div>

          <div className="text-center mt-8">
            <Link href="/inventory">
              <Button size="lg" variant="outline" className="font-bold" data-testid="button-view-all-bottom">
                View All Discounted Inventory
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Locations */}
      {stores && stores.length > 0 && (
        <section className="py-12 bg-card border-t border-b" data-testid="section-locations">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Find Us</p>
              <h2 className="text-2xl font-extrabold">Our Locations</h2>
              <p className="text-sm text-muted-foreground mt-1">Visit us at one of our dealerships</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {stores.map((store) => (
                <div
                  key={store.storeId}
                  className="flex items-start gap-3 p-4 rounded-md border border-card-border bg-background hover:border-primary/40 transition-colors"
                  data-testid={`card-store-${store.storeId}`}
                >
                  <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm">{store.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {store.address.address1}
                      {store.address.address2 ? `, ${store.address.address2}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {store.address.city}, {store.address.state} {store.address.postalCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA strip */}
      <section className="py-16 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <Badge className="mb-3 bg-primary text-primary-foreground border-0 font-bold uppercase tracking-wide">
                <Tag className="h-3 w-3 mr-1" />
                Wholesale Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Find Your Discounted Golf Cart Today</h2>
              <p className="text-background/65 max-w-xl leading-relaxed">
                Our experts are standing by. Call now to hear about today's best wholesale prices,
                current inventory, and available financing options.
              </p>
            </div>
            <div className="shrink-0">
              <a href={PHONE_TEL}>
                <div className="flex items-center gap-4 bg-primary hover:bg-primary/90 transition-colors rounded-md px-8 py-5 cursor-pointer" data-testid="button-cta-call">
                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Call Now — Free Quote</div>
                    <div className="text-2xl font-extrabold text-white">{PHONE_NUMBER}</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
