"use client";

import { Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientStatus } from "@/types/api";
import { CLIENT_STATUSES } from "@/types/api";

const STATUS_LABEL: Record<ClientStatus | "all", string> = {
  all: "All statuses",
  lead: "Lead",
  active: "Active",
  inactive: "Inactive",
};

type ClientsToolbarProps = {
  search: string;
  status: ClientStatus | null;
  onAdd: () => void;
};

export function ClientsToolbar({ search, status, onAdd }: ClientsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

  // Always read the freshest searchParams inside the debounced callback so a
  // concurrent status toggle doesn't get clobbered by a stale snapshot.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Keep local state synced if URL changes externally (back/forward nav).
  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  // Debounce search input → URL push.
  useEffect(() => {
    if (searchValue === search) return;
    const handle = setTimeout(() => {
      const next = new URLSearchParams(
        searchParamsRef.current?.toString() ?? "",
      );
      if (searchValue) next.set("search", searchValue);
      else next.delete("search");
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchValue, search, pathname, router]);

  const onStatusChange = (value: string | null) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value && value !== "all") next.set("status", value);
    else next.delete("status");
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search clients…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search clients"
            className="pl-8"
          />
        </div>
        <Select
          items={STATUS_LABEL}
          value={status ?? "all"}
          onValueChange={(value) => onStatusChange(value)}
        >
          <SelectTrigger aria-label="Filter by status" className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{STATUS_LABEL.all}</SelectItem>
            {CLIENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAdd}>
        <Plus />
        Add client
      </Button>
    </div>
  );
}
