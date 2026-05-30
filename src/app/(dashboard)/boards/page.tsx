"use client";

import { useState } from "react";
import { KanbanBlock, defaultKanbanData, KanbanBoardData } from "@/components/Editor/KanbanBlock";
import { AdvancedTable, defaultTableData, AdvancedTableData } from "@/components/Editor/AdvancedTable";

export default function BoardsPage() {
  const [kanbanData, setKanbanData] = useState<KanbanBoardData>(defaultKanbanData);
  const [tableData, setTableData] = useState<AdvancedTableData>(defaultTableData);
  const [activeTab, setActiveTab] = useState<"kanban" | "table">("kanban");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Boards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kanban boards and advanced tables for project management.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "kanban"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Kanban board
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "table"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Advanced table
        </button>
      </div>

      {activeTab === "kanban" ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
          <KanbanBlock data={kanbanData} onChange={setKanbanData} />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <AdvancedTable data={tableData} onChange={setTableData} />
        </div>
      )}
    </div>
  );
}
