"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";
import { updateStallAction, type EditStallState } from "./actions";
import type { Category } from "@/types/category";

const initialState: EditStallState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

interface StallData {
  id: string;
  name: string;
  category: string | null;
  category_id: string | null;
  description: string | null;
  logo_url: string | null;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function EditStallForm({ stall, categories }: { stall: StallData; categories: Category[] }) {
  const updateWithId = updateStallAction.bind(null, stall.id);
  const [state, formAction] = useFormState(updateWithId, initialState);
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(stall.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state.success) {
      router.push("/admin/stalls");
      router.refresh();
    }
  }, [state.success, router]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("That image is too large (max 15MB) — try a smaller photo.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const compressed = await compressImage(file);
      const supabase = createClient();
      const path = `stalls/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("public-images").upload(path, compressed);

      if (error) {
        setUploadError("Logo upload failed.");
        return;
      }

      const { data } = supabase.storage.from("public-images").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } catch {
      setUploadError("Could not process that image — try a different photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="logoUrl" value={logoUrl} />

      {logoUrl && (
        <Image src={logoUrl} alt="Current logo" width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Stall name</label>
        <input
          name="stallName"
          required
          defaultValue={stall.name}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <input
          name="category"
          required
          defaultValue={stall.category ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Home page chip</label>
        <select
          name="categoryId"
          defaultValue={stall.category_id ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        >
          <option value="">None — not tied to a chip</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={stall.description ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Replace logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {uploading && <p className="mt-1 text-xs text-neutral-500">Compressing &amp; uploading...</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}