"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";
import { createCategoryAction, type CategoryState } from "./actions";

const initialState: CategoryState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add chip"}
    </button>
  );
}

export function NewCategoryForm() {
  const [state, formAction] = useFormState(createCategoryAction, initialState);
  const [iconUrl, setIconUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("That image is too large (max 15MB).");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const compressed = await compressImage(file, 200, 0.85);
      const supabase = createClient();
      const path = `categories/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("public-images").upload(path, compressed);

      if (error) {
        setUploadError("Icon upload failed.");
        return;
      }

      const { data } = supabase.storage.from("public-images").getPublicUrl(path);
      setIconUrl(data.publicUrl);
    } catch {
      setUploadError("Could not process that image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
      <input type="hidden" name="iconUrl" value={iconUrl} />

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Chip name</label>
          <input
            name="name"
            required
            placeholder="e.g. Burgers, Momos, Fries"
            className="w-full rounded-xl border border-neutral-300 px-4 py-2"
          />
        </div>
        <div className="w-24">
          <label className="mb-1 block text-sm font-medium">Order</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Icon image</label>
        <div className="flex items-center gap-3">
          {iconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="h-12 w-12 rounded-full border border-neutral-200 object-cover" />
          )}
          <input type="file" accept="image/*" onChange={handleIconChange} />
        </div>
        {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
