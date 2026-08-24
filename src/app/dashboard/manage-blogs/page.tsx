"use client";

import React, { useEffect, useState } from "react";
import { blogApi, mediaUrl } from "@/lib/api";
import { Blog, BlogType } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const emptyForm = {
  topic: "",
  blogTypeId: "",
  summary: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogTypes, setBlogTypes] = useState<BlogType[]>([]);
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
      const [blogRes, typeRes] = await Promise.all([
        blogApi.getAllAdmin(),
        blogApi.getTypes(),
      ]);
      setBlogs(blogRes.blogs);
      setBlogTypes(typeRes.blogTypes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    // pre-select the only category rather than making the author pick from one
    setForm({ ...emptyForm, blogTypeId: blogTypes.length === 1 ? blogTypes[0].id : "" });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (b: Blog) => {
    setEditingId(b.id);
    setForm({
      topic: b.topic,
      blogTypeId: b.blogTypeId,
      summary: b.summary || "",
      description: b.description || "",
      imageUrl: b.imageUrl || "",
      isActive: b.isActive,
    });
    setImageFile(null);
    setImagePreview(mediaUrl(b.imageUrl));
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

    if (!form.blogTypeId) {
      setError("Pick a category for this blog");
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
          imageUrl = await blogApi.uploadImage(imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        topic: form.topic.trim(),
        blogTypeId: form.blogTypeId,
        summary: form.summary.trim(),
        description: form.description,
        imageUrl,
        isActive: form.isActive,
      };

      if (editingId) {
        await blogApi.update(editingId, payload);
      } else {
        await blogApi.create(payload);
      }
      closeForm();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog? This cannot be undone.")) return;
    try {
      await blogApi.remove(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Blogs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Write articles for the public blog. Anything filed under{" "}
            <span className="font-semibold text-slate-700">Health Tips</span> is featured on the
            homepage.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
        >
          + Add Blog
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {!loading && blogTypes.length === 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
          No blog types exist yet. Run <code className="font-mono">npm run db:seed:blog-types</code>{" "}
          on the API to create the default &ldquo;Health Tips&rdquo; category.
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading blogs…</p>
      ) : blogs.length === 0 ? (
        <p className="text-slate-400 text-sm">No blogs yet. Write your first one.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Topic</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Authored by</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {b.imageUrl ? (
                          <img
                            src={mediaUrl(b.imageUrl) ?? undefined}
                            alt={b.topic}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate max-w-xs">{b.topic}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{b.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.blogType?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{b.author?.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(b.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        b.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.isActive ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEditForm(b)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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
              {editingId ? "Edit Blog" : "Add Blog"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Topic</label>
                <input
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Staying Hydrated in the Monsoon"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Category</label>
                <select
                  required
                  value={form.blogTypeId}
                  onChange={(e) => setForm({ ...form, blogTypeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Select a category…</option>
                  {blogTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  rows={2}
                  maxLength={500}
                  placeholder="One or two lines shown on cards and previews."
                />
                <p className="mt-1 text-xs text-slate-400">
                  Optional — the start of the article is used if you leave this blank.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <div className="mt-1">
                  <RichTextEditor
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder="Write the full article…"
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

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Published (visible on the site)
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
                    : "Add Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
