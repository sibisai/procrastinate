import { api } from "./client";

export const getTasks = () => api.get("/tasks").then(r => r.data);
export const createTask = (title) => api.post("/tasks", { title }).then(r => r.data);
export const generateMicro = (taskId) => api.post(`/tasks/${taskId}/generate`).then(r => r.data);
export const updateMicroStatus = ({ id, status }) =>
  api.patch(`/microsteps/${id}`, { status }).then(r => r.data);
export const getStats = () => api.get("/stats").then(r => r.data);
export const updateTaskStatus = ({ id, status }) =>
  api.patch(`/tasks/${id}`, { status }).then(r => r.data);