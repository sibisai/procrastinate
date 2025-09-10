import { useState } from "react";

export default function AddTask({ onAdd, isAdding }) {
  const [title, setTitle] = useState("");
  const submit = (e) => { e.preventDefault(); const t = title.trim(); if (!t || isAdding) return; onAdd(t); setTitle(""); };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        autoFocus value={title} onChange={(e)=>setTitle(e.target.value)}
        placeholder="Add task…" className="w-full border rounded-lg px-3 py-2"
        disabled={isAdding} aria-busy={isAdding}
      />
      <button
        type="submit" disabled={isAdding}
        className={"px-3 py-2 rounded-lg text-white " + (isAdding ? "bg-gray-500 cursor-not-allowed" : "bg-black")}
      >
        {isAdding ? "Adding…" : "Add"}
      </button>
    </form>
  );
}