import { CheckCircle, XCircle } from "lucide-react";

export default function AlertMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const bg =
    type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in`}
    >
      <Icon className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}
