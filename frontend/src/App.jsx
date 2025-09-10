import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, getStats, createTask, generateMicro, updateMicroStatus, updateTaskStatus } from "./api/endpoints";
import HeaderStats from "./components/HeaderStats";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";

export default function App() {
  const qc = useQueryClient();

  // POLLING TASKS UNTIL latest_microstep EXISTS
  const tasksQuery = useQuery({
  queryKey: ["tasks"],
  queryFn: getTasks,
  staleTime: 500,
  refetchOnWindowFocus: false,
  refetchInterval: (data) => {
    // data can be undefined or non-array until resolved
    if (!Array.isArray(data)) return false;
    return data.some(t => !t.latest_microstep) ? 1000 : false;
  },
  });

  const tasks = tasksQuery.data ?? [];

  const { data: stats = { active_tasks: 0 } } =
  useQuery({ queryKey: ["stats"], queryFn: getStats });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey:["tasks"] });
    qc.invalidateQueries({ queryKey:["stats"] });
  };

  const burst = () => {
    qc.invalidateQueries({ queryKey:["tasks"] });
    setTimeout(() => qc.invalidateQueries({ queryKey:["tasks"] }), 1200);
    setTimeout(() => qc.invalidateQueries({ queryKey:["tasks"] }), 3000);
  };

  const addTaskMut = useMutation({
    mutationFn: (title) => createTask(title),
    onSuccess: () => { burst(); },
  });

  const generateMut = useMutation({
    mutationFn: (taskId) => generateMicro(taskId),
    onSuccess: () => { burst(); },
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
        generatingTaskId={generateMut.isPending ? generateMut.variables : null}
        updatingMicroId={updateStatusMut.isPending ? updateStatusMut.variables?.id : null}
      />

    </div>
  );
}