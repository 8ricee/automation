"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

type FacetedOption = { label: string; value: string; icon?: React.ComponentType<{ className?: string }> };

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  searchColumn?: string;
  facetedFilters?: { column: string; title: string; options: FacetedOption[] }[];
  actionsRender?: React.ReactNode;
}

export function DataTableToolbar<TData>({ table, placeholder, searchColumn, facetedFilters, actionsRender }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar - only show if searchColumn is provided */}
      {searchColumn && (
        <div className="flex w-full">
          <Input
            placeholder={placeholder ?? "Tìm kiếm..."}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
            className="h-8 w-full"
          />
        </div>
      )}
      
      {/* Filters and Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {facetedFilters?.map((filter) =>
            table.getColumn(filter.column) ? (
              <DataTableFacetedFilter
                key={filter.column}
                column={table.getColumn(filter.column)}
                title={filter.title}
                options={filter.options}
              />
            ) : null
          )}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()} className="hidden sm:inline-flex">
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <DataTableViewOptions table={table} />
          {actionsRender}
        </div>
      </div>
    </div>
  );
}
