"use client";

import React, { useState } from "react";
import { doctorApi } from "@/lib/api";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

interface DoctorAboutProps {
  name: string;
  bio: string | null;
  editable?: boolean;               // true only on the doctor's own profile
  onChange?: (bio: string) => void;
}

const MAX = 2000;
const CLAMP_AT = 420;               // longer bios collapse behind "Read more"

export function DoctorAbout({ name, bio, editable = false, onChange }: DoctorAboutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const isLong = (bio?.length ?? 0) > CLAMP_AT;
  const shown = !bio ? "" : expanded || !isLong ? bio : `${bio.slice(0, CLAMP_AT).trimEnd()}…`;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const next = draft.trim();
      await doctorApi.updateMyProfile({ bio: next || null });
      onChange?.(next);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">About {name.replace(/^Dr\.?\s*/i, "Dr. ")}</h2>
        {editable && !isEditing && (
          <Button size="sm" variant="outline" onClick={() => { setDraft(bio ?? ""); setIsEditing(true); }}>
            {bio ? "Edit" : "Add description"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={save} className="space-y-3">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2.5 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
            rows={6}
            placeholder="Describe your areas of focus, experience and approach to care."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${draft.length > MAX - 100 ? "text-amber-600" : "text-slate-400"}`}>
              {draft.length}/{MAX}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <Spinner size="sm" className="text-white" /> : "Save"}
              </Button>
            </div>
          </div>
        </form>
      ) : bio ? (
        <>
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{shown}</p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400 italic">
          {editable ? "You haven't added a description yet." : "This doctor hasn't added a description yet."}
        </p>
      )}
    </section>
  );
}
