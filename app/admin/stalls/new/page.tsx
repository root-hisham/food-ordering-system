"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createStallAction, type CreateStallState } from "../actions";
import { compressImage } from "@/lib/utils/compress-image";

const initialState: CreateStallState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create Stall & Owner Account"}
    </button>
  );
}

export default function NewStallPage() {
  const [state, formAction] = useFormState(createStallAction, initialState);
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("");
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

    setUploading(true);
    setUploadError("");

    try {
      const compressed = await compressImage(file);
      const supabase = createClient();
      const path = `stalls/${Date.now()}-${compressed.name}`;
      const { error } = await supabase.storage.from("public-images").upload(path, compressed);

      if (error) {
        setUploadError("Logo upload failed. You can still create the stall without one.");
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
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">New Stall</h1>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="logoUrl" value={logoUrl} />

        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-500">Stall details</legend>
          <div>
            <label className="mb-1 block text-sm font-medium">Stall name</label>
            <input name="stallName" required className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              name="category"
              required
              placeholder="e.g. Fast Food, Beverages, Meals"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea name="description" rows={2} className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
            {logoUrl && !uploading && <p className="mt-1 text-xs text-green-600">Logo uploaded.</p>}
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-500">
            Owner account (owner will log in with this email)
          </legend>
          <div>
            <label className="mb-1 block text-sm font-medium">Owner name</label>
            <input name="ownerName" required className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Owner mobile</label>
            <input
              name="ownerMobile"
              required
              pattern="\d{10}"
              placeholder="9876543210"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Owner email</label>
            <input name="ownerEmail" type="email" required className="w-full rounded-xl border border-neutral-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Temporary password</label>
            <input
              name="ownerPassword"
              type="text"
              required
              minLength={6}
              placeholder="Share this with the owner securely"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            />
          </div>
        </fieldset>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>
    </div>
  );
}