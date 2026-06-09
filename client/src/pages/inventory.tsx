import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CartCard, CartCardSkeleton } from "@/components/cart-card";
import { defaultFilters, type FilterState } from "@/components/inventory-filters";
import type { CartsResponse, Store, CartModel } from "@shared/schema";
import { STATE_ABBREVIATIONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

interface SlugMap { slugToId: Record<string, string>; idToSlug: Record<string, string>; }
interface BrandItem { key: string; label: string; }

const PAGE_SIZE = 20;
const SEAT_OPTIONS = ["2 Passenger", "4 Passenger", "6 Passenger", "8 Passenger"];
const DRIVETRAIN_OPTIONS = ["2X4", "4X4"];

function CheckItem({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <label className="flex items-center gap-2.5 text-sm cursor-pointer py-1.5 hover:text-primary transition-colors">
      <Checkbox checked={checked} onCheckedChange={onChange} data-testid={testId} className="h-4 w-4" />
      {label}
    </label>
  );
}

function FilterDropdown({ label, activeCount, children }: { label: string; activeCount: number; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`shrink-0 flex items-center gap-1.5 rounded-full text-xs font-semibold px-3.5 py-2 border transition-all whitespace-nowrap ${
            activeCount > 0
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-muted/60 text-foreground/75 border-border hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {label}
          {activeCount > 0 && (
            <span className="bg-white/25 rounded-full min-w-[16px] h-4 px-1 text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2.5" align="start">
        <div className="space-y-0.5">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

export default function Inventory() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [filters, setFilters] = useState<FilterState>(() => {
    const initial = { ...defaultFilters };
    if (params.get("isNew") === "true" || params.get("condition") === "new") initial.isNew = true;
    if (params.get("isUsed") === "true" || params.get("condition") === "used") initial.isUsed = true;
    if (params.get("make")) initial.makes = [params.get("make")!];
    if (params.get("search")) initial.searchText = params.get("search")!;
    return initial;
  });

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState(filters.searchText);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchText);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
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
    const seats = [...filters.seats];
    if (filters.isUtility && !seats.includes("Utility")) seats.push("Utility");
    if (seats.length > 0) p.set("seats", seats.join(","));
    if (filters.makes.length > 0) p.set("makes", filters.makes.join(","));
    if (filters.models.length > 0) p.set("models", filters.models.join(","));
    if (filters.colors.length > 0) p.set("colors", filters.colors.join(","));
    if (filters.driveTrain.length > 0) p.set("driveTrain", filters.driveTrain.join(","));
    if (filters.storeIds.length > 0) p.set("storeIds", filters.storeIds.join(","));
    return p.toString();
  }, [page, filters]);

  const { data, isLoading } = useQuery<CartsResponse>({ queryKey: [`/api/carts?${buildQueryParams()}`], staleTime: 60_000 });
  const { data: slugMap } = useQuery<SlugMap>({ queryKey: ["/api/slug-map"] });
  const { data: brands } = useQuery<BrandItem[]>({ queryKey: ["/api/brands"] });
  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });

  const [models, setModels] = useState<CartModel[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const selectedMakeKeys = filters.makes.map((m) => {
    const found = brands?.find((b) => b.label === m);
    return found ? found.key : m.toLowerCase().replace(/[^a-z0-9]/g, "_");
  });

  useEffect(() => {
    if (selectedMakeKeys.length === 0) { setModels([]); setColors([]); return; }
    apiRequest("POST", "/api/cart-models", { makeKeys: selectedMakeKeys }).then((r) => r.json()).then(setModels).catch(() => setModels([]));
    apiRequest("POST", "/api/cart-colors", { makeKeys: selectedMakeKeys }).then((r) => r.json()).then((d: Array<{color: string}>) => setColors(d.map((c) => c.color))).catch(() => setColors([]));
  }, [filters.makes.join(",")]);

  const totalPages = data ? Math.ceil(data.totalCarts / PAGE_SIZE) : 0;

  const update = useCallback((partial: Partial<FilterState>) => { setFilters((prev) => ({ ...prev, ...partial })); setPage(0); }, []);
  const toggleArr = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const resetFilters = () => { setFilters({ ...defaultFilters }); setPage(0); };
  const goToPage = (n: number) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const activeCount =
    (filters.isNew ? 1 : 0) + (filters.isUsed ? 1 : 0) +
    (filters.isElectric ? 1 : 0) + (filters.isGas ? 1 : 0) +
    (filters.isStreetLegal ? 1 : 0) + (filters.isLifted ? 1 : 0) + (filters.isUtility ? 1 : 0) +
    filters.makes.length + filters.models.length + filters.colors.length +
    filters.storeIds.length + filters.seats.length + filters.driveTrain.length;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky toolbar ── */}
      <div className="sticky top-0 z-30 bg-background/97 backdrop-blur-md border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-3 pt-3 pb-2 space-y-2.5">

          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-extrabold leading-none" data-testid="text-inventory-title">Golf Cart Inventory</h1>
              <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-inventory-count">
                {data ? `${data.totalCarts.toLocaleString()} discounted vehicles` : "Loading…"}
              </p>
            </div>
            {activeCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/30 rounded-full px-2.5 py-1 hover:bg-primary/10 transition-colors" data-testid="button-clear-all">
                <RotateCcw className="h-3 w-3" /> Reset ({activeCount})
              </button>
            )}
          </div>

          {/* Search + sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search make, model, color…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 h-10 text-sm" data-testid="input-search" />
            </div>
            <Select
              value={filters.priceSortASC === null ? "default" : filters.priceSortASC ? "low" : "high"}
              onValueChange={(v) => update({ priceSortASC: v === "default" ? null : v === "low" })}
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

          {/* Filter dropdowns row — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <FilterDropdown label="Condition" activeCount={(filters.isNew ? 1 : 0) + (filters.isUsed ? 1 : 0)}>
              <CheckItem label="New" checked={filters.isNew} onChange={(c) => update({ isNew: !!c })} testId="filter-new" />
              <CheckItem label="Used" checked={filters.isUsed} onChange={(c) => update({ isUsed: !!c })} testId="filter-used" />
            </FilterDropdown>

            <FilterDropdown label="Power" activeCount={(filters.isElectric ? 1 : 0) + (filters.isGas ? 1 : 0)}>
              <CheckItem label="Electric" checked={filters.isElectric} onChange={(c) => update({ isElectric: !!c })} testId="filter-electric" />
              <CheckItem label="Gas" checked={filters.isGas} onChange={(c) => update({ isGas: !!c })} testId="filter-gas" />
            </FilterDropdown>

            <FilterDropdown label="Features" activeCount={(filters.isStreetLegal ? 1 : 0) + (filters.isLifted ? 1 : 0) + (filters.isUtility ? 1 : 0)}>
              <CheckItem label="Street Legal" checked={filters.isStreetLegal} onChange={(c) => update({ isStreetLegal: !!c })} testId="filter-street-legal" />
              <CheckItem label="Lifted" checked={filters.isLifted} onChange={(c) => update({ isLifted: !!c })} testId="filter-lifted" />
              <CheckItem label="Utility" checked={filters.isUtility} onChange={(c) => update({ isUtility: !!c })} testId="filter-utility" />
            </FilterDropdown>

            <FilterDropdown label="Brand" activeCount={filters.makes.length}>
              {brands && brands.length > 0
                ? brands.map((b) => (
                    <CheckItem key={b.key} label={b.label} checked={filters.makes.includes(b.label)} onChange={() => update({ makes: toggleArr(filters.makes, b.label) })} testId={`filter-make-${b.key}`} />
                  ))
                : <p className="text-xs text-muted-foreground py-1">Loading…</p>}
            </FilterDropdown>

            {models.length > 0 && (
              <FilterDropdown label="Model" activeCount={filters.models.length}>
                {models.map((m) => (
                  <CheckItem key={m._id} label={m.label} checked={filters.models.includes(m.label)} onChange={() => update({ models: toggleArr(filters.models, m.label) })} testId={`filter-model-${m._id}`} />
                ))}
              </FilterDropdown>
            )}

            {colors.length > 0 && (
              <FilterDropdown label="Color" activeCount={filters.colors.length}>
                {colors.map((c) => (
                  <CheckItem key={c} label={c} checked={filters.colors.includes(c)} onChange={() => update({ colors: toggleArr(filters.colors, c) })} testId={`filter-color-${c.toLowerCase().replace(/\s/g, "-")}`} />
                ))}
              </FilterDropdown>
            )}

            <FilterDropdown label="Seating" activeCount={filters.seats.length}>
              {SEAT_OPTIONS.map((s) => (
                <CheckItem key={s} label={s} checked={filters.seats.includes(s)} onChange={() => update({ seats: toggleArr(filters.seats, s) })} testId={`filter-seats-${s.split(" ")[0]}`} />
              ))}
            </FilterDropdown>

            <FilterDropdown label="Drivetrain" activeCount={filters.driveTrain.length}>
              {DRIVETRAIN_OPTIONS.map((d) => (
                <CheckItem key={d} label={d} checked={filters.driveTrain.includes(d)} onChange={() => update({ driveTrain: toggleArr(filters.driveTrain, d) })} testId={`filter-drive-${d.toLowerCase()}`} />
              ))}
            </FilterDropdown>

            {stores && stores.length > 0 && (
              <FilterDropdown label="Location" activeCount={filters.storeIds.length}>
                {stores.map((store) => (
                  <CheckItem
                    key={store.storeId}
                    label={`${store.address.city || ""}, ${STATE_ABBREVIATIONS[store.address.state || ""] || store.address.state || ""}`}
                    checked={filters.storeIds.includes(store.storeId)}
                    onChange={() => update({ storeIds: toggleArr(filters.storeIds, store.storeId) })}
                    testId={`filter-store-${store.storeId}`}
                  />
                ))}
              </FilterDropdown>
            )}

          </div>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <div className="flex gap-1.5 flex-wrap pb-0.5">
              {filters.isNew && <ActiveChip label="New" onRemove={() => update({ isNew: false })} />}
              {filters.isUsed && <ActiveChip label="Used" onRemove={() => update({ isUsed: false })} />}
              {filters.isElectric && <ActiveChip label="Electric" onRemove={() => update({ isElectric: false })} />}
              {filters.isGas && <ActiveChip label="Gas" onRemove={() => update({ isGas: false })} />}
              {filters.isStreetLegal && <ActiveChip label="Street Legal" onRemove={() => update({ isStreetLegal: false })} />}
              {filters.isLifted && <ActiveChip label="Lifted" onRemove={() => update({ isLifted: false })} />}
              {filters.isUtility && <ActiveChip label="Utility" onRemove={() => update({ isUtility: false })} />}
              {filters.makes.map((m) => <ActiveChip key={m} label={m} onRemove={() => update({ makes: filters.makes.filter((x) => x !== m) })} />)}
              {filters.models.map((m) => <ActiveChip key={m} label={m} onRemove={() => update({ models: filters.models.filter((x) => x !== m) })} />)}
              {filters.colors.map((c) => <ActiveChip key={c} label={c} onRemove={() => update({ colors: filters.colors.filter((x) => x !== c) })} />)}
              {filters.seats.map((s) => <ActiveChip key={s} label={s} onRemove={() => update({ seats: filters.seats.filter((x) => x !== s) })} />)}
              {filters.driveTrain.map((d) => <ActiveChip key={d} label={d} onRemove={() => update({ driveTrain: filters.driveTrain.filter((x) => x !== d) })} />)}
              {filters.storeIds.map((id) => {
                const store = stores?.find((s) => s.storeId === id);
                const label = store ? `${store.address.city}, ${STATE_ABBREVIATIONS[store.address.state || ""] || store.address.state}` : id;
                return <ActiveChip key={id} label={label} onRemove={() => update({ storeIds: filters.storeIds.filter((x) => x !== id) })} />;
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── Card grid ── */}
      <div className="mx-auto max-w-7xl px-3 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <CartCardSkeleton key={i} />)}
          </div>
        ) : data?.carts && data.carts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="grid-inventory">
              {data.carts.map((cart) => (
                <CartCard key={cart._id} cart={cart} slug={slugMap?.idToSlug[cart._id]} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3" data-testid="pagination">
                <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages} · {data.totalCarts.toLocaleString()} vehicles</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(Math.max(0, page - 1))} data-testid="button-prev-page" className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      let n: number;
                      if (totalPages <= 5) n = i;
                      else if (page < 3) n = i;
                      else if (page > totalPages - 3) n = totalPages - 5 + i;
                      else n = page - 2 + i;
                      return (
                        <Button key={n} variant={page === n ? "default" : "outline"} size="sm" onClick={() => goToPage(n)} data-testid={`button-page-${n}`} className="w-9 h-9">{n + 1}</Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)} data-testid="button-next-page" className="gap-1">
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
            <p className="text-sm text-muted-foreground max-w-xs">Try adjusting your filters or search.</p>
            {activeCount > 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Clear all filters</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 text-primary border border-primary/25 text-xs font-semibold px-2.5 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-primary/70 transition-colors" aria-label={`Remove ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
