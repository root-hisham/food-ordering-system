"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";
import { createAnnouncementAction, type AnnouncementState } from "./actions";

const initialState: AnnouncementState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Publishing..." : "Publish banner"}
    </button>
  );
}

export function NewAnnouncementForm() {
  const [state, formAction] = useFormState(createAnnouncementAction, initialState);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("That image is too large (max 15MB).");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const compressed = await compressImage(file, 1200, 0.82);
      const supabase = createClient();
      const path = `announcements/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("public-images").upload(path, compressed);

      if (error) {
        setUploadError("Banner upload failed.");
        return;
      }

      const { data } = supabase.storage.from("public-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch {
      setUploadError("Could not process that image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <label className="mb-1 block text-sm font-medium">Banner image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        {imageUrl && !uploading && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-2 h-28 w-full rounded-xl object-cover" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Title (optional)</label>
          <input name="title" placeholder="Combo Offers" className="w-full rounded-xl border border-neutral-300 px-4 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Order</label>
          <input name="sortOrder" type="number" defaultValue={0} className="w-full rounded-xl border border-neutral-300 px-4 py-2" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Subtitle (optional)</label>
        <input
          name="subtitle"
          placeholder="Up to 30% OFF on combos!"
          className="w-full rounded-xl border border-neutral-300 px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Link (optional)</label>
        <input
          name="linkUrl"
          placeholder="https://... (opens when a customer taps the banner)"
          className="w-full rounded-xl border border-neutral-300 px-4 py-2"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
