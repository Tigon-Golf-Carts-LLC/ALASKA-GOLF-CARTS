import { Link, useLocation } from "wouter";
import { Phone, Menu, X, Sun, Moon, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { PHONE_NUMBER, PHONE_TEL } from "@/lib/constants";
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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(() => getSecondsUntilNextUpdate());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getSecondsUntilNextUpdate()), 1000);
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/financing", label: "Financing" },
    { href: "/service-area", label: "Locations" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-[100]" data-testid="header">
      <div className="hidden sm:block bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-9 text-xs font-medium">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center gap-1.5 shrink-0">
                <Tag className="h-3 w-3" />
                <span className="font-bold uppercase tracking-wider">Wholesale Pricing</span>
              </div>
              <span className="text-primary-foreground/60 hidden sm:block">|</span>
              <span className="text-primary-foreground/85 hidden sm:block truncate">
                Next inventory update in <span className="font-bold tabular-nums">{formatCountdown(countdown)}</span>
              </span>
            </div>
            <a href={PHONE_TEL} className="flex items-center gap-1.5 font-bold hover:opacity-80 transition-opacity shrink-0">
              <Phone className="h-3 w-3" />
              <span>{PHONE_NUMBER}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-b bg-background/98 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2.5">
                <img src={logoImg} alt="Alaska Golf Carts" className="h-10 w-10 object-contain" />
                <div className="leading-tight">
                  <span className="text-lg font-extrabold tracking-tight block">
                    Alaska <span className="text-primary">Golf Carts</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase hidden sm:block">alaskagolfcarts.com</span>
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5" data-testid="nav-desktop">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    size="sm"
                    className="font-semibold text-sm"
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <a href={PHONE_TEL} className="hidden sm:block">
                <Button className="font-bold" data-testid="button-call-header">
                  <Phone className="h-4 w-4 mr-2" />
                  {PHONE_NUMBER}
                </Button>
              </a>
              <a href={PHONE_TEL} className="sm:hidden">
                <Button size="icon" data-testid="button-call-header-mobile">
                  <Phone className="h-4 w-4" />
                </Button>
              </a>

              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background shadow-lg" data-testid="nav-mobile">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-2 border-t mt-2">
              <a href={PHONE_TEL} className="flex items-center gap-2 text-primary font-bold text-sm px-3 py-2">
                <Phone className="h-4 w-4" />
                {PHONE_NUMBER}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
