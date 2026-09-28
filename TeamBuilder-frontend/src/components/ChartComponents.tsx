import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface DoughnutProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

export const ProgressDoughnut: React.FC<DoughnutProps> = ({
  value,
  max = 100,
  label = "Progress",
  size = 120,
  color = "#7c3aed",
  bgColor = "#e5e7eb",
}) => {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const remaining = Math.max(100 - percentage, 0);

  const data = {
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [color, bgColor],
        borderWidth: 0,
        borderRadius: 4,
        cutout: "75%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    animation: {
      duration: 800,
    },
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <Doughnut data={data} options={options} />
      <div className="absolute text-center flex flex-col items-center justify-center">
        <span className="font-extrabold text-primary text-sm leading-tight">
          {max === 100 ? `${percentage}%` : `${value}/${max}`}
        </span>
        {label && <span className="text-[10px] text-gray-400 font-medium leading-none">{label}</span>}
      </div>
    </div>
  );
};

interface BarProps {
  completed: number;
  inProgress: number;
  pending: number;
  title?: string;
}

export const TaskActivityBar: React.FC<BarProps> = ({ completed, inProgress, pending, title }) => {
  const data = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        label: "Tasks",
        data: [completed, inProgress, pending],
        backgroundColor: ["#22c55e", "#7c3aed", "#f97316"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: title ? { display: true, text: title, color: "#4b5563", font: { size: 12, weight: "bold" } } : { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 11 } } },
      y: { grid: { color: "#f3f4f6" }, ticks: { stepSize: 1, color: "#6b7280", font: { size: 11 } }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full h-44">
      <Bar data={data} options={options as any} />
    </div>
  );
};

export const ActivityTrendLine: React.FC = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        fill: true,
        label: "Team Activity",
        data: [2, 5, 3, 8, 6, 9, 12],
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.12)",
        tension: 0.4,
        pointBackgroundColor: "#7c3aed",
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 10 } } },
      y: { grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af", font: { size: 10 } }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full h-36">
      <Line data={data} options={options as any} />
    </div>
  );
};

export const MemberDistributionPie: React.FC<{ roles?: { [key: string]: number } }> = ({
  roles = { Leader: 1, Member: 3 },
}) => {
  const labels = Object.keys(roles);
  const values = Object.values(roles);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { boxWidth: 12, font: { size: 11 } } },
    },
  };

  return (
    <div className="w-full h-40">
      <Doughnut data={data} options={options} />
    </div>
  );
};
