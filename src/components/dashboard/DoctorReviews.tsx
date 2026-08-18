"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { reviewApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { StarRating } from "../ui/StarRating";
import { DoctorReview, RatingSummary } from "@/types";

interface DoctorReviewsProps {
  doctorId: string;
  summary: RatingSummary;
  onSummaryChange?: (summary: RatingSummary) => void;
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function DoctorReviews({ doctorId, summary, onSummaryChange }: DoctorReviewsProps) {
  const { token } = useAuth();

  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [stats, setStats] = useState<RatingSummary>(summary);
  const [isLoading, setIsLoading] = useState(true);

  // eligibility comes from the server — the same rule the POST enforces
  const [canReview, setCanReview] = useState(false);
  const [hasVisit, setHasVisit] = useState(false);
  const [myReview, setMyReview] = useState<DoctorReview | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Held in a ref because callers pass an inline arrow, which changes identity
  // on every parent render. Depending on it directly would re-create
  // applySummary -> loadReviews -> re-fire the load effect -> update the parent
  // -> repeat, leaving the list spinning forever.
  const onSummaryChangeRef = useRef(onSummaryChange);
  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
  }, [onSummaryChange]);

  const applySummary = useCallback((next: RatingSummary) => {
    setStats(next);
    onSummaryChangeRef.current?.(next);
  }, []);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reviewApi.listForDoctor(doctorId);
      setReviews(res.reviews);
      applySummary(res.summary);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, applySummary]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!token) {
      setCanReview(false);
      setMyReview(null);
      setHasVisit(false);
      return;
    }
    reviewApi
      .myEligibility(doctorId)
      .then((e) => {
        setCanReview(e.canReview);
        setHasVisit(e.hasCompletedVisit);
        setMyReview(e.myReview);
        if (e.myReview) {
          setRating(e.myReview.rating);
          setComment(e.myReview.comment ?? "");
        }
      })
      .catch(() => setCanReview(false));
  }, [doctorId, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const res = myReview
        ? await reviewApi.update(myReview.id, { rating, comment })
        : await reviewApi.create(doctorId, rating, comment);
      setMyReview(res.review);
      setCanReview(false);
      setIsFormOpen(false);
      applySummary(res.summary);
      await loadReviews();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!myReview) return;
    setIsSaving(true);
    try {
      const res = await reviewApi.remove(myReview.id);
      setMyReview(null);
      setCanReview(hasVisit);
      setRating(5);
      setComment("");
      applySummary(res.summary);
      await loadReviews();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setIsSaving(false);
    }
  };

  const total = stats.total || 0;
  const distribution = stats.distribution ?? {};

  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          Patient Reviews {total > 0 && <span className="text-slate-400 font-semibold">({total})</span>}
        </h2>
        {(canReview || myReview) && !isFormOpen && (
          <Button size="sm" variant={myReview ? "outline" : undefined} onClick={() => setIsFormOpen(true)}>
            {myReview ? "Edit your review" : "Write a review"}
          </Button>
        )}
      </div>

      {/* score + distribution */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 pb-5 mb-5 border-b border-slate-100">
          <div className="text-center shrink-0">
            <p className="text-4xl font-extrabold text-slate-900">{stats.average.toFixed(1)}</p>
            <StarRating value={stats.average} className="mt-1" />
            <p className="text-xs text-slate-400 mt-1">{total} review{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = Number(distribution[String(star)] ?? 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-slate-500 tabular-nums">{star}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* write / edit form */}
      {isFormOpen && (
        <form onSubmit={submit} className="border border-slate-100 rounded-xl p-4 mb-5 space-y-3 bg-slate-50/60">
          {formError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2.5 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your rating</label>
            <StarRating value={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Your review <span className="font-medium normal-case text-slate-400">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="How was your consultation?"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            {myReview && (
              <Button type="button" variant="outline" onClick={remove} disabled={isSaving}>
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner size="sm" className="text-white" /> : myReview ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      )}

      {/* why the form isn't offered */}
      {token && !canReview && !myReview && !hasVisit && (
        <p className="text-xs text-slate-400 mb-4">
          You can leave a review after a completed appointment with this doctor.
        </p>
      )}

      {/* list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {reviews.map((r) => (
            <li key={r.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                  {(r.patient?.fullName ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-slate-800">{r.patient?.fullName ?? "Patient"}</p>
                    {myReview?.id === r.id && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{formatWhen(r.createdAt)}</span>
                  </div>
                  <StarRating value={r.rating} size="sm" className="mt-1" />
                  {r.comment && <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line">{r.comment}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
