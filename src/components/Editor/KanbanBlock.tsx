"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ------------------------------------------------------------------ //
// Types
// ------------------------------------------------------------------ //

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
}

// ------------------------------------------------------------------ //
// Card component
// ------------------------------------------------------------------ //

function Card({
  card,
  columnId,
  readOnly,
  onEdit,
  onDelete,
}: {
  card: KanbanCard;
  columnId: string;
  readOnly: boolean;
  onEdit: (columnId: string, card: KanbanCard) => void;
  onDelete: (columnId: string, cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "card", columnId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 shadow-sm cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
          {card.title}
        </span>
        {!readOnly && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(columnId, card);
              }}
              className="text-slate-400 hover:text-blue-500 transition text-xs px-1"
              title="Edit card"
            >
              ✎
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(columnId, card.id);
              }}
              className="text-slate-400 hover:text-red-500 transition text-xs px-1"
              title="Delete card"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {card.description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {card.description}
        </p>
      )}
      {card.labels && card.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label}
              className="inline-block px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Card ghost (DragOverlay)
// ------------------------------------------------------------------ //

function CardGhost({ card }: { card: KanbanCard }) {
  return (
    <div className="rounded-lg border border-blue-400 bg-white dark:bg-slate-700 p-3 shadow-xl opacity-95 rotate-1 w-56">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{card.title}</span>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Column component
// ------------------------------------------------------------------ //

function Column({
  column,
  readOnly,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
}: {
  column: KanbanColumn;
  readOnly: boolean;
  onAddCard: (columnId: string) => void;
  onEditCard: (columnId: string, card: KanbanCard) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);

  const cardIds = column.cards.map((c) => c.id);

  function commitTitle() {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleDraft(column.title);
    }
  }

  return (
    <div className="flex flex-col w-64 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        {editingTitle && !readOnly ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
            className="flex-1 rounded px-2 py-1 text-sm font-semibold bg-white dark:bg-slate-700 border border-blue-400 outline-none text-slate-800 dark:text-slate-100"
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition truncate"
            onDoubleClick={() => !readOnly && setEditingTitle(true)}
            title={readOnly ? column.title : "Double-click to rename"}
          >
            {column.title}
          </button>
        )}
        <span className="text-xs text-slate-400 shrink-0">{column.cards.length}</span>
        {!readOnly && (
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-slate-400 hover:text-red-500 transition text-xs shrink-0"
            title="Delete column"
          >
            ✕
          </button>
        )}
      </div>

      {/* Cards list */}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[2rem]">
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              readOnly={readOnly}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add card */}
      {!readOnly && (
        <button
          onClick={() => onAddCard(column.id)}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-300 dark:border-slate-600 py-2 text-xs text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 transition"
        >
          + Add card
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Card edit modal
// ------------------------------------------------------------------ //

function CardModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<KanbanCard>;
  onSave: (card: Omit<KanbanCard, "id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [labelsRaw, setLabelsRaw] = useState((initial.labels ?? []).join(", "));

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const labels = labelsRaw
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    onSave({ title: trimmed, description: description.trim() || undefined, labels });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {initial.id ? "Edit card" : "New card"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Title *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              placeholder="Card title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Labels (comma-separated)
            </label>
            <input
              value={labelsRaw}
              onChange={(e) => setLabelsRaw(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              placeholder="e.g. bug, feature, urgent"
            />
          </div>
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
            disabled={!title.trim()}
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
// KanbanBlock — main export
// ------------------------------------------------------------------ //

let idCounter = Date.now();
function uid() {
  return `k${(idCounter++).toString(36)}`;
}

export interface KanbanBlockProps {
  data: KanbanBoardData;
  readOnly?: boolean;
  onChange?: (data: KanbanBoardData) => void;
}

export function KanbanBlock({ data, readOnly = false, onChange }: KanbanBlockProps) {
  const [board, setBoard] = useState<KanbanBoardData>(data);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    columnId: string;
    card?: KanbanCard;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const update = useCallback(
    (next: KanbanBoardData) => {
      setBoard(next);
      onChange?.(next);
    },
    [onChange]
  );

  // Find which column contains a card
  function findColumn(cardId: string) {
    return board.columns.find((col) => col.cards.some((c) => c.id === cardId));
  }

  function findCard(cardId: string) {
    for (const col of board.columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    if (active.data.current?.type === "card") {
      setActiveCardId(active.id as string);
    }
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    if (!activeCol) return;

    // Dropping over a column (empty area)
    const overCol = board.columns.find((c) => c.id === overId);
    if (overCol && overCol.id !== activeCol.id) {
      setBoard((prev) => {
        const cols = prev.columns.map((col) => {
          if (col.id === activeCol.id) {
            return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
          }
          if (col.id === overCol.id) {
            const card = activeCol.cards.find((c) => c.id === activeId)!;
            return { ...col, cards: [...col.cards, card] };
          }
          return col;
        });
        return { ...prev, columns: cols };
      });
      return;
    }

    // Dropping over another card
    const overCol2 = findColumn(overId);
    if (!overCol2) return;
    if (activeCol.id === overCol2.id) return; // same column, handled on DragEnd

    setBoard((prev) => {
      const card = activeCol.cards.find((c) => c.id === activeId)!;
      const overIndex = overCol2.cards.findIndex((c) => c.id === overId);
      const cols = prev.columns.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        }
        if (col.id === overCol2.id) {
          const newCards = [...col.cards];
          newCards.splice(overIndex, 0, card);
          return { ...col, cards: newCards };
        }
        return col;
      });
      return { ...prev, columns: cols };
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCardId(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCol = findColumn(activeId);
    const overCol = findColumn(overId);
    if (!activeCol || !overCol || activeCol.id !== overCol.id) return;

    const oldIndex = activeCol.cards.findIndex((c) => c.id === activeId);
    const newIndex = activeCol.cards.findIndex((c) => c.id === overId);
    if (oldIndex === newIndex) return;

    const cols = board.columns.map((col) => {
      if (col.id !== activeCol.id) return col;
      return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
    });
    update({ ...board, columns: cols });
  }

  function addColumn() {
    const title = prompt("Column name:");
    if (!title?.trim()) return;
    update({
      ...board,
      columns: [...board.columns, { id: uid(), title: title.trim(), cards: [] }],
    });
  }

  function deleteColumn(columnId: string) {
    update({ ...board, columns: board.columns.filter((c) => c.id !== columnId) });
  }

  function renameColumn(columnId: string, title: string) {
    update({
      ...board,
      columns: board.columns.map((c) => (c.id === columnId ? { ...c, title } : c)),
    });
  }

  function openAddCard(columnId: string) {
    setModal({ columnId });
  }

  function openEditCard(columnId: string, card: KanbanCard) {
    setModal({ columnId, card });
  }

  function saveCard(cardData: Omit<KanbanCard, "id">) {
    if (!modal) return;
    const { columnId, card: existing } = modal;

    if (existing) {
      // Edit
      update({
        ...board,
        columns: board.columns.map((col) =>
          col.id !== columnId
            ? col
            : {
                ...col,
                cards: col.cards.map((c) =>
                  c.id === existing.id ? { ...c, ...cardData } : c
                ),
              }
        ),
      });
    } else {
      // Add
      update({
        ...board,
        columns: board.columns.map((col) =>
          col.id !== columnId
            ? col
            : { ...col, cards: [...col.cards, { id: uid(), ...cardData }] }
        ),
      });
    }
    setModal(null);
  }

  function deleteCard(columnId: string, cardId: string) {
    update({
      ...board,
      columns: board.columns.map((col) =>
        col.id !== columnId
          ? col
          : { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
      ),
    });
  }

  const activeCard = activeCardId ? findCard(activeCardId) : null;

  return (
    <div className="kanban-block my-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              readOnly={readOnly}
              onAddCard={openAddCard}
              onEditCard={openEditCard}
              onDeleteCard={deleteCard}
              onRenameColumn={renameColumn}
              onDeleteColumn={deleteColumn}
            />
          ))}

          {!readOnly && (
            <button
              onClick={addColumn}
              className="flex h-12 w-64 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 transition self-start"
            >
              + Add column
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? <CardGhost card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {modal && (
        <CardModal
          initial={modal.card ?? {}}
          onSave={saveCard}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Default empty board factory
// ------------------------------------------------------------------ //

export function defaultKanbanData(): KanbanBoardData {
  return {
    columns: [
      { id: uid(), title: "To Do", cards: [] },
      { id: uid(), title: "In Progress", cards: [] },
      { id: uid(), title: "Done", cards: [] },
    ],
  };
}
