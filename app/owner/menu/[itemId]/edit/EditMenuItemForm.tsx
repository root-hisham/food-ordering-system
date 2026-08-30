"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";
import { updateMenuItemAction, type EditMenuItemState } from "./actions";

const initialState: EditMenuItemState = {};
const MAX_FILE_SIZE = 15 * 1024 * 1024;

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

interface ItemData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  category_id: string | null;
}

export function EditMenuItemForm({
  item,
  categories,
}: {
  item: ItemData;
  categories: { id: string; name: string }[];
}) {
  const updateWithId = updateMenuItemAction.bind(null, item.id);
  const [state, formAction] = useFormState(updateWithId, initialState);
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(item.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state.success) {
      router.push("/owner/menu");
      router.refresh();
    }
  }, [state.success, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const path = `menu-items/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("public-images").upload(path, compressed);

      if (!error) {
        const { data } = supabase.storage.from("public-images").getPublicUrl(path);
        setImageUrl(data.publicUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {imageUrl && (
        <Image src={imageUrl} alt={item.name} width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input name="name" required defaultValue={item.name} className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={item.description ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Price (₹)</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={item.price}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select name="categoryId" defaultValue={item.category_id ?? ""} className="w-full rounded-xl border border-neutral-300 px-4 py-3">
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="isVeg" id="isVeg" defaultChecked={item.is_veg} className="h-4 w-4" />
        <label htmlFor="isVeg" className="text-sm font-medium">Vegetarian</label>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Replace photo</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploading && <p className="mt-1 text-xs text-neutral-500">Compressing &amp; uploading...</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}