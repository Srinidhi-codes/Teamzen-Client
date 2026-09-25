"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AsyncSelectOption {
  label: string;
  value: string;
}

export interface AsyncSearchSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  fetchData: (
    search: string,
    page: number
  ) => Promise<{ options: AsyncSelectOption[]; hasMore: boolean }>;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AsyncSearchSelect({
  label,
  value,
  onValueChange,
  fetchData,
  placeholder = "Select an option",
  required,
  className,
}: AsyncSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [options, setOptions] = React.useState<AsyncSelectOption[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
      setOptions([]); // Clear options on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data when debounced search or page changes
  React.useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      if (!hasMore && page !== 1) return;
      
      setLoading(true);
      try {
        const result = await fetchData(debouncedSearch, page);
        if (isMounted) {
          setOptions((prev) => 
            page === 1 ? result.options : [...prev, ...result.options]
          );
          setHasMore(result.hasMore);
        }
      } catch (error) {
        console.error("Failed to load options", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (open) {
      loadOptions();
    }

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, open, fetchData, hasMore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <label className="text-sm font-medium mb-1 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value && selectedOption ? (
              selectedOption.label
            ) : value ? (
              // If we have a value but it's not in the currently loaded options, 
              // we just show something generic or we could fetch the specific option label
              "Selected" 
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </p>
            )}
            
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === option.value ? "bg-accent/50" : ""
                )}
                onClick={() => {
                  onValueChange(option.value === value ? "" : option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{option.label}</span>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Observer target for infinite scrolling */}
            {!loading && hasMore && (
              <div ref={observerTarget} className="h-1 w-full" />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
