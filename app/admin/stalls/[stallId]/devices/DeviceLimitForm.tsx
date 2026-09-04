"use client";

import { useFormState, useFormStatus } from "react-dom";
import { setDeviceLimitAction, type DeviceLimitState } from "./actions";

const initialState: DeviceLimitState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export function DeviceLimitForm({ stallId, currentLimit }: { stallId: string; currentLimit: number }) {
  const action = setDeviceLimitAction.bind(null, stallId);
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="mt-3 flex items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Max devices</label>
        <input
          name="deviceLimit"
          type="number"
          min={1}
          max={20}
          defaultValue={currentLimit}
          className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <SaveButton />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}
    </form>
  );
}