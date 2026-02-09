import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-extrabold text-muted-foreground/30 mb-4">404</h1>
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" data-testid="button-go-home">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Go Home
          </Button>
        </Link>
        <Link href="/inventory">
          <Button data-testid="button-browse">
            Browse Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
}
