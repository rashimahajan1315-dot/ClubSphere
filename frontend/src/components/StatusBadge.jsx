export default function StatusBadge({ status }) {
  const styles = {
    Applied: "bg-gray-100 text-gray-700",
    "Under Review": "bg-yellow-100 text-yellow-700",
    Shortlisted: "bg-blue-100 text-blue-700",
    Selected: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",

    open: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}