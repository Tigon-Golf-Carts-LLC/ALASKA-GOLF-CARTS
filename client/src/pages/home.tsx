import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Phone, ChevronRight, Tag, Shield, MapPin, Truck, Award, RefreshCw, Zap, CheckCircle2, ChevronLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import type { CartsResponse, Store } from "@shared/schema";
import { PHONE_NUMBER, PHONE_TEL, formatPrice, getCartImageUrl, buildCartTitle } from "@/lib/constants";
import heroBg from "@assets/DISCOUNTED_GOLF_CARTS_DEALERSHIP_1770671250863.png";
import { useState, useEffect, useCallback, useMemo } from "react";

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

const SLIDE_INTERVAL = 5000;

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const slideItems = useMemo(() => {
    if (!featured?.carts?.length) return [];
    const shuffled = [...featured.carts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [featured?.carts]);

  const totalSlides = slideItems.length;

  const goTo = useCallback((index: number) => {
    setCurrentSlide(((index % totalSlides) + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const goPrev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  useEffect(() => {
    if (paused || totalSlides < 2) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, totalSlides, goNext]);

  const activeCart = slideItems[currentSlide];
  const activeCartUrl = activeCart
    ? slugMap?.idToSlug[activeCart._id]
      ? `/golfcart/${slugMap.idToSlug[activeCart._id]}`
      : `/golfcart/${activeCart._id}`
    : null;

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

      {/* Hero Carousel */}
      <section
        className="relative overflow-hidden min-h-[520px] sm:min-h-[620px] flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        data-testid="section-hero"
      >
        {/* Slide backgrounds */}
        {totalSlides === 0 ? (
          <div className="absolute inset-0">
            <img src={heroBg} alt="Discounted Golf Carts Showroom" className="w-full h-full object-cover" />
          </div>
        ) : (
          slideItems.map((cart, i) => {
            const imgUrl = imageErrors[cart._id]
              ? heroBg
              : getCartImageUrl(cart.imageUrls) || heroBg;
            return (
              <div
                key={cart._id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
              >
                <img
                  src={imgUrl}
                  alt={buildCartTitle(cart.cartType?.make || "", cart.cartType?.model || "", cart.cartAttributes?.cartColor || "")}
                  className="w-full h-full object-cover"
                  onError={() => setImageErrors(prev => ({ ...prev, [cart._id]: true }))}
                />
              </div>
            );
          })
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/60 to-black/20" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" style={{ zIndex: 2 }} />

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 relative w-full" style={{ zIndex: 3 }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">

            {/* Left: Headline */}
            <div className="max-w-xl">
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

              <div className="flex flex-wrap items-center gap-3 mb-8">
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

            {/* Right: Spotlight cart card */}
            {activeCart && (
              <div className="hidden lg:block shrink-0 w-[280px]">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-2xl">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2.5 z-10">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${activeCart.isUsed ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>
                        {activeCart.isUsed ? "Used" : "✦ New"}
                      </span>
                      <span className="text-[10px] font-bold bg-black/50 text-white px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                        {activeCart.isElectric ? <Zap className="h-3 w-3 text-yellow-400" /> : null}
                        {activeCart.isElectric ? "Electric" : "Gas"}
                      </span>
                    </div>
                    <img
                      src={imageErrors[activeCart._id] ? heroBg : (getCartImageUrl(activeCart.imageUrls) || heroBg)}
                      alt=""
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white leading-snug line-clamp-2 mb-2">
                      {buildCartTitle(activeCart.cartType?.make || "", activeCart.cartType?.model || "", activeCart.cartAttributes?.cartColor || "")}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-white/60 text-xs">
                      {activeCart.cartType?.year && <span>{activeCart.cartType.year}</span>}
                      {activeCart.cartAttributes?.passengers && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activeCart.cartAttributes.passengers} pass.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" /> Wholesale Price
                        </div>
                        <div className="text-xl font-extrabold text-primary">{formatPrice(activeCart.retailPrice)}</div>
                      </div>
                      {activeCartUrl && (
                        <Link href={activeCartUrl}>
                          <button className="text-xs font-bold text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                            View <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide controls */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white transition-colors"
              style={{ zIndex: 4 }}
              data-testid="button-hero-prev"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white transition-colors"
              style={{ zIndex: 4 }}
              data-testid="button-hero-next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 4 }}>
              {slideItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                  data-testid={`button-slide-dot-${i}`}
                />
              ))}
            </div>
          </>
        )}
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
