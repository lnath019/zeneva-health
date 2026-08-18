"use client";

import React, { useRef, useState } from "react";
import { doctorApi, mediaUrl } from "@/lib/api";
import { Spinner } from "../ui/Spinner";

interface DoctorPhotoProps {
  name: string;
  imageUrl: string | null;
  editable?: boolean;                     // only true on a doctor's own profile
  onChange?: (imageUrl: string) => void;
}

const initialsOf = (name: string) =>
  name.replace(/^Dr\.?\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "").join("") || "DR";

export function DoctorPhoto({ name, imageUrl, editable = false, onChange }: DoctorPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const src = mediaUrl(imageUrl);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";           // allow re-picking the same file
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await doctorApi.uploadImage(file);
      await doctorApi.updateMyProfile({ imageUrl: uploaded });
      setFailed(false);
      onChange?.(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="shrink-0">
      <div
        onClick={editable ? () => inputRef.current?.click() : undefined}
        className={`w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-primary-light overflow-hidden relative flex items-center justify-center text-primary font-bold text-4xl border border-slate-100 ${editable ? "cursor-pointer group" : ""}`}
      >
        {src && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
        ) : (
          initialsOf(name)
        )}

        {editable && (
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
            {isUploading ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Change photo
              </span>
            )}
          </div>
        )}
      </div>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
      )}

      {error && <p className="mt-2 text-xs font-semibold text-rose-600 max-w-36">{error}</p>}
    </div>
  );
}
