"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createMenuItemAction, type MenuItemState } from "../actions";
import { compressImage } from "@/lib/utils/compress-image";

const initialState: MenuItemState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add Menu Item"}
    </button>
  );
}

export function NewMenuItemForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createMenuItemAction, initialState);
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.push("/owner/menu");
      router.refresh();
    }
  }, [state.success, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

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

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input name="name" required className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" rows={2} className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Price (₹)</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select name="categoryId" className="w-full rounded-xl border border-neutral-300 px-4 py-3">
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="isVeg" id="isVeg" defaultChecked className="h-4 w-4" />
        <label htmlFor="isVeg" className="text-sm font-medium">
          Vegetarian
        </label>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Photo</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
        {imageUrl && !uploading && <p className="mt-1 text-xs text-green-600">Photo uploaded.</p>}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}