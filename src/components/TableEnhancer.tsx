"use client";

import { useEffect, useRef } from "react";

interface TableEnhancerProps {
  html: string;
}

function parseValue(value: string) {
  const normalized = value.trim();
  const number = Number(normalized.replace(/[$,%]/g, ""));
  if (!Number.isNaN(number) && normalized !== "") {
    return number;
  }
  return normalized.toLowerCase();
}

function getCellText(cell: HTMLTableCellElement) {
  return cell.textContent?.trim() || "";
}

function getCellValue(cell: HTMLTableCellElement) {
  return parseValue(getCellText(cell));
}

function columnLetterToIndex(letter: string) {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

function parseCellAddress(address: string, table: HTMLTableElement) {
  const match = address.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;

  const col = columnLetterToIndex(match[1]);
  const row = Number(match[2]) - 1;
  const headerRows = table.tHead ? table.tHead.rows.length : 1;
  const bodyRow = row - headerRows;

  if (bodyRow < 0 || bodyRow >= table.tBodies[0]?.rows.length) {
    return null;
  }
  return { row: bodyRow, col };
}

function evaluateFormula(formula: string, table: HTMLTableElement) {
  const normalized = formula.trim().toUpperCase();
  const sumMatch = normalized.match(/^(SUM|AVERAGE|AVG|COUNT)\(([^)]+)\)$/i);
  if (!sumMatch) return formula;

  const type = sumMatch[1].toUpperCase();
  const range = sumMatch[2];
  const parts = range.split(":").map((part) => part.trim());

  if (parts.length !== 2) return formula;

  const start = parseCellAddress(parts[0], table);
  const end = parseCellAddress(parts[1], table);
  if (!start || !end) return formula;

  const values: number[] = [];
  const body = table.tBodies[0];
  if (!body) return formula;

  for (let row = start.row; row <= end.row; row += 1) {
    const tableRow = body.rows[row];
    if (!tableRow) continue;
    for (let col = start.col; col <= end.col; col += 1) {
      const cell = tableRow.cells[col];
      if (!cell) continue;
      const value = Number(getCellText(cell).replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(value)) {
        values.push(value);
      }
    }
  }

  if (type === "COUNT") {
    return String(values.length);
  }

  if (values.length === 0) return "0";

  const sum = values.reduce((acc, next) => acc + next, 0);

  if (type === "SUM") {
    return String(sum);
  }

  const average = sum / values.length;
  return String(Math.round(average * 100) / 100);
}

function createSortButton(label: string, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "table-enhancer-sort-button";
  button.textContent = label;
  button.onclick = onClick;
  return button;
}

export function TableEnhancer({ html }: TableEnhancerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tables = Array.from(container.querySelectorAll("table")) as HTMLTableElement[];
    tables.forEach((table, index) => {
      if (table.dataset.enhanced === "true") return;
      table.dataset.enhanced = "true";

      const wrapper = document.createElement("div");
      wrapper.className = "table-enhancer-wrapper";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      const toolbar = document.createElement("div");
      toolbar.className = "table-enhancer-toolbar";

      const filter = document.createElement("input");
      filter.type = "search";
      filter.placeholder = "Filter table rows...";
      filter.className = "table-enhancer-filter";
      toolbar.appendChild(filter);

      const headerRow = table.tHead?.rows[0] || table.rows[0];
      if (headerRow) {
        const controls = document.createElement("div");
        controls.className = "table-enhancer-sort-controls";

        Array.from(headerRow.cells).forEach((cell, columnIndex) => {
          const text = cell.textContent?.trim() || `Column ${columnIndex + 1}`;
          const button = createSortButton(text, () => {
            const body = table.tBodies[0];
            if (!body) return;
            const rows = Array.from(body.rows);
            const direction = cell.dataset.sortDirection === "asc" ? "desc" : "asc";
            cell.dataset.sortDirection = direction;
            Array.from(headerRow.cells).forEach((other) => {
              if (other !== cell) {
                other.removeAttribute("data-sort-direction");
              }
            });

            rows.sort((a, b) => {
              const aValue = getCellValue(a.cells[columnIndex] as HTMLTableCellElement);
              const bValue = getCellValue(b.cells[columnIndex] as HTMLTableCellElement);
              if (typeof aValue === "number" && typeof bValue === "number") {
                return direction === "asc" ? aValue - bValue : bValue - aValue;
              }
              if (aValue < bValue) return direction === "asc" ? -1 : 1;
              if (aValue > bValue) return direction === "asc" ? 1 : -1;
              return 0;
            });

            rows.forEach((row) => body.appendChild(row));
          });

          controls.appendChild(button);
        });

        toolbar.appendChild(controls);
      }

      wrapper.insertBefore(toolbar, table);

      const body = table.tBodies[0];
      filter.addEventListener("input", () => {
        const query = filter.value.trim().toLowerCase();
        if (!body) return;
        Array.from(body.rows).forEach((row) => {
          const rowText = Array.from(row.cells)
            .map((cell) => cell.textContent?.toLowerCase().trim() || "")
            .join(" ");
          row.style.display = rowText.includes(query) ? "table-row" : "none";
        });
      });

      // Evaluate simple formulas such as =SUM(A2:A5), =AVERAGE(A2:A5), =COUNT(A2:A6)
      if (body) {
        Array.from(body.rows).forEach((row) => {
          Array.from(row.cells).forEach((cell) => {
            const text = getCellText(cell);
            if (text.startsWith("=SUM") || text.startsWith("=AVERAGE") || text.startsWith("=AVG") || text.startsWith("=COUNT")) {
              const result = evaluateFormula(text, table);
              cell.textContent = result;
              cell.dataset.formula = text;
            }
          });
        });
      }
    });
  }, [html]);

  return (
    <div className="prose prose-slate max-w-none rounded-3xl bg-white p-8 shadow-sm" ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
