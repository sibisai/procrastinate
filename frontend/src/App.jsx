import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, getStats, createTask, generateMicro, updateMicroStatus, updateTaskStatus } from "./api/endpoints";
import HeaderStats from "./components/HeaderStats";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";

export default function App() {
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const { data: stats = { active_tasks: 0 } } =
  useQuery({ queryKey: ["stats"], queryFn: getStats });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey:["tasks"] });
    qc.invalidateQueries({ queryKey:["stats"] });
  };

  const addTaskMut = useMutation({
    mutationFn: async (title) => {
      const t = await createTask(title);
      await generateMicro(t.id);
      return t;
    },
    onSuccess: invalidate
  });

  const generateMut = useMutation({
    mutationFn: (taskId) => generateMicro(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey:["tasks"] }),
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ id, status }) => updateTaskStatus({ id, status }),
    onSuccess: invalidate
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => updateMicroStatus({ id, status }),
    onSuccess: invalidate
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <HeaderStats stats={stats} />
      <AddTask
        onAdd={(title) => addTaskMut.mutate(title)}
        isAdding={addTaskMut.isPending}
      />
      <TaskList
        tasks={tasks.filter(t => t.status === "open")}
        onGenerate={(taskId) => generateMut.mutate(taskId)}
        onUpdate={(id,status) => updateStatusMut.mutate({ id, status })}
        onCompleteTask={(taskId) => updateTaskMut.mutate({ id: taskId, status: "done" })}
        generatingId={generateMut.isPending ? generateMut.variables : null}
        updatingMicroId={updateStatusMut.isPending ? updateStatusMut.variables?.id : null}
        completingTaskId={updateTaskMut.isPending ? updateTaskMut.variables?.id : null}
        />

    </div>
  );
}