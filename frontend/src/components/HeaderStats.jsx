export default function HeaderStats({ stats }) {
  const Pill = ({ label, value }) => (
    <div className="text-xs bg-gray-100 px-2 py-1 rounded">{label}: <span className="font-semibold">{value}</span></div>
  );
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">App Name</h1>
      <div className="flex gap-2">
        <Pill label="Tasks" value={stats.tasks} />
        <Pill label="Micro-steps" value={stats.microsteps} />
        <Pill label="Done" value={stats.done_microsteps} />
      </div>
    </header>
  );
}