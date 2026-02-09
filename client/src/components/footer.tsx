import { Link } from "wouter";
import { Phone, MapPin, ShoppingCart } from "lucide-react";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
import type { Store } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function Footer() {
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  return (
    <footer className="border-t bg-card" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">TIGON <span className="text-primary">USA</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your premier destination for new and used golf carts. We carry top brands and offer
              competitive pricing with locations across the East Coast.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-home">
                Home
              </Link>
              <Link href="/inventory" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-inventory">
                All Inventory
              </Link>
              <Link href="/inventory?isNew=true" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-new">
                New Carts
              </Link>
              <Link href="/inventory?isUsed=true" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-used">
                Used Carts
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Locations</h3>
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
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:opacity-80 transition-opacity"
              data-testid="link-footer-phone"
            >
              <Phone className="h-5 w-5" />
              {PHONE_NUMBER}
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Call us today to learn more about our inventory and current specials.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TIGON USA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
