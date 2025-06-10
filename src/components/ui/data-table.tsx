"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState, Suspense } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKeys: string[]; // Allow multiple search keys
  isLoading?: boolean;
}

// Skeleton component for the data table
function DataTableSkeleton<TData, TValue>({ columns }: { columns: ColumnDef<TData, TValue>[] }) {
  const skeletonRows = Array(5).fill(0);

  return (
    <div>
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="flex justify-center py-4">
        <div className="w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-md overflow-hidden">
          <Table className="min-w-full w-full">
            <TableHeader className="bg-gray-100 dark:bg-[#18181a] text-gray-600 dark:text-gray-300">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className="p-4 text-left font-semibold">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-200 dark:hover:bg-gray-800">
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="p-4 text-gray-700 dark:text-gray-300">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-1 md:space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKeys,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState<string>(""); // Store the search input value
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0); // Track the current page index
  const [pageSize] = useState(5); // Set page size to 5
  const t = useTranslations('common.dataTable');

  // Always initialize the table, even when loading
  const table = useReactTable({
    data: isLoading ? [] : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
      globalFilter, // Include global filter state
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    globalFilterFn: (row, columnIds, filterValue) => {
      const searchTerm = filterValue.toLowerCase();

      return searchKeys.some((key) => {
        const columnValue = row.getValue(key);

        // Handle date searches specially
        if (key === "startTime" && columnValue) {
          const date = new Date(columnValue as string | number | Date);

          // Create different date format strings for flexible searching
          const fullDateStr = format(date, "MMM d, yyyy").toLowerCase();
          const monthStr = format(date, "MMM").toLowerCase();
          const monthNumStr = format(date, "M").toLowerCase();
          const dayStr = format(date, "d").toLowerCase();
          const yearStr = format(date, "yyyy").toLowerCase();

          // Check if search term matches any date component
          if (fullDateStr.includes(searchTerm) ||
            monthStr.includes(searchTerm) ||
            monthNumStr === searchTerm ||
            dayStr === searchTerm ||
            yearStr.includes(searchTerm)) {
            return true;
          }
          return false;
        }

        // For non-date fields, do regular string matching
        return columnValue
          ?.toString()
          .toLowerCase()
          .includes(searchTerm);
      });
    },
  });

  // If loading, render the skeleton after all hooks are called
  if (isLoading) {
    return <DataTableSkeleton columns={columns} />;
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={t('search')}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)} // Update the global filter state
          className="max-w-sm text-base"
        />
      </div>

      <div className="flex justify-center py-4">
        <div className="w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-md overflow-hidden">
          <Table className="min-w-full w-full">
            <TableHeader className="bg-gray-100 dark:bg-[#18181a] text-gray-600 dark:text-gray-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="p-4 text-left font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="p-4 text-gray-700 dark:text-gray-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t('page', {
            current: pageIndex + 1,
            total: table.getPageCount() == 0 ? 1 : table.getPageCount()
          })}        </p>
        <div className="flex space-x-1 md:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronFirst className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((old) => Math.max(0, old - 1))}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPageIndex((old) => Math.min(old + 1, table.getPageCount() - 1))
            }
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronLast className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
