"use client";

import { useFormState, useFormStatus } from "react-dom";
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
      {pending ? "Adding..." : "Add"}
    </button>
  );
}

export function NewCategoryForm() {
  const [state, formAction] = useFormState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          placeholder="e.g. Breakfast, Drinks"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-2"
        />
        <SubmitButton />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}