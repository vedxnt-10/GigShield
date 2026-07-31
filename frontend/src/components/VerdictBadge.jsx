// components/VerdictBadge.jsx — Modern pill badge with status dot
import clsx from "clsx";

export default function VerdictBadge({ verdict }) {
  const label = {
    fair: "Fair",
    borderline: "Borderline",
    underpaid: "Underpaid",
  }[verdict] ?? verdict;

  return (
    <span
      className={clsx("badge", {
        "badge-fair": verdict === "fair",
        "badge-borderline": verdict === "borderline",
        "badge-underpaid": verdict === "underpaid",
      })}
    >
      {label}
    </span>
  );
}
