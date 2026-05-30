"use client";

import { useState, useCallback, useId } from "react";

// ------------------------------------------------------------------ //
// Types
// ------------------------------------------------------------------ //

export type CellType = "text" | "number" | "date" | "checkbox" | "select";

export interface ColumnDef {
  id: string;
  header: string;
  type: CellType;
  options?: string[]; // for select type
  hidden?: boolean;
  width?: number;
}

export type RowData = Record<string, string | boolean | number>;

export interface AdvancedTableData {
  columns: ColumnDef[];
  rows: RowData[];
}

type SortDir = "asc" | "desc" | null;

// ------------------------------------------------------------------ //
// Helpers
// ------------------------------------------------------------------ //

function parseCellValue(raw: string | boolean | number, type: CellType): string | number | boolean {
  if (type === "number") return Number(raw) || 0;
  if (type === "checkbox") return Boolean(raw);
  return raw ?? "";
}

function compareValues(a: unknown, b: unknown, type: CellType, dir: SortDir) {
  if (dir === null) return 0;
  let cmp = 0;
  if (type === "number") {
    cmp = (Number(a) || 0) - (Number(b) || 0);
  } else if (type === "date") {
    cmp = new Date(String(a || "")).getTime() - new Date(String(b || "")).getTime();
  } else {
    cmp = String(a ?? "").localeCompare(String(b ?? ""));
  }
  return dir === "asc" ? cmp : -cmp;
}

function evaluateFormula(formula: string, rows: RowData[], colId: string): string {
  const fn = formula.replace(/^=/, "").trim().toUpperCase();
  const values = rows
    .map((r) => Number(r[colId]))
    .filter((v) => !Number.isNaN(v));

  if (fn === "SUM" || fn.startsWith("SUM(")) {
    return String(values.reduce((a, b) => a + b, 0));
  }
  if (fn === "AVG" || fn === "AVERAGE" || fn.startsWith("AVG(") || fn.startsWith("AVERAGE(")) {
    return values.length ? String(Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100) : "0";
  }
  if (fn === "COUNT" || fn.startsWith("COUNT(")) {
    return String(values.length);
  }
  if (fn === "MAX" || fn.startsWith("MAX(")) {
    return values.length ? String(Math.max(...values)) : "";
  }
  if (fn === "MIN" || fn.startsWith("MIN(")) {
    return values.length ? String(Math.min(...values)) : "";
  }
  return formula;
}

let counter = Date.now();
function uid() {
  return `t${(counter++).toString(36)}`;
}

// ------------------------------------------------------------------ //
// Cell components
// ------------------------------------------------------------------ //

function EditableCell({
  value,
  colDef,
  readOnly,
  onChange,
}: {
  value: string | boolean | number;
  colDef: ColumnDef;
  readOnly: boolean;
  onChange: (v: string | boolean | number) => void;
}) {
  if (colDef.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
      />
    );
  }

  if (colDef.type === "select" && colDef.options) {
    return (
      <select
        value={String(value)}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none disabled:opacity-60"
      >
        <option value="">—</option>
        {colDef.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (readOnly) {
    return (
      <span className="text-sm text-slate-800 dark:text-slate-100">
        {colDef.type === "date" && value
          ? new Date(String(value)).toLocaleDateString()
          : String(value ?? "")}
      </span>
    );
  }

  return (
    <input
      type={colDef.type === "date" ? "date" : colDef.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent text-sm outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
    />
  );
}

// ------------------------------------------------------------------ //
// Column type picker modal
// ------------------------------------------------------------------ //

function ColumnModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<ColumnDef>;
  onSave: (col: Omit<ColumnDef, "id">) => void;
  onClose: () => void;
}) {
  const [header, setHeader] = useState(initial.header ?? "");
  const [type, setType] = useState<CellType>(initial.type ?? "text");
  const [optionsRaw, setOptionsRaw] = useState((initial.options ?? []).join(", "));

  function handleSave() {
    const trimmed = header.trim();
    if (!trimmed) return;
    const options =
      type === "select"
        ? optionsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    onSave({ header: trimmed, type, options });
  }

  const TYPES: { value: CellType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "checkbox", label: "Checkbox" },
    { value: "select", label: "Select" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {initial.id ? "Edit column" : "Add column"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Header</label>
            <input
              autoFocus
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
            <div className="grid grid-cols-3 gap-1">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    type === value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {type === "select" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Options (comma-separated)
              </label>
              <input
                value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                placeholder="Option A, Option B, Option C"
              />
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!header.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// AdvancedTable — main export
// ------------------------------------------------------------------ //

export interface AdvancedTableProps {
  data: AdvancedTableData;
  readOnly?: boolean;
  onChange?: (data: AdvancedTableData) => void;
  showFormulas?: boolean;
}

export function AdvancedTable({ data, readOnly = false, onChange, showFormulas = true }: AdvancedTableProps) {
  const [table, setTable] = useState<AdvancedTableData>(data);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortColId, setSortColId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [colModal, setColModal] = useState<Partial<ColumnDef> | null>(null);
  const filterId = useId();

  const update = useCallback(
    (next: AdvancedTableData) => {
      setTable(next);
      onChange?.(next);
    },
    [onChange]
  );

  const visibleCols = table.columns.filter((c) => !c.hidden);

  // Filter rows
  const filteredRows = filterQuery
    ? table.rows.filter((row) =>
        visibleCols.some((col) => {
          const v = row[col.id];
          return String(v ?? "").toLowerCase().includes(filterQuery.toLowerCase());
        })
      )
    : table.rows;

  // Sort rows
  const displayRows =
    sortColId && sortDir
      ? [...filteredRows].sort((a, b) => {
          const col = table.columns.find((c) => c.id === sortColId);
          if (!col) return 0;
          return compareValues(a[sortColId], b[sortColId], col.type, sortDir);
        })
      : filteredRows;

  function toggleSort(colId: string) {
    if (sortColId !== colId) {
      setSortColId(colId);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortColId(null);
      setSortDir(null);
    }
  }

  function updateCell(rowIndex: number, colId: string, value: string | boolean | number) {
    // rowIndex here refers to filteredRows; map back to original
    const originalIndex = table.rows.indexOf(filteredRows[rowIndex]);
    if (originalIndex === -1) return;
    const rows = table.rows.map((r, i) =>
      i === originalIndex ? { ...r, [colId]: value } : r
    );
    update({ ...table, rows });
  }

  function addRow() {
    const emptyRow: RowData = {};
    table.columns.forEach((col) => {
      emptyRow[col.id] = col.type === "checkbox" ? false : col.type === "number" ? 0 : "";
    });
    update({ ...table, rows: [...table.rows, emptyRow] });
  }

  function deleteRow(rowIndex: number) {
    const originalIndex = table.rows.indexOf(filteredRows[rowIndex]);
    if (originalIndex === -1) return;
    update({ ...table, rows: table.rows.filter((_, i) => i !== originalIndex) });
  }

  function saveColumn(colData: Omit<ColumnDef, "id">) {
    if (colModal?.id) {
      // Edit existing
      update({
        ...table,
        columns: table.columns.map((c) =>
          c.id === colModal.id ? { ...c, ...colData } : c
        ),
      });
    } else {
      // Add new column
      const newCol: ColumnDef = { id: uid(), ...colData };
      const rows = table.rows.map((r) => ({
        ...r,
        [newCol.id]: newCol.type === "checkbox" ? false : newCol.type === "number" ? 0 : "",
      }));
      update({ columns: [...table.columns, newCol], rows });
    }
    setColModal(null);
  }

  function deleteColumn(colId: string) {
    const columns = table.columns.filter((c) => c.id !== colId);
    const rows = table.rows.map((r) => {
      const { [colId]: _removed, ...rest } = r;
      return rest;
    });
    update({ columns, rows });
  }

  function toggleHideColumn(colId: string) {
    update({
      ...table,
      columns: table.columns.map((c) => (c.id === colId ? { ...c, hidden: !c.hidden } : c)),
    });
  }

  // Aggregate row (totals for number columns)
  const aggregates = Object.fromEntries(
    table.columns
      .filter((c) => c.type === "number")
      .map((c) => [c.id, evaluateFormula("=SUM", table.rows, c.id)])
  );

  const hasSumRow = table.columns.some((c) => c.type === "number");

  return (
    <div className="advanced-table my-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <label htmlFor={filterId} className="sr-only">Filter rows</label>
        <input
          id={filterId}
          type="search"
          placeholder="Filter rows..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500"
        />
        <span className="text-xs text-slate-400">
          {displayRows.length} / {table.rows.length} rows
        </span>
        {!readOnly && (
          <>
            <button
              onClick={() => setColModal({})}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition"
            >
              + Column
            </button>
            <div className="relative group">
              <button className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition">
                Columns ▾
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg py-1">
                {table.columns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={!col.hidden}
                      onChange={() => toggleHideColumn(col.id)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{col.header}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="group px-4 py-2.5 text-left"
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSort(col.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {col.header}
                      <span className="text-slate-300 dark:text-slate-600">
                        {sortColId === col.id
                          ? sortDir === "asc" ? " ↑" : " ↓"
                          : " ↕"}
                      </span>
                    </button>
                    {!readOnly && (
                      <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
                        <button
                          onClick={() => setColModal(col)}
                          className="text-slate-300 hover:text-blue-500 transition text-xs"
                          title="Edit column"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteColumn(col.id)}
                          className="text-slate-300 hover:text-red-500 transition text-xs"
                          title="Delete column"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{col.type}</div>
                </th>
              ))}
              {!readOnly && (
                <th className="w-10 px-2 py-2.5" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length + (readOnly ? 0 : 1)}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  {filterQuery ? "No rows match your filter." : "No rows yet."}
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  {visibleCols.map((col) => (
                    <td key={col.id} className="px-4 py-2">
                      <EditableCell
                        value={parseCellValue(row[col.id], col.type)}
                        colDef={col}
                        readOnly={readOnly}
                        onChange={(v) => updateCell(rowIdx, col.id, v)}
                      />
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="px-2 py-2">
                      <button
                        onClick={() => deleteRow(rowIdx)}
                        className="hidden group-hover:block text-slate-300 hover:text-red-500 transition text-xs"
                        title="Delete row"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

          {/* Aggregates / totals row */}
          {showFormulas && hasSumRow && (
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80">
              <tr>
                {visibleCols.map((col) => (
                  <td key={col.id} className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {col.type === "number" && aggregates[col.id] !== undefined ? (
                      <span title={`SUM of ${col.header}`}>Σ {aggregates[col.id]}</span>
                    ) : col === visibleCols[0] ? (
                      "Totals"
                    ) : null}
                  </td>
                ))}
                {!readOnly && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add row */}
      {!readOnly && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
          <button
            onClick={addRow}
            className="text-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
          >
            + Add row
          </button>
        </div>
      )}

      {colModal !== null && (
        <ColumnModal
          initial={colModal}
          onSave={saveColumn}
          onClose={() => setColModal(null)}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Default empty table factory
// ------------------------------------------------------------------ //

export function defaultTableData(): AdvancedTableData {
  return {
    columns: [
      { id: uid(), header: "Name", type: "text" },
      { id: uid(), header: "Status", type: "select", options: ["To Do", "In Progress", "Done"] },
      { id: uid(), header: "Priority", type: "select", options: ["Low", "Medium", "High"] },
      { id: uid(), header: "Points", type: "number" },
    ],
    rows: [],
  };
}
