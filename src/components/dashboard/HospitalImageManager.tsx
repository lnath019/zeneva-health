"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { hospitalApi, mediaUrl } from "@/lib/api";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { HospitalImage } from "@/types";

interface HospitalImageManagerProps {
  hospitalId: string;
  coverUrl: string | null;
  /** Called after any change so the parent can refresh its own copy. */
  onChange?: (images: HospitalImage[], coverUrl: string | null) => void;
}

export function HospitalImageManager({ hospitalId, coverUrl, onChange }: HospitalImageManagerProps) {
  const [images, setImages] = useState<HospitalImage[]>([]);
  const [cover, setCover] = useState<string | null>(coverUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(0);          // files still in flight
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // the parent callback is often an inline arrow — holding it in a ref keeps
  // load() stable so the effect below doesn't re-fire on every parent render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await hospitalApi.listImages(hospitalId);
      setImages(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    load();
  }, [load]);

  const publish = (list: HospitalImage[], nextCover: string | null) => {
    setImages(list);
    setCover(nextCover);
    onChangeRef.current?.(list, nextCover);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";                    // allow re-picking the same file
    if (files.length === 0) return;

    setError(null);
    setUploading(files.length);
    let firstFailure: string | null = null;

    // sequential, so sortOrder on the server stays in the order picked
    for (const file of files) {
      try {
        await hospitalApi.addImage(hospitalId, file);
      } catch (err) {
        if (!firstFailure) firstFailure = err instanceof Error ? err.message : "Upload failed";
      } finally {
        setUploading((n) => n - 1);
      }
    }

    const list = await hospitalApi.listImages(hospitalId);
    // the first upload onto an empty gallery becomes the cover server-side
    publish(list, cover ?? list[0]?.imageUrl ?? null);
    if (firstFailure) setError(firstFailure);
  };

  const makeCover = async (image: HospitalImage) => {
    setBusyId(image.id);
    setError(null);
    try {
      await hospitalApi.updateImage(hospitalId, image.id, { isCover: true });
      publish(images, image.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set cover");
    } finally {
      setBusyId(null);
    }
  };

  const saveCaption = async (image: HospitalImage) => {
    setBusyId(image.id);
    setError(null);
    try {
      const res = await hospitalApi.updateImage(hospitalId, image.id, { caption: captionDraft.trim() || null });
      publish(images.map((i) => (i.id === image.id ? res.image : i)), cover);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save caption");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (image: HospitalImage) => {
    setBusyId(image.id);
    setError(null);
    try {
      await hospitalApi.deleteImage(hospitalId, image.id);
      const list = await hospitalApi.listImages(hospitalId);
      // deleting the cover promotes the next image server-side
      const nextCover = image.imageUrl === cover ? list[0]?.imageUrl ?? null : cover;
      publish(list, nextCover);
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Photos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {images.length === 0
              ? "No photos yet — the first one you add becomes the cover"
              : `${images.length} photo${images.length !== 1 ? "s" : ""} · the cover appears on directory cards`}
          </p>
        </div>
        <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading > 0}>
          {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-12 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/60 transition-colors text-center"
        >
          <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l5-5 4 4 3-3 6 6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm font-semibold text-slate-600">Add the first photo</p>
          <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP or GIF · up to 5MB each</p>
        </button>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => {
            const isCover = image.imageUrl === cover;
            const isBusy = busyId === image.id;
            const src = mediaUrl(image.imageUrl);

            return (
              <li key={image.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="relative h-32 bg-slate-100">
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={image.caption ?? "Hospital photo"} className="w-full h-full object-cover" />
                  )}
                  {isCover && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white bg-primary px-2 py-0.5 rounded-md shadow-sm">
                      Cover
                    </span>
                  )}
                  {isBusy && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>

                <div className="p-3">
                  {editingId === image.id ? (
                    <div className="space-y-2">
                      <input
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value.slice(0, 200))}
                        placeholder="Caption"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => saveCaption(image)} disabled={isBusy}>Save</Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingId(null)} disabled={isBusy}>Cancel</Button>
                      </div>
                    </div>
                  ) : confirmId === image.id ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700">Delete this photo?</p>
                      {isCover && images.length > 1 && (
                        <p className="text-[11px] text-amber-600">The next photo will become the cover.</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => remove(image)} disabled={isBusy}>Delete</Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmId(null)} disabled={isBusy}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-600 truncate" title={image.caption ?? undefined}>
                        {image.caption || <span className="text-slate-400 italic">No caption</span>}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => makeCover(image)}
                            disabled={isBusy}
                            className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                          >
                            Set as cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditingId(image.id); setCaptionDraft(image.caption ?? ""); }}
                          disabled={isBusy}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50"
                        >
                          Edit caption
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(image.id)}
                          disabled={isBusy}
                          className="text-[11px] font-semibold text-rose-600 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
