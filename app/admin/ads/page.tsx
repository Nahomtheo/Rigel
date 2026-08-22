"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Power, ExternalLink } from "lucide-react";
import LogoLoader from "@/app/components/LogoLoader";

type Ad = {
  _id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
  createdAt: string;
};

export default function ManageAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setAds(data.data);
    } catch {
      setError("Failed to load ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return "";
    setUploading(true);
    try {
      const resp = await fetch("/api/cloudflare-r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ name: imageFile.name, type: imageFile.type }],
        }),
      });
      const data = await resp.json();

      const img = data.data[0] as { UploadUrl: string; key: string };
      await fetch(img.UploadUrl, {
        method: "PUT",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });

      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img.key}`;
    } finally {
      setUploading(false);
    }
  };

  const createAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!imageFile && !imagePreview)) {
      setError("Title and image are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let image = imagePreview;
      if (imageFile) {
        image = await uploadImage();
      }

      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          link: link.trim(),
          image,
          active: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create ad");
        return;
      }

      setTitle("");
      setLink("");
      setImageFile(null);
      setImagePreview("");
      fetchAds();
    } catch {
      setError("Failed to create ad");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      await fetch(`/api/admin/ads/${ad._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !ad.active }),
      });
      fetchAds();
    } catch {
      setError("Failed to update ad");
    }
  };

  const deleteAd = async (ad: Ad) => {
    if (!window.confirm(`Delete ad "${ad.title}"?`)) return;
    try {
      await fetch(`/api/admin/ads/${ad._id}`, { method: "DELETE" });
      fetchAds();
    } catch {
      setError("Failed to delete ad");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            Back to admin
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Manage Ads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create ad posters that appear in the listing section of the site.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create Ad */}
        <form
          onSubmit={createAd}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900">New Ad Poster</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Special offer from XYZ Motors"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link (optional)
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Poster Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {imagePreview ? (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <Image src={imagePreview} alt="Poster preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-48 aspect-video rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                  No image selected
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {saving || uploading ? "Saving..." : "Create Ad"}
          </button>
        </form>

        {/* Ad List */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_200px_auto] gap-4 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500">
            <span>Poster</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <LogoLoader label="Loading..." fullScreen={false} />
          ) : ads.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No ads yet. Create your first ad poster above.
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad._id}
                className="grid grid-cols-[1fr_200px_auto] gap-4 border-b border-slate-100 px-5 py-4 text-sm items-center last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    <Image src={ad.image} alt={ad.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950 truncate">{ad.title}</p>
                    {ad.link && (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ad.link}
                      </a>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                    ad.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {ad.active ? "Active" : "Inactive"}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(ad)}
                    title={ad.active ? "Deactivate" : "Activate"}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAd(ad)}
                    title="Delete"
                    className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
