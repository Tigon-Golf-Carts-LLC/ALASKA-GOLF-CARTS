import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import { defaultFilters, type FilterState } from "@/components/inventory-filters";
import { FilterContent } from "@/components/inventory-filters";
import type { CartsResponse } from "@shared/schema";

interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
}

const PAGE_SIZE = 20;

type QuickChip = { label: string; key: keyof Pick<FilterState, "isNew" | "isUsed" | "isElectric" | "isGas" | "isStreetLegal" | "isLifted"> };
const QUICK_CHIPS: QuickChip[] = [
  { label: "New", key: "isNew" },
  { label: "Used", key: "isUsed" },
  { label: "Electric", key: "isElectric" },
  { label: "Gas", key: "isGas" },
  { label: "Street Legal", key: "isStreetLegal" },
  { label: "Lifted", key: "isLifted" },
];

export default function Inventory() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [filters, setFilters] = useState<FilterState>(() => {
    const initial = { ...defaultFilters };
    if (params.get("isNew") === "true") initial.isNew = true;
    if (params.get("isUsed") === "true") initial.isUsed = true;
    if (params.get("condition") === "new") initial.isNew = true;
    if (params.get("condition") === "used") initial.isUsed = true;
    if (params.get("make")) initial.makes = [params.get("make")!];
    if (params.get("search")) initial.searchText = params.get("search")!;
    return initial;
  });

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState(filters.searchText);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchText);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== filters.searchText) {
      setFilters((prev) => ({ ...prev, searchText: debouncedSearch }));
      setPage(0);
    }
  }, [debouncedSearch]);

  const buildQueryParams = useCallback(() => {
    const p = new URLSearchParams();
    p.set("pageNumber", String(page));
    p.set("pageSize", String(PAGE_SIZE));
    if (filters.searchText) p.set("searchText", filters.searchText);
    if (filters.priceSortASC !== null) p.set("priceSortASC", String(filters.priceSortASC));
    if (filters.isNew) p.set("isNew", "true");
    if (filters.isUsed) p.set("isUsed", "true");
    if (filters.isElectric) p.set("isElectric", "true");
    if (filters.isGas) p.set("isGas", "true");
    if (filters.isStreetLegal) p.set("isStreetLegal", "true");
    if (filters.isLifted) p.set("isLifted", "true");
    if (filters.makes.length > 0) p.set("makes", filters.makes.join(","));
    if (filters.models.length > 0) p.set("models", filters.models.join(","));
    if (filters.colors.length > 0) p.set("colors", filters.colors.join(","));
    if (filters.seats.length > 0) p.set("seats", filters.seats.join(","));
    if (filters.driveTrain.length > 0) p.set("driveTrain", filters.driveTrain.join(","));
    if (filters.storeIds.length > 0) p.set("storeIds", filters.storeIds.join(","));
    return p.toString();
  }, [page, filters]);

  const queryKey = `/api/carts?${buildQueryParams()}`;
  const { data, isLoading } = useQuery<CartsResponse>({ queryKey: [queryKey], staleTime: 60_000 });
  const { data: slugMap } = useQuery<SlugMap>({ queryKey: ["/api/slug-map"] });

  const totalPages = data ? Math.ceil(data.totalCarts / PAGE_SIZE) : 0;

  const handleFiltersChange = (newFilters: FilterState) => { setFilters(newFilters); setPage(0); };

  const toggleChip = (key: QuickChip["key"]) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setPage(0);
  };

  const activeCount =
    (filters.isNew ? 1 : 0) + (filters.isUsed ? 1 : 0) +
    (filters.isElectric ? 1 : 0) + (filters.isGas ? 1 : 0) +
    (filters.isStreetLegal ? 1 : 0) + (filters.isLifted ? 1 : 0) +
    filters.makes.length + filters.models.length + filters.colors.length +
    filters.storeIds.length + filters.seats.length + filters.driveTrain.length;

  const quickChipCount = (filters.isNew ? 1 : 0) + (filters.isUsed ? 1 : 0) +
    (filters.isElectric ? 1 : 0) + (filters.isGas ? 1 : 0) +
    (filters.isStreetLegal ? 1 : 0) + (filters.isLifted ? 1 : 0);
  const extraFilterCount = activeCount - quickChipCount;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky toolbar ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-3 pt-3 pb-2 space-y-2">

          {/* Title + count */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold leading-none" data-testid="text-inventory-title">
                Golf Cart Inventory
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-inventory-count">
                {data ? `${data.totalCarts.toLocaleString()} discounted vehicles` : "Loading…"}
              </p>
            </div>
            {activeCount > 0 && (
              <button
                onClick={() => handleFiltersChange({ ...defaultFilters })}
                className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/30 rounded-full px-2.5 py-1 hover:bg-primary/10 transition-colors"
                data-testid="button-clear-all"
              >
                <X className="h-3 w-3" /> Clear {activeCount}
              </button>
            )}
          </div>

          {/* Search + filter + sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search make, model, color…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 text-sm"
                data-testid="input-search"
              />
            </div>

            {/* Filter sheet */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 relative" data-testid="button-open-filters">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="px-4 pt-4 pb-2 border-b">
                  <SheetTitle className="flex items-center justify-between">
                    <span>Filter Inventory</span>
                    {activeCount > 0 && (
                      <button onClick={() => handleFiltersChange({ ...defaultFilters })} className="text-xs text-primary font-semibold">
                        Reset all
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-4rem)] px-4 pb-6">
                  <FilterContent filters={filters} onFiltersChange={handleFiltersChange} totalCarts={data?.totalCarts ?? 0} />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select
              value={filters.priceSortASC === null ? "default" : filters.priceSortASC ? "low" : "high"}
              onValueChange={(v) => {
                handleFiltersChange({ ...filters, priceSortASC: v === "default" ? null : v === "low" });
              }}
            >
              <SelectTrigger className="h-10 w-10 shrink-0 px-0 justify-center [&>span]:hidden" data-testid="select-sort">
                <ArrowUpDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="default">Latest</SelectItem>
                <SelectItem value="low">Price: Low → High</SelectItem>
                <SelectItem value="high">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {QUICK_CHIPS.map((chip) => {
              const active = !!filters[chip.key];
              return (
                <button
                  key={chip.key}
                  onClick={() => toggleChip(chip.key)}
                  className={`shrink-0 rounded-full text-xs font-semibold px-3 py-1.5 border transition-all ${
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-muted text-foreground/70 border-border hover:border-primary/40"
                  }`}
                  data-testid={`chip-${chip.key}`}
                >
                  {chip.label}
                </button>
              );
            })}
            {extraFilterCount > 0 && (
              <span className="shrink-0 rounded-full text-xs font-semibold px-3 py-1.5 bg-primary/15 text-primary border border-primary/30">
                +{extraFilterCount} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="mx-auto max-w-7xl px-3 py-4 flex gap-5">

        {/* Desktop sidebar filter — lg only */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-[160px]">
            <ScrollArea className="h-[calc(100vh-11rem)]">
              <div className="pr-3">
                <FilterContent filters={filters} onFiltersChange={handleFiltersChange} totalCarts={data?.totalCarts ?? 0} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Card grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <CartCardSkeleton key={i} />)}
            </div>
          ) : data?.carts && data.carts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3" data-testid="grid-inventory">
                {data.carts.map((cart) => (
                  <CartCard key={cart._id} cart={cart} slug={slugMap?.idToSlug[cart._id]} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-3" data-testid="pagination">
                  <p className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages} · {data.totalCarts.toLocaleString()} vehicles
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-prev-page" className="gap-1">
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i;
                        else if (page < 3) pageNum = i;
                        else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                        else pageNum = page - 2 + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            data-testid={`button-page-${pageNum}`}
                            className="w-9 h-9"
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>

                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid="button-next-page" className="gap-1">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-bold mb-1" data-testid="text-no-results">No carts found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your filters or search to find what you're looking for.
              </p>
              {activeCount > 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => handleFiltersChange({ ...defaultFilters })}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
