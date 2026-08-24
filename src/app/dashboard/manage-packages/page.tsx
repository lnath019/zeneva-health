"use client";

import React, { useEffect, useState } from "react";
import { packageApi, mediaUrl } from "@/lib/api";
import { HealthPackage } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const emptyForm = {
  topic: "",
  activeFrom: "",
  activeTo: "",
  description: "",
  imageUrl: "",
  regularPrice: "",
  packagePrice: "",
  isActive: true,
};

// <input type="date"> speaks YYYY-MM-DD; stored values are timestamps
const toDateInput = (value: string) => new Date(value).toISOString().slice(0, 10);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const isLive = (p: HealthPackage) => {
  const now = Date.now();
  return p.isActive && new Date(p.activeFrom).getTime() <= now && new Date(p.activeTo).getTime() >= now;
};

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await packageApi.getAllAdmin();
      setPackages(res.packages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (p: HealthPackage) => {
    setEditingId(p.id);
    setForm({
      topic: p.topic,
      activeFrom: toDateInput(p.activeFrom),
      activeTo: toDateInput(p.activeTo),
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      regularPrice: String(p.regularPrice),
      packagePrice: String(p.packagePrice),
      isActive: p.isActive,
    });
    setImageFile(null);
    setImagePreview(mediaUrl(p.imageUrl));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm({ ...form, imageUrl: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(form.activeTo) < new Date(form.activeFrom)) {
      setError("Active to must be on or after active from");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let imageUrl = form.imageUrl.trim();

      // if a new file was picked, upload it first and use the returned path
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await packageApi.uploadImage(imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        topic: form.topic.trim(),
        activeFrom: form.activeFrom,
        activeTo: form.activeTo,
        description: form.description,
        imageUrl,
        regularPrice: parseFloat(form.regularPrice),
        packagePrice: parseFloat(form.packagePrice),
        isActive: form.isActive,
      };

      if (editingId) {
        await packageApi.update(editingId, payload);
      } else {
        await packageApi.create(payload);
      }
      closeForm();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package? This cannot be undone.")) return;
    try {
      await packageApi.remove(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  const regularNum = parseFloat(form.regularPrice) || 0;
  const packageNum = parseFloat(form.packagePrice) || 0;
  const liveSavings = Math.max(regularNum - packageNum, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Packages</h1>
          <p className="text-slate-500 text-sm mt-1">
            Packages inside their active window appear on the homepage automatically.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
        >
          + Add Package
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading packages…</p>
      ) : packages.length === 0 ? (
        <p className="text-slate-400 text-sm">No packages yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Package</th>
                <th className="text-left px-4 py-3">Active window</th>
                <th className="text-left px-4 py-3">Regular</th>
                <th className="text-left px-4 py-3">Package price</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {p.imageUrl ? (
                          <img
                            src={mediaUrl(p.imageUrl) ?? undefined}
                            alt={p.topic}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800">{p.topic}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(p.activeFrom)} &ndash; {formatDate(p.activeTo)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 line-through">Rs. {p.regularPrice}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">Rs. {p.packagePrice}</span>
                    {p.savings > 0 && (
                      <span className="ml-2 text-xs font-semibold text-emerald-600">
                        save Rs. {p.savings}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        !p.isActive
                          ? "bg-slate-100 text-slate-500"
                          : isLive(p)
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {!p.isActive ? "Hidden" : isLive(p) ? "Live" : "Out of window"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEditForm(p)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Edit Package" : "Add Package"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Topic</label>
                <input
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Full Body Checkup Package"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Active from</label>
                  <input
                    required
                    type="date"
                    value={form.activeFrom}
                    onChange={(e) => setForm({ ...form, activeFrom: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Active to</label>
                  <input
                    required
                    type="date"
                    min={form.activeFrom || undefined}
                    value={form.activeTo}
                    onChange={(e) => setForm({ ...form, activeTo: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <div className="mt-1">
                  <RichTextEditor
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder="What the package includes…"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Image</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-300 text-xs">No image</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold text-center hover:bg-slate-50">
                      {imagePreview ? "Change Image" : "Choose Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, or GIF. Max 5MB.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Regular price (Rs.)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.regularPrice}
                    onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Package price (Rs.)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.packagePrice}
                    onChange={(e) => setForm({ ...form, packagePrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {liveSavings > 0 && (
                <p className="text-xs text-slate-500">
                  Customer saves <span className="font-bold text-emerald-600">Rs. {liveSavings}</span>{" "}
                  off Rs. {regularNum}
                </p>
              )}

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (show on the site during the window above)
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving
                    ? uploadingImage
                      ? "Uploading image…"
                      : "Saving…"
                    : editingId
                    ? "Save Changes"
                    : "Add Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
