// src/components/StatusChip.tsx
import React from "react";

type Status = "ready" | "no-hands" | "recognizing" | "error";

const statusMap: Record<Status, { label: string; color: string }> = {
  ready: { label: "Ready", color: "bg-green-600" },
  "no-hands": { label: "No Hands Detected", color: "bg-gray-500" },
  recognizing: { label: "Recognizing", color: "bg-indigo-600" },
  error: { label: "Error", color: "bg-red-600" },
};

interface Props {
  status: Status;
}

const StatusChip: React.FC<Props> = ({ status }) => {
  const { label, color } = statusMap[status];
  return (
    <span
      className={`${color} text-white text-xs font-medium px-2 py-1 rounded-full absolute top-2 left-2 shadow`}
    >
      {label}
    </span>
  );
};

export default StatusChip;
