import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Phone, ChevronRight, Tag, Shield, MapPin, Truck, Award, RefreshCw, Zap, CheckCircle2, ChevronLeft, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import type { CartsResponse, Store } from "@shared/schema";
import { PHONE_NUMBER, PHONE_TEL, formatPrice, getCartImageUrl, buildCartTitle } from "@/lib/constants";
import heroBg from "@assets/DISCOUNTED_GOLF_CARTS_DEALERSHIP_1770671250863.png";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

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

const SLIDE_INTERVAL = 4500;
const CARD_W = 248;

type CardConfig = { x: number; y: number; scale: number; opacity: number; z: number };

const CONFIGS: Record<number, CardConfig> = {
  [-2]: { x: -490, y: 50, scale: 0.60, opacity: 0.30, z: 10 },
  [-1]: { x: -255, y: 18, scale: 0.80, opacity: 0.62, z: 30 },
  [0]:  { x: 0,    y: -24, scale: 1.10, opacity: 1.00, z: 50 },
  [1]:  { x: 255,  y: 18, scale: 0.80, opacity: 0.62, z: 30 },
  [2]:  { x: 490,  y: 50, scale: 0.60, opacity: 0.30, z: 10 },
};

function getOffset(cartIdx: number, current: number, total: number) {
  let off = cartIdx - current;
  if (off > total / 2)  off -= total;
  if (off < -total / 2) off += total;
  return off;
}

export default function Home() {
  const [, navigate] = useLocation();

  const { data: featured, isLoading: featuredLoading } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=12"],
  });

  const { data: newCarts } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=6&isNew=true"],
  });

  const { data: usedCarts } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=6&isUsed=true"],
  });

  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: brands } = useQuery<Array<{ key: string; label: string }>>({ queryKey: ["/api/brands"] });
  const { data: slugMap } = useQuery<SlugMap>({ queryKey: ["/api/slug-map"] });

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const wasDragging = useRef(false);

  const slides = useMemo(() => {
    const newList = newCarts?.carts ?? [];
    const usedList = usedCarts?.carts ?? [];
    if (!newList.length && !usedList.length) {
      if (!featured?.carts?.length) return [];
      return [...featured.carts].sort(() => Math.random() - 0.5).slice(0, 10);
    }
    const shuffledNew = [...newList].sort(() => Math.random() - 0.5).slice(0, 5);
    const shuffledUsed = [...usedList].sort(() => Math.random() - 0.5).slice(0, 5);
    const mixed: typeof shuffledNew = [];
    const maxLen = Math.max(shuffledNew.length, shuffledUsed.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < shuffledNew.length) mixed.push(shuffledNew[i]);
      if (i < shuffledUsed.length) mixed.push(shuffledUsed[i]);
    }
    return mixed.slice(0, 10);
  }, [newCarts?.carts, usedCarts?.carts, featured?.carts]);

  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % (total || 1)) + (total || 1)) % (total || 1));
  }, [total]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [paused, total, goNext]);

  const cartUrl = (cart: typeof slides[0]) =>
    slugMap?.idToSlug[cart._id] ? `/golfcart/${slugMap.idToSlug[cart._id]}` : `/golfcart/${cart._id}`;

  const imgUrl = (cart: typeof slides[0]) =>
    imgErrors[cart._id] ? heroBg : (getCartImageUrl(cart.imageUrls) || heroBg);

  const activeCart = slides[current];

  return (
    <div>
      {/* Ticker */}
      <div className="bg-foreground text-background overflow-hidden py-2 shrink-0">
        <div className="flex ticker-animate whitespace-nowrap">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-6">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════  HERO COVERFLOW  ═══════════════ */}
      <section
        className="relative overflow-hidden flex flex-col"
        style={{ minHeight: 720, background: '#07090f', cursor: dragStartX.current !== null ? 'grabbing' : 'grab' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          if (dragStartX.current !== null) {
            if (Math.abs(dragDelta.current) > 40) dragDelta.current > 0 ? goNext() : goPrev();
            dragStartX.current = null;
            dragDelta.current = 0;
          }
        }}
        onMouseDown={(e) => { dragStartX.current = e.clientX; dragDelta.current = 0; wasDragging.current = false; }}
        onMouseMove={(e) => {
          if (dragStartX.current === null) return;
          dragDelta.current = dragStartX.current - e.clientX;
          if (Math.abs(dragDelta.current) > 8) wasDragging.current = true;
        }}
        onMouseUp={() => {
          if (dragStartX.current === null) return;
          if (Math.abs(dragDelta.current) > 40) dragDelta.current > 0 ? goNext() : goPrev();
          dragStartX.current = null;
          dragDelta.current = 0;
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; wasDragging.current = false; }}
        onTouchMove={(e) => {
          if (touchStartX.current === null) return;
          if (Math.abs(touchStartX.current - e.touches[0].clientX) > 8) wasDragging.current = true;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
          touchStartX.current = null;
        }}
        data-testid="section-hero"
      >
        {/* BG */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center pt-12 pb-6 px-4">
          <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <Flame className="h-3.5 w-3.5" />
            Wholesale Prices — Inventory Updated Daily
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.0] mb-3">
            Discounted <span className="text-primary">Golf Carts.</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto">
            {featured?.totalCarts
              ? `${featured.totalCarts.toLocaleString()} wholesale-priced carts — new and used — updated every day.`
              : "Browse wholesale-priced new and used carts, updated every day."}
          </p>
        </div>

        {/* ── Coverflow Stage ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          {total === 0 ? (
            <div className="flex gap-4 py-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10" style={{ width: CARD_W, height: 360 }} />
              ))}
            </div>
          ) : (
            <div
              className="relative w-full flex items-center justify-center"
              style={{ height: 420 }}
            >
              {slides.map((cart, i) => {
                const off = getOffset(i, current, total);
                const cfg = CONFIGS[off];
                if (!cfg) return null;
                const isCenter = off === 0;
                const isUsed = cart.isUsed === true;
                const title = buildCartTitle(cart.cartType?.make || "", cart.cartType?.model || "", cart.cartAttributes?.cartColor || "");
                const price = formatPrice(cart.retailPrice);

                return (
                  <div
                    key={cart._id}
                    className="absolute select-none"
                    style={{
                      width: CARD_W,
                      left: `calc(50% - ${CARD_W / 2}px)`,
                      transform: `translateX(${cfg.x}px) translateY(${cfg.y}px) scale(${cfg.scale})`,
                      opacity: cfg.opacity,
                      zIndex: cfg.z,
                      transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease',
                      cursor: isCenter ? 'pointer' : 'pointer',
                    }}
                    onClick={() => { if (wasDragging.current) return; isCenter ? navigate(cartUrl(cart)) : goTo(i); }}
                    data-testid={`slide-card-${cart._id}`}
                  >
                    <div
                      className={`rounded-xl overflow-hidden flex flex-col ${isCenter ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(255,60,40,0.4)]' : 'shadow-xl'}`}
                      style={{ background: '#111418' }}
                    >
                      {/* Condition banner */}
                      <div className={`py-2 text-center font-black text-xs uppercase tracking-[0.2em] ${isUsed ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {isUsed ? '★ PRE-OWNED' : '✦ BRAND NEW'}
                      </div>

                      {/* Image */}
                      <div className="relative overflow-hidden" style={{ height: 160 }}>
                        <img
                          src={imgUrl(cart)}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={() => setImgErrors(prev => ({ ...prev, [cart._id]: true }))}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {isCenter && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm rotate-1 shadow-lg">
                            🔥 Hot Deal
                          </div>
                        )}
                        {cart.isElectric && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            <Zap className="h-2.5 w-2.5" /> Electric
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3.5 flex-1 flex flex-col">
                        <h3 className="font-bold text-xs text-white/90 line-clamp-2 leading-snug mb-1.5">{title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 mb-3">
                          {cart.cartType?.year && <span>{cart.cartType.year}</span>}
                          {cart.cartAttributes?.passengers && (
                            <span className="flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5" /> {cart.cartAttributes.passengers} Pass.
                            </span>
                          )}
                        </div>

                        {/* PRICE — front and center */}
                        <div className="mt-auto">
                          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-primary/70 flex items-center gap-1 mb-0.5">
                            <Tag className="h-2.5 w-2.5" /> WHOLESALE PRICE
                          </div>
                          <div className="text-3xl font-black text-primary leading-none" data-testid={`text-hero-price-${cart._id}`}>
                            {price}
                          </div>
                        </div>

                        {/* Center card CTAs */}
                        {isCenter && (
                          <div className="flex gap-2 mt-3">
                            <Link
                              href={cartUrl(cart)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px] font-bold h-8 px-3 border-white/20 text-white hover:bg-white/10"
                                data-testid={`button-view-cart-${cart._id}`}
                              >
                                View Details
                              </Button>
                            </Link>
                            <a href={PHONE_TEL} onClick={(e) => e.stopPropagation()} className="flex-1">
                              <Button
                                size="sm"
                                className="w-full text-[11px] font-black h-8"
                                data-testid={`button-call-hero-${cart._id}`}
                              >
                                <Phone className="h-3 w-3 mr-1" /> Call Now
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-black/50 hover:bg-primary/80 border border-white/15 flex items-center justify-center text-white transition-all"
                data-testid="button-hero-prev"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-black/50 hover:bg-primary/80 border border-white/15 flex items-center justify-center text-white transition-all"
                data-testid="button-hero-next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots + CTAs */}
        <div className="relative z-10 flex flex-col items-center gap-5 py-8 px-4">
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/25 hover:bg-white/50'}`}
                  data-testid={`button-dot-${i}`}
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/inventory">
              <Button size="lg" className="font-black text-sm px-7 shadow-lg" data-testid="button-browse-inventory">
                Browse All Inventory
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href={PHONE_TEL}>
              <Button
                variant="outline"
                size="lg"
                className="font-bold text-sm backdrop-blur-sm bg-white/8 border-white/25 text-white hover:bg-white/15 px-7"
                data-testid="button-hero-call"
              >
                <Phone className="h-4 w-4 mr-2" />
                {PHONE_NUMBER}
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { icon: CheckCircle2, label: "No-Haggle Pricing" },
              { icon: Zap, label: "Electric & Gas" },
              { icon: Truck, label: "Ships Nationwide" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-white/50 text-xs">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
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
              <div key={item.label} className={`flex items-center gap-3 px-4 sm:px-6 py-5 ${i % 2 === 0 && i >= 2 ? "md:border-none" : ""}`}>
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
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Browse by Make</p>
              <h2 className="text-2xl font-extrabold">Shop by Brand</h2>
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
                View All <ChevronRight className="h-4 w-4 ml-1" />
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
                View All Discounted Inventory <ChevronRight className="h-4 w-4 ml-1" />
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
                      {store.address.address1}{store.address.address2 ? `, ${store.address.address2}` : ""}
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
                <Tag className="h-3 w-3 mr-1" /> Wholesale Pricing
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
