"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
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
import {
  HEALTH_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/projects/formatters";
import {
  PROJECT_HEALTHS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type ProjectHealth,
  type ProjectPriority,
  type ProjectStatus,
} from "@/types/api";

const STATUS_FILTER_ITEMS = { all: "All statuses", ...STATUS_LABELS };
const PRIORITY_FILTER_ITEMS = { all: "All priorities", ...PRIORITY_LABELS };
const HEALTH_FILTER_ITEMS = { all: "All health", ...HEALTH_LABELS };

type ProjectsToolbarProps = {
  search: string;
  status: ProjectStatus | null;
  priority: ProjectPriority | null;
  health: ProjectHealth | null;
};

export function ProjectsToolbar({
  search,
  status,
  priority,
  health,
}: ProjectsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

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

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search projects…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search projects"
            className="pl-8"
          />
        </div>
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status ?? "all"}
          onValueChange={(value) => updateParam("status", value)}
        >
          <SelectTrigger aria-label="Filter by status" className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={PRIORITY_FILTER_ITEMS}
          value={priority ?? "all"}
          onValueChange={(value) => updateParam("priority", value)}
        >
          <SelectTrigger aria-label="Filter by priority" className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PROJECT_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={HEALTH_FILTER_ITEMS}
          value={health ?? "all"}
          onValueChange={(value) => updateParam("health", value)}
        >
          <SelectTrigger aria-label="Filter by health" className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All health</SelectItem>
            {PROJECT_HEALTHS.map((h) => (
              <SelectItem key={h} value={h}>
                {HEALTH_LABELS[h]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button nativeButton={false} render={<Link href="/projects/new" />}>
        <Plus />
        New project
      </Button>
    </div>
  );
}
