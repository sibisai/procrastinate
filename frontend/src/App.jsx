import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, getStats, createTask, generateMicro, updateMicroStatus, updateTaskStatus } from "./api/endpoints";
import HeaderStats from "./components/HeaderStats";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const qc = useQueryClient();

  // POLLING TASKS UNTIL latest_microstep EXISTS
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    // IMPORTANT: 'refetchInterval' gets the query observer, not data
    refetchInterval: (query) => {
      const data = query.state.data;
      const waiting = Array.isArray(data) && data.some(t => !t.latest_microstep);
      if (!waiting) return false;     // stop polling when all have a step
      return 2000;                    // poll every 2s while waiting
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
        generatingTaskId={generateMut.isPending ? (generateMut.variables ?? null) : null}
        updatingMicroId={updateStatusMut.isPending ? updateStatusMut.variables?.id : null}
      />
      <Analytics />
    </div>
  );
}