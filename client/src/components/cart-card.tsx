import { Link } from "wouter";
import { Phone, Zap, Fuel, Shield, Users, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cart } from "@shared/schema";
import { formatPrice, getCartImageUrl, buildCartTitle, PHONE_TEL } from "@/lib/constants";
import { useState } from "react";

interface CartCardProps {
  cart: Cart;
  slug?: string;
}

export function CartCard({ cart, slug }: CartCardProps) {
  const [imageError, setImageError] = useState(false);
  const make = cart.cartType?.make || "";
  const model = cart.cartType?.model || "";
  const color = cart.cartAttributes?.cartColor || "";
  const title = buildCartTitle(make, model, color);
  const price = formatPrice(cart.retailPrice);
  const isUsed = cart.isUsed === true;
  const isElectric = cart.isElectric === true;
  const isStreetLegal = cart.title?.isStreetLegal === true;
  const passengers = cart.cartAttributes?.passengers || "";

  const imageUrl = imageError
    ? "https://tigongolfcarts.com/wp-content/uploads/2024/11/TIGON-GOLF-CARTS-IMAGES-COMING-SOON.jpg"
    : getCartImageUrl(cart.imageUrls);

  const cartUrl = slug ? `/golfcart/${slug}` : `/golfcart/${cart._id}`;

  return (
    <div
      className="group rounded-md overflow-hidden border border-card-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
      data-testid={`card-cart-${cart._id}`}
    >
      <Link href={cartUrl}>
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
            data-testid={`img-cart-${cart._id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2.5">
            <Badge
              className={isUsed
                ? "text-xs font-bold uppercase tracking-wide bg-amber-500 hover:bg-amber-500 text-white border-0 shadow"
                : "text-xs font-bold uppercase tracking-wide bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow"
              }
              data-testid={`badge-condition-${cart._id}`}
            >
              {isUsed ? "Used" : "✦ New"}
            </Badge>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0 backdrop-blur-sm">
                {isElectric ? <Zap className="h-3 w-3 mr-1 text-yellow-400" /> : <Fuel className="h-3 w-3 mr-1 text-orange-400" />}
                {isElectric ? "Electric" : "Gas"}
              </Badge>
              {isStreetLegal && (
                <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0 backdrop-blur-sm" data-testid={`badge-street-legal-${cart._id}`}>
                  <Shield className="h-3 w-3 mr-1 text-blue-400" />
                  Street Legal
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3.5">
        <Link href={cartUrl}>
          <h3 className="font-bold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-1.5" data-testid={`text-title-${cart._id}`}>
            {title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {cart.cartType?.year && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{cart.cartType.year}</span>
          )}
          {passengers && (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {passengers} pass.
            </span>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-0.5">
            <Tag className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Wholesale Price</span>
          </div>
          <p className="text-lg font-extrabold text-primary leading-none mb-2" data-testid={`text-price-${cart._id}`}>
            {price}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <Link href={cartUrl}>
              <Button size="sm" variant="outline" className="w-full text-xs font-bold" data-testid={`button-view-${cart._id}`}>
                View Cart
              </Button>
            </Link>
            <a href={PHONE_TEL} className="block">
              <Button size="sm" className="w-full text-xs font-bold" data-testid={`button-call-${cart._id}`}>
                <Phone className="h-3 w-3 mr-1" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartCardSkeleton() {
  return (
    <div className="rounded-md overflow-hidden border border-card-border bg-card">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-3.5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
