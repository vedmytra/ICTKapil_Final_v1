import { useMemo, useState } from "react";

export interface UseSearchFilterOptions<T> {
  searchFields: (item: T) => string[];
}

export function useSearchFilter<T>(items: T[], options: UseSearchFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = items;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
        options.searchFields(item).some((field) =>
          field?.toLowerCase().includes(term)
        )
      );
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (!value) continue;
      result = result.filter((item: any) => {
        const fieldValue = item[key];
        if (Array.isArray(fieldValue)) return fieldValue.includes(value);
        return String(fieldValue) === value;
      });
    }

    return result;
  }, [items, searchTerm, activeFilters, options]);

  const setFilter = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  return { searchTerm, setSearchTerm, activeFilters, setFilter, clearFilters, filtered };
}
