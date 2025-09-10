import MicroStepCard from "./MicroStepCard";

export default function TaskItem({ task, onGenerate, onUpdate, onCompleteTask, isGenerating, isCompleting, updatingMicroId }) {
  const ms = task.latest_microstep;
  const done = task.status === "done";
  return (
    <li className={`rounded-2xl border p-4 shadow-sm ${done ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium">{task.title}</div>
        {!done && (
          <button
            onClick={() => onCompleteTask(task.id)}
            disabled={isCompleting}
            aria-busy={isCompleting}
            className={`rounded-full px-3 py-1 text-xs ${isCompleting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-black text-white"}`}
          >
            {isCompleting ? "Completing…" : "Complete task"}
          </button>
        )}
      </div>
      <MicroStepCard
        taskId={task.id}
        ms={ms}
        onGenerate={onGenerate}
        onUpdate={onUpdate}
        isGenerating={isGenerating}
        updatingMicroId={updatingMicroId}
      />
    </li>
  );
}