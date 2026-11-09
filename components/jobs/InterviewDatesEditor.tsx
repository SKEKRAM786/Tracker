'use client';

import React from 'react';
import { InterviewDateItem } from '@/lib/types';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { getTodayDateString } from '@/lib/date-utils';

interface InterviewDatesEditorProps {
  items: InterviewDateItem[];
  onChange: (items: InterviewDateItem[]) => void;
}

export function InterviewDatesEditor({ items, onChange }: InterviewDatesEditorProps) {
  const handleAdd = () => {
    const newItem: InterviewDateItem = {
      id: Math.random().toString(36).substring(2, 9),
      date: getTodayDateString(),
      note: 'Technical Screen',
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (index: number, field: keyof InterviewDateItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Interview Rounds & Dates
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Round</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No interview dates added yet. Click &ldquo;Add Round&rdquo; when scheduled.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <div className="w-36 shrink-0">
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => handleUpdate(index, 'date', e.target.value)}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="e.g. Recruiter phone screen, System design..."
                  value={item.note}
                  onChange={(e) => handleUpdate(index, 'note', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title="Remove round"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

