import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Phone, ChevronRight, Tag, Shield, MapPin, Truck, Award, RefreshCw, Zap, CheckCircle2, ChevronLeft, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import type { CartsResponse, Store } from "@shared/schema";
import { PHONE_NUMBER, PHONE_TEL, formatPrice, getCartImageUrl, buildCartTitle } from "@/lib/constants";
import heroBg from "@assets/generated_images/golf_cart_showroom_hero.png";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
}

const TICKER_ITEMS = [
  "🔥 GOLF CARTS FOR SALE",
  "✦ NEW & USED INVENTORY",
  "⚡ ELECTRIC GOLF CARTS",
  "🏌️ STREET-LEGAL LSV IN STOCK",
  "🚗 NATIONWIDE DELIVERY",
  "🏷️ PRICES UPDATED DAILY",
  "📞 CALL " + PHONE_NUMBER,
  "🔥 GOLF CARTS FOR SALE",
  "✦ NEW & USED INVENTORY",
  "⚡ ELECTRIC GOLF CARTS",
  "🏌️ STREET-LEGAL LSV IN STOCK",
  "🚗 NATIONWIDE DELIVERY",
  "🏷️ PRICES UPDATED DAILY",
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

const BRAND_CARD_W_D = 148;
const BRAND_CARD_W_M = 148;
const BRAND_D_CONFIGS: Record<number, CardConfig> = {
  [-2]: { x: -298, y: 30, scale: 0.60, opacity: 0.22, z: 10 },
  [-1]: { x: -164, y: 10, scale: 0.82, opacity: 0.58, z: 30 },
  [0]:  { x: 0,    y: -20, scale: 1.15, opacity: 1.00, z: 50 },
  [1]:  { x: 164,  y: 10, scale: 0.82, opacity: 0.58, z: 30 },
  [2]:  { x: 298,  y: 30, scale: 0.60, opacity: 0.22, z: 10 },
};
const BRAND_M_CONFIGS: Record<number, CardConfig> = {
  [-1]: { x: -164, y: 10, scale: 0.82, opacity: 0.55, z: 30 },
  [0]:  { x: 0,    y: -20, scale: 1.15, opacity: 1.00, z: 50 },
  [1]:  { x: 164,  y: 10, scale: 0.82, opacity: 0.55, z: 30 },
};

function BrandCarousel({ brands }: { brands: Array<{ key: string; label: string }> }) {
  const [current, setCurrent] = useState(0);
  const wasDragging = useRef(false);
  const dragStart = useRef<number | null>(null);
  const isDesktop = useIsDesktop();
  const total = brands.length;
  const BRAND_CARD_W = isDesktop ? BRAND_CARD_W_D : BRAND_CARD_W_M;
  const BRAND_CONFIGS = isDesktop ? BRAND_D_CONFIGS : BRAND_M_CONFIGS;

  const goTo = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(goNext, 3200);
    return () => clearInterval(t);
  }, [goNext]);

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; wasDragging.current = false; };
  const onPointerMove = (e: React.PointerEvent) => { if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 8) wasDragging.current = true; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const diff = e.clientX - dragStart.current;
    if (Math.abs(diff) > 40) diff < 0 ? goNext() : goPrev();
    dragStart.current = null;
  };

  return (
    <div className="relative select-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ touchAction: 'none' }}>
      <div className="relative w-full flex items-center justify-center" style={{ height: 210 }}>
        {brands.map((brand, i) => {
          const off = getOffset(i, current, total);
          const cfg = BRAND_CONFIGS[off];
          if (!cfg) return null;
          const isCenter = off === 0;
          return (
            <Link
              key={brand.key}
              href={`/inventory?make=${encodeURIComponent(brand.label)}`}
              className="absolute cursor-pointer"
              style={{
                width: BRAND_CARD_W,
                left: `calc(50% - ${BRAND_CARD_W / 2}px)`,
                transform: `translateX(${cfg.x}px) translateY(${cfg.y}px) scale(${cfg.scale})`,
                opacity: cfg.opacity,
                zIndex: cfg.z,
                transition: 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.42s ease',
              }}
              onClick={(e) => {
                if (wasDragging.current) { e.preventDefault(); return; }
                if (!isCenter) { e.preventDefault(); goTo(i); }
              }}
              data-testid={`brand-card-${brand.key}`}
            >
              <div
                className={`rounded-2xl overflow-hidden flex flex-col bg-background dark:bg-white border border-border ${isCenter ? 'ring-2 ring-primary shadow-[0_0_32px_rgba(220,38,38,0.35)]' : ''}`}
                style={{ height: 172 }}
              >
                <div className={`h-1.5 w-full ${isCenter ? 'bg-primary' : 'bg-foreground/10 dark:bg-gray-200'}`} />
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative overflow-hidden">
                  <span className="absolute text-[80px] font-black leading-none select-none pointer-events-none text-foreground/[0.04] dark:text-gray-900/5" aria-hidden>
                    {brand.label.charAt(0)}
                  </span>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 ${isCenter ? 'bg-primary/20' : 'bg-foreground/8 dark:bg-gray-100'}`}>
                    <Tag className={`h-5 w-5 ${isCenter ? 'text-primary' : 'text-foreground/40 dark:text-gray-400'}`} />
                  </div>
                  <span className={`font-black text-[13px] text-center leading-tight mb-1 ${isCenter ? 'text-foreground dark:text-gray-900' : 'text-foreground/60 dark:text-gray-600'}`}>{brand.label}</span>
                  {isCenter && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-0.5 mt-1">
                      Shop Now <ChevronRight className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-2 sm:left-6 top-[45%] -translate-y-1/2 z-[60] w-9 h-9 rounded-full bg-background/80 hover:bg-primary/80 hover:text-white border border-border flex items-center justify-center text-foreground transition-all shadow-sm" data-testid="button-brand-prev">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-2 sm:right-6 top-[45%] -translate-y-1/2 z-[60] w-9 h-9 rounded-full bg-background/80 hover:bg-primary/80 hover:text-white border border-border flex items-center justify-center text-foreground transition-all shadow-sm" data-testid="button-brand-next">
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {brands.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-foreground/25 hover:bg-foreground/45'}`} data-testid={`button-brand-dot-${i}`} />
        ))}
      </div>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isDesktop;
}

const INV_DESKTOP_W = 258;
const INV_MOBILE_W  = 208;
const INV_D_CONFIGS: Record<number, CardConfig> = {
  [-2]: { x: -554, y: 36, scale: 0.64, opacity: 0.26, z: 10 },
  [-1]: { x: -288, y: 14, scale: 0.84, opacity: 0.62, z: 30 },
  [0]:  { x: 0,    y: -20, scale: 1.08, opacity: 1.00, z: 50 },
  [1]:  { x: 288,  y: 14, scale: 0.84, opacity: 0.62, z: 30 },
  [2]:  { x: 554,  y: 36, scale: 0.64, opacity: 0.26, z: 10 },
};
const INV_M_CONFIGS: Record<number, CardConfig> = {
  [-1]: { x: -220, y: 10, scale: 0.80, opacity: 0.52, z: 30 },
  [0]:  { x: 0,    y: -14, scale: 1.10, opacity: 1.00, z: 50 },
  [1]:  { x: 220,  y: 10, scale: 0.80, opacity: 0.52, z: 30 },
};

function InventoryCarousel({ carts, slugMap }: { carts: CartsResponse['carts']; slugMap?: SlugMap }) {
  const [current, setCurrent] = useState(0);
  const wasDragging = useRef(false);
  const dragStart  = useRef<number | null>(null);
  const isDesktop  = useIsDesktop();
  const total      = carts.length;
  const CW         = isDesktop ? INV_DESKTOP_W : INV_MOBILE_W;
  const CFGS       = isDesktop ? INV_D_CONFIGS : INV_M_CONFIGS;
  const HEIGHT     = isDesktop ? 480 : 420;

  const goTo   = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => { const t = setInterval(goNext, 5000); return () => clearInterval(t); }, [goNext]);

  const onPD = (e: React.PointerEvent) => { dragStart.current = e.clientX; wasDragging.current = false; };
  const onPM = (e: React.PointerEvent) => { if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 8) wasDragging.current = true; };
  const onPU = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const d = e.clientX - dragStart.current;
    if (Math.abs(d) > 40) d < 0 ? goNext() : goPrev();
    dragStart.current = null;
  };

  const cartUrl = (c: CartsResponse['carts'][0]) =>
    slugMap?.idToSlug[c._id] ? `/golfcart/${slugMap.idToSlug[c._id]}` : `/golfcart/${c._id}`;

  return (
    <div className="relative select-none" onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} style={{ touchAction: 'none' }}>
      <div className="relative w-full flex items-center justify-center" style={{ height: HEIGHT }}>
        {carts.map((cart, i) => {
          const off  = getOffset(i, current, total);
          const cfg  = CFGS[off];
          if (!cfg) return null;
          const isCenter = off === 0;
          return (
            <div
              key={cart._id}
              className="absolute"
              style={{
                width: CW,
                left: `calc(50% - ${CW / 2}px)`,
                transform: `translateX(${cfg.x}px) translateY(${cfg.y}px) scale(${cfg.scale})`,
                opacity: cfg.opacity,
                zIndex: cfg.z,
                transition: 'transform 0.44s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.44s ease',
              }}
              data-testid={`inv-card-${cart._id}`}
            >
              {!isCenter && (
                <Link
                  href={cartUrl(cart)}
                  className="absolute inset-0 z-10 cursor-pointer rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wasDragging.current) { e.preventDefault(); return; }
                    e.preventDefault();
                    goTo(i);
                  }}
                  data-testid={`inv-card-link-${cart._id}`}
                />
              )}
              <div className={isCenter ? 'ring-2 ring-primary rounded-xl shadow-[0_0_36px_rgba(220,38,38,0.35)] cursor-pointer' : 'rounded-xl'}>
                <CartCard cart={cart} slug={slugMap?.idToSlug[cart._id]} />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-2 sm:left-4 top-[44%] -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-background/85 hover:bg-primary/80 hover:text-white border border-border flex items-center justify-center text-foreground transition-all shadow-md" data-testid="button-inv-prev">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-2 sm:right-4 top-[44%] -translate-y-1/2 z-[60] w-10 h-10 rounded-full bg-background/85 hover:bg-primary/80 hover:text-white border border-border flex items-center justify-center text-foreground transition-all shadow-md" data-testid="button-inv-next">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {carts.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-foreground/25 hover:bg-foreground/45'}`} data-testid={`button-inv-dot-${i}`} />
        ))}
      </div>
    </div>
  );
}

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

export default function Home() {
  const [countdown, setCountdown] = useState(() => getSecondsUntilNextUpdate());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getSecondsUntilNextUpdate()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: featured, isLoading: featuredLoading } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=12"],
  });

  const { data: newCarts, isLoading: newCartsLoading } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=10&isNew=true"],
  });

  const { data: usedCarts, isLoading: usedCartsLoading } = useQuery<CartsResponse>({
    queryKey: ["/api/carts?pageNumber=0&pageSize=10&isUsed=true"],
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
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center pt-12 pb-6 px-4">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] mb-3">
            Golf Carts<br /><span className="text-primary">For Sale.</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto">
            New &amp; used electric golf carts, street-legal LSVs, and lifted carts — great pricing updated nightly, delivered across Florida.
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
                      cursor: 'pointer',
                    }}
                    data-testid={`slide-card-${cart._id}`}
                  >
                    <div
                      className={`rounded-xl overflow-hidden flex flex-col ${isCenter ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(255,60,40,0.4)]' : 'shadow-xl'}`}
                      style={{ background: '#111418' }}
                    >
                      <Link
                        href={cartUrl(cart)}
                        className="contents"
                        onClick={(e) => {
                          if (wasDragging.current) { e.preventDefault(); return; }
                          if (!isCenter) { e.preventDefault(); goTo(i); }
                        }}
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
                              <Tag className="h-2.5 w-2.5" /> GREAT PRICE
                            </div>
                            <div className="text-3xl font-black text-primary leading-none" data-testid={`text-hero-price-${cart._id}`}>
                              {price}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Center card CTAs */}
                      {isCenter && (
                        <div className="flex gap-2 px-3.5 pb-3.5">
                          <Link href={cartUrl(cart)}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] font-bold h-8 px-3 border-white/20 text-white hover:bg-white/10"
                              data-testid={`button-view-cart-${cart._id}`}
                            >
                              View Details
                            </Button>
                          </Link>
                          <a href={PHONE_TEL} className="flex-1">
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
          {/* Countdown ticker */}
          <div className="inline-flex flex-col items-center gap-1 bg-black/50 border border-primary/40 backdrop-blur-sm rounded-xl px-5 py-3">
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-white text-[11px] font-black uppercase tracking-widest">Get These Deals Before They're Gone!</span>
              <Flame className="h-3.5 w-3.5 text-primary shrink-0" />
            </div>
            <div className="flex items-center gap-1.5">
              {(() => {
                const secs = countdown;
                const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
                const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
                const ss = String(secs % 60).padStart(2, "0");
                return [{ val: hh, label: "HRS" }, { val: mm, label: "MIN" }, { val: ss, label: "SEC" }].map((u, i) => (
                  <div key={u.label} className="flex items-center gap-1.5">
                    <div className="bg-primary/20 border border-primary/30 rounded px-2 py-0.5 min-w-[36px] text-center">
                      <div className="text-lg font-black tabular-nums text-white leading-none">{u.val}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-white/50">{u.label}</div>
                    </div>
                    {i < 2 && <span className="text-primary font-black text-base -mt-2">:</span>}
                  </div>
                ));
              })()}
            </div>
          </div>
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
              { icon: Zap, label: "Electric & Gas Golf Carts" },
              { icon: Truck, label: "Nationwide Delivery Available" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-white text-xs">
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
              { icon: RefreshCw, label: "Inventory Updated Daily", desc: "Prices & carts refreshed nightly at 10:55 PM ET" },
              { icon: Shield, label: "Warranty Included", desc: "Factory warranty on all new golf carts" },
              { icon: Award, label: "13 Authorized Brands", desc: "Club Car, EZGO, Yamaha, Denago & more" },
              { icon: Truck, label: "Nationwide Delivery", desc: "We deliver golf carts to all 50 states" },
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
        <section className="py-12 border-b bg-card" data-testid="section-brands">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Shop by Brand</p>
                <h2 className="text-2xl font-extrabold">New &amp; Used Golf Carts by Brand</h2>
                <p className="text-sm text-muted-foreground mt-1">13 authorized brands — click a brand to browse current inventory</p>
              </div>
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="font-semibold shrink-0" data-testid="button-all-brands">
                  All Brands <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <BrandCarousel brands={brands} />
          </div>
        </section>
      )}

      {/* Urgency countdown banner */}
      <section className="bg-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2 shrink-0">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide">Don't Miss These Golf Cart Deals!</p>
              <p className="text-xs text-muted-foreground">Golf cart prices update nightly — call now to lock in today's great price before inventory changes.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next Update In</p>
              <p className="text-3xl font-extrabold tabular-nums text-primary leading-none">{formatCountdown(countdown)}</p>
            </div>
            <a href={PHONE_TEL}>
              <Button size="lg" className="font-bold whitespace-nowrap" data-testid="button-urgency-call">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* New carts carousel */}
      <section className="py-12" data-testid="section-new-carts">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                ✦ Brand New Golf Carts for Sale
              </p>
              <h2 className="text-2xl font-extrabold">New Golf Carts for Sale</h2>
              <p className="text-sm text-muted-foreground mt-1">Factory-fresh inventory from 13 authorized brands — MSRP pricing</p>
            </div>
            <Link href="/inventory?condition=new">
              <Button variant="outline" className="hidden sm:flex font-semibold" data-testid="button-view-all-new">
                View All New <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {newCartsLoading ? (
            <div className="flex gap-4 justify-center py-8">
              {Array.from({ length: 3 }).map((_, i) => <CartCardSkeleton key={i} />)}
            </div>
          ) : newCarts?.carts && newCarts.carts.length > 0 ? (
            <InventoryCarousel carts={newCarts.carts} slugMap={slugMap} />
          ) : null}

          <div className="text-center mt-6">
            <Link href="/inventory?condition=new">
              <Button size="lg" variant="outline" className="font-bold" data-testid="button-view-all-new-bottom">
                Browse All New Golf Carts for Sale <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pre-owned carts carousel */}
      <section className="py-12 bg-card border-t" data-testid="section-used-carts">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                ★ Used Golf Carts for Sale
              </p>
              <h2 className="text-2xl font-extrabold">Used &amp; Pre-Owned Golf Carts for Sale</h2>
              <p className="text-sm text-muted-foreground mt-1">Inspected pre-owned carts — click any cart to see full specs and price</p>
            </div>
            <Link href="/inventory?condition=used">
              <Button variant="outline" className="hidden sm:flex font-semibold" data-testid="button-view-all-used">
                View All Used <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {usedCartsLoading ? (
            <div className="flex gap-4 justify-center py-8">
              {Array.from({ length: 3 }).map((_, i) => <CartCardSkeleton key={i} />)}
            </div>
          ) : usedCarts?.carts && usedCarts.carts.length > 0 ? (
            <InventoryCarousel carts={usedCarts.carts} slugMap={slugMap} />
          ) : null}

          <div className="text-center mt-6">
            <Link href="/inventory?condition=used">
              <Button size="lg" variant="outline" className="font-bold" data-testid="button-view-all-used-bottom">
                Browse All Used Golf Carts for Sale <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-12 bg-card border-t border-b" data-testid="section-locations">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Serving All of Florida</p>
            <h2 className="text-2xl font-extrabold">Florida's Golf Cart Dealer — Statewide Delivery</h2>
            <p className="text-sm text-muted-foreground mt-1">All 67 Florida counties — from the Panhandle to the Keys, delivered to your door</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Miami-Dade", "Broward", "Palm Beach", "Hillsborough",
              "Orange", "Duval", "Pinellas", "Lee",
              "Polk", "Brevard", "Volusia", "Sarasota"
            ].map((county) => (
              <div
                key={county}
                className="flex items-center gap-3 p-4 rounded-md border border-card-border bg-background hover:border-primary/40 transition-colors"
                data-testid={`card-county-${county.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm">{county} County</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Golf cart delivery available</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/service-area">
              <Button size="lg" variant="outline" className="font-bold" data-testid="button-view-service-area">
                View Full Service Area <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-16 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <Badge className="mb-3 bg-primary text-primary-foreground border-0 font-bold uppercase tracking-wide">
                <Tag className="h-3 w-3 mr-1" /> Great Golf Cart Prices
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Golf Carts for Sale — Best Prices in Florida</h2>
              <p className="text-background/65 max-w-xl leading-relaxed">
                Our team is standing by. Call now for today's best price on any cart in stock — new golf carts, used golf carts, electric carts, street-legal LSVs, and lifted models. 0% APR financing available on qualifying purchases.
              </p>
            </div>
            <div className="shrink-0">
              <a href={PHONE_TEL}>
                <div className="flex items-center gap-4 bg-primary hover:bg-primary/90 transition-colors rounded-md px-8 py-5 cursor-pointer" data-testid="button-cta-call">
                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Call Now — Free Golf Cart Quote</div>
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
