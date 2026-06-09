import { Link } from "wouter";
import { Phone, MapPin, Tag, Truck, Shield, Award, Flame, CreditCard } from "lucide-react";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import type { Store } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import logoImg from "@assets/discounted_golf_carts_(3)_1781021848486.png";

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
  return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") };
}

export function Footer() {
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const [countdown, setCountdown] = useState(() => getSecondsUntilNextUpdate());
  useEffect(() => {
    const id = setInterval(() => setCountdown(getSecondsUntilNextUpdate()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatCountdown(countdown);

  return (
    <footer data-testid="footer">
      <div className="bg-primary text-primary-foreground py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Countdown ticker */}
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-white/90 shrink-0" />
              <div className="flex items-center gap-2">
                {[{ val: h, label: "HRS" }, { val: m, label: "MIN" }, { val: s, label: "SEC" }].map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-2">
                    <div className="bg-black/30 border border-white/20 rounded-lg px-4 py-2 min-w-[64px] text-center">
                      <div className="text-4xl font-black tabular-nums leading-none">{unit.val}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 mt-1">{unit.label}</div>
                    </div>
                    {i < 2 && <span className="text-3xl font-black text-white/60 -mt-3">:</span>}
                  </div>
                ))}
              </div>
              <Flame className="h-6 w-6 text-white/90 shrink-0" />
            </div>
            <div className="-mt-3">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Get These Deals Before They're Gone!</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">Inventory And Prices Update Daily — These Prices Are Only Good Until The Timer Runs Out. Act now.</p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a href={PHONE_TEL} data-testid="button-footer-call">
                <div className="flex items-center gap-3 bg-white text-primary rounded-lg px-6 py-3 cursor-pointer hover:bg-white/90 transition-colors font-extrabold text-base shadow-lg">
                  <Phone className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60 leading-none">Call Now</div>
                    <div className="text-lg font-black leading-tight">{PHONE_NUMBER}</div>
                  </div>
                </div>
              </a>
              <Link href="/financing" data-testid="button-footer-financing">
                <div className="flex items-center gap-3 bg-black/30 border border-white/25 hover:bg-black/40 transition-colors rounded-lg px-6 py-3 cursor-pointer font-bold text-base">
                  <CreditCard className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 leading-none">0% APR Available</div>
                    <div className="text-base font-extrabold leading-tight">Apply for Financing</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b bg-muted/40 py-3">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Tag, label: "Wholesale Prices" },
              { icon: Truck, label: "Nationwide Delivery" },
              { icon: Shield, label: "Warranty Included" },
              { icon: Award, label: "Top Brands" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-card border-t">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="Discounted Golf Carts" className="h-9 w-9 object-contain" />
                <span className="text-base font-extrabold">Discounted <span className="text-primary">Golf Carts</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wholesale prices on new and used golf carts. Top brands, updated daily, with locations across the East Coast.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-home">Home</Link>
                <Link href="/inventory" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-inventory">All Inventory</Link>
                <Link href="/inventory?isNew=true" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-new">New Carts</Link>
                <Link href="/inventory?isUsed=true" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-used">Used Carts</Link>
                <Link href="/financing" className="block text-sm font-medium hover:text-primary transition-colors">Financing</Link>
                <Link href="/service-area" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-locations">All Locations</Link>
                <Link href="/faq" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-faq">FAQ</Link>
                <Link href="/about" className="block text-sm font-medium hover:text-primary transition-colors" data-testid="link-footer-about">About</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Locations</h3>
              <div className="space-y-2">
                {stores?.slice(0, 6).map((store) => (
                  <div key={store.storeId} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>{store.address.city}, {store.address.state}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact</h3>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center gap-2 text-primary font-extrabold text-lg hover:opacity-80 transition-opacity"
                data-testid="link-footer-phone"
              >
                <Phone className="h-5 w-5" />
                {PHONE_NUMBER}
              </a>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Call today for our latest wholesale pricing and current specials.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Discounted Golf Carts. All rights reserved. | discountedgolfcart.com</p>
        </div>
      </div>
    </footer>
  );
}
