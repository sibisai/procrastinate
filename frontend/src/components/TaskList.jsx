import TaskItem from "./TaskItem";
import MicroStepCard from "./MicroStepCard";   // <-- add this

export default function TaskList({
  tasks,
  onGenerate,
  onUpdate,
  onCompleteTask,
  generatingTaskId,
  updatingMicroId,
}) {
  return (
    <ul className="space-y-3">
      {tasks.map(t => {
        const ms = t.latest_microstep;
        const isGenerating = generatingTaskId === t.id;
        return (
          <li key={t.id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.title}</div>
              <button
                onClick={() => onCompleteTask(t.id)}
                className="text-xs px-3 py-1 rounded-full bg-black text-white hover:opacity-90 disabled:opacity-50"
              >
              Complete task
            </button>
            </div>
            <MicroStepCard
              taskId={t.id}
              ms={ms}
              onGenerate={onGenerate}
              onUpdate={onUpdate}
              isGenerating={isGenerating}
              updatingMicroId={updatingMicroId}
            />
          </li>
        );
      })}
    </ul>
  );
}