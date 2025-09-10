import TaskItem from "./TaskItem";
export default function TaskList({ tasks, onGenerate, onUpdate, onCompleteTask, generatingId, updatingMicroId, completingTaskId }) {
  if (!tasks.length) return <p className="text-center text-gray-500 mt-8">No tasks yet.</p>;
  return (
    <ul className="space-y-3">
      {tasks.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          onGenerate={onGenerate}
          onUpdate={onUpdate}
          onCompleteTask={onCompleteTask}
          isGenerating={generatingId === t.id}
          isCompleting={completingTaskId === t.id}
          updatingMicroId={updatingMicroId}
        />
      ))}
    </ul>
  );
}