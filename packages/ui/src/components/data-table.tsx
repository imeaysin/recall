"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { DataTablePagination } from "@workspace/ui/components/data-table-pagination"
import { DataTableViewOptions } from "@workspace/ui/components/data-table-view-options"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Filters a single column with TanStack's default includes match. */
  filterColumn?: string
  /**
   * Domain-friendly row filter. Prefer this over column `filterFn`s when
   * search spans multiple fields.
   */
  filterFn?: (row: TData, query: string) => boolean
  filterPlaceholder?: string
  /**
   * Controlled filter input. Pair with `onFilterValueChange`.
   * Use with `manualFiltering` when rows are filtered outside the table.
   */
  filterValue?: string
  onFilterValueChange?: (value: string) => void
  /**
   * When true, skip client-side filtering — `data` is already filtered
   * (TanStack Table `manualFiltering`).
   */
  manualFiltering?: boolean
  /** Extra controls rendered beside the filter (e.g. faceted filters). */
  toolbar?: React.ReactNode
  className?: string
  getRowId?: (originalRow: TData, index: number, parent?: unknown) => string
  initialSorting?: SortingState
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  enableRowSelection?: boolean | ((row: { original: TData }) => boolean)
}

function resolveStringUpdater(
  updater: Updater<string>,
  previous: string
): string {
  if (typeof updater === "function") {
    return updater(previous)
  }
  return updater
}

function resolveFilterInputValue(options: {
  readonly useGlobalFilter: boolean
  readonly globalFilter: string
  readonly filterColumn?: string
  readonly readColumnFilterValue?: () => string
}): string {
  if (options.useGlobalFilter) return options.globalFilter
  if (!options.filterColumn || !options.readColumnFilterValue) return ""
  return options.readColumnFilterValue()
}

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterFn,
  filterPlaceholder = "Filter...",
  filterValue: filterValueProp,
  onFilterValueChange,
  manualFiltering = false,
  toolbar,
  className,
  getRowId,
  initialSorting = [],
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  enableRowSelection = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [uncontrolledGlobalFilter, setUncontrolledGlobalFilter] =
    React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [uncontrolledRowSelection, setUncontrolledRowSelection] =
    React.useState<RowSelectionState>({})

  const isFilterControlled = filterValueProp !== undefined
  const globalFilter = isFilterControlled
    ? filterValueProp
    : uncontrolledGlobalFilter

  const rowSelection = rowSelectionProp ?? uncontrolledRowSelection
  const handleRowSelectionChange =
    onRowSelectionChange ?? setUncontrolledRowSelection

  function setGlobalFilter(updater: Updater<string>) {
    const next = resolveStringUpdater(updater, globalFilter)
    onFilterValueChange?.(next)
    if (!isFilterControlled) {
      setUncontrolledGlobalFilter(next)
    }
  }

  const globalFilterFn = React.useMemo(() => {
    if (!filterFn || manualFiltering) return undefined

    const matches: FilterFn<TData> = (...args) =>
      filterFn(args[0].original, String(args[2] ?? ""))

    return matches
  }, [filterFn, manualFiltering])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table
  const table = useReactTable({
    data,
    columns,
    getRowId,
    enableRowSelection,
    manualFiltering,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  const useGlobalFilter = Boolean(
    filterFn || isFilterControlled || onFilterValueChange
  )
  const showFilter = Boolean(useGlobalFilter || filterColumn)
  const filterValue = resolveFilterInputValue({
    useGlobalFilter,
    globalFilter,
    filterColumn,
    readColumnFilterValue: filterColumn
      ? () => {
          const value = table.getColumn(filterColumn)?.getFilterValue()
          if (typeof value === "string") return value
          return ""
        }
      : undefined,
  })

  function handleFilterChange(value: string) {
    if (useGlobalFilter) {
      setGlobalFilter(value)
      return
    }
    if (filterColumn) {
      table.getColumn(filterColumn)?.setFilterValue(value)
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {showFilter ? (
          <Input
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="max-w-sm"
          />
        ) : null}
        {toolbar}
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

export { DataTable }
export type { DataTableProps }
