export default function MicroStepCard({ taskId, ms, onGenerate, onUpdate, isGenerating, updatingMicroId }) {
  if (!ms) {
    return (
      <div className="mt-3">
        <button
          onClick={()=>onGenerate(taskId)}
          disabled={isGenerating}
          aria-busy={isGenerating}
          className={`rounded-full px-3 py-1 text-xs ${isGenerating ? "bg-gray-300 cursor-not-allowed text-gray-700" : "bg-gray-200 text-gray-800"}`}
        >
          {isGenerating ? "Generating…" : "Generate first step"}
        </button>
      </div>
    );
  }

  const isDone = ms.status === "done";
  const isSaving = updatingMicroId === ms.id;

  const frame = `mt-2 p-3 rounded-xl border border-gray-200 ${
    isDone ? "border-l-4 border-l-green-600" : "border-l-4 border-l-transparent"
  }`;

  return (
    <div className={frame}>
      <div className={`text-sm ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
        {ms.text}
      </div>

      <div className="mt-2 flex gap-2">
        {!isDone && (
          <button
            onClick={()=>onUpdate(ms.id,"done")}
            disabled={isSaving}
            aria-busy={isSaving}
            className={`rounded-full px-3 py-1 text-xs ${isSaving ? "bg-green-300 cursor-not-allowed text-white" : "bg-green-600 text-white"}`}
          >
            {isSaving ? "Saving…" : "Mark done"}
          </button>
        )}

        <button
          onClick={()=>onGenerate(taskId)}
          disabled={isGenerating}
          aria-busy={isGenerating}
          className={`rounded-full px-3 py-1 text-xs ${isGenerating ? "bg-gray-300 cursor-not-allowed text-gray-700" : "bg-gray-200 text-gray-800"}`}
        >
          {isGenerating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
}