import { Link } from "wouter";
import { Phone, MapPin, Tag, Truck, Shield, Award } from "lucide-react";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import type { Store } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import logoImg from "@assets/DISCOUNTED_GOLF_CARTS_(2)_1770670989091.png";

export function Footer() {
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  return (
    <footer data-testid="footer">
      <div className="bg-primary text-primary-foreground py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-extrabold tracking-tight mb-1">Ready for Wholesale Prices?</h3>
              <p className="text-primary-foreground/80 text-sm">Our experts are standing by — call now for today's best deals.</p>
            </div>
            <a href={PHONE_TEL}>
              <div className="flex items-center gap-3 bg-white/15 border border-white/25 hover:bg-white/20 transition-colors rounded-md px-6 py-3 cursor-pointer">
                <Phone className="h-6 w-6" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">Call Now</div>
                  <div className="text-xl font-extrabold">{PHONE_NUMBER}</div>
                </div>
              </div>
            </a>
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
