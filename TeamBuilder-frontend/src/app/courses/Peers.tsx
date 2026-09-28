import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPeersAccount } from "@/lib/courseApis";
import { Search, Mail } from "lucide-react";

interface Peer {
  id: string;
  name: string;
  email: string;
  role?: string;
  teamStatus?: string;
  skills?: string[];
  avatarColor?: string;
}

const DEFAULT_PEERS: Peer[] = [
  {
    id: "1",
    name: "Aryan Kumar",
    email: "aryan.kumar@university.edu",
    role: "Team Lead (Team Alpha)",
    teamStatus: "In Team Alpha",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    avatarColor: "bg-purple-500",
  },
  {
    id: "2",
    name: "Bhavna Rao",
    email: "bhavna.rao@university.edu",
    role: "Team Lead (Team Phoenix)",
    teamStatus: "In Team Phoenix",
    skills: ["Java", "Spring Boot", "PostgreSQL"],
    avatarColor: "bg-blue-500",
  },
  {
    id: "3",
    name: "Chirag Lal",
    email: "chirag.lal@university.edu",
    role: "Member (Team Alpha)",
    teamStatus: "In Team Alpha",
    skills: ["Python", "PyTorch", "Docker"],
    avatarColor: "bg-green-500",
  },
  {
    id: "4",
    name: "Divya Mehta",
    email: "divya.mehta@university.edu",
    role: "Seeking Team",
    teamStatus: "Looking for Team",
    skills: ["Figma", "React", "Tailwind CSS"],
    avatarColor: "bg-pink-500",
  },
  {
    id: "5",
    name: "Eshaan Verma",
    email: "eshaan.v@university.edu",
    role: "Seeking Team",
    teamStatus: "Looking for Team",
    skills: ["Express", "GraphQL", "Redis"],
    avatarColor: "bg-orange-500",
  },
];

const Peers: React.FC = () => {
  const { coursesId } = useParams<{ coursesId?: string }>();
  const [peers, setPeers] = useState<Peer[]>(DEFAULT_PEERS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (coursesId) {
      fetchPeers(coursesId);
    }
  }, [coursesId]);

  const fetchPeers = async (cId: string) => {
    try {
      const res = await getPeersAccount(cId);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setPeers(res.data);
      }
    } catch (err) {
      console.log("Using default fallback peers:", err);
    }
  };

  const filteredPeers = peers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.skills && p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="p-6 font-sans space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Course Peers & Classmates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect with registered students, find team members with matching skillsets, or reach out to peers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search peers by name, email, or skill (e.g. React, Java)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
          />
        </div>
      </div>

      {/* Peers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPeers.map((p) => {
          const initials = p.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
          const isLooking = p.teamStatus?.includes("Looking");

          return (
            <div
              key={p.id}
              className="bg-card rounded-2xl border border-border hover:border-purple-300 transition-all p-5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      p.avatarColor || "bg-purple-500"
                    } text-white flex items-center justify-center font-extrabold text-sm shrink-0 ring-2 ring-purple-100 dark:ring-purple-900`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-primary truncate">{p.name}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                      {p.email}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLooking
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}
                    >
                      {p.teamStatus || "Enrolled Student"}
                    </span>
                  </div>
                </div>

                {/* Skills Badges */}
                <div className="space-y-1.5 mt-3">
                  <span className="text-[11px] font-semibold text-gray-400 block">Skills & Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.skills || ["JavaScript", "HTML/CSS", "Git"]).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium bg-background border border-border px-2 py-0.5 rounded-lg text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-gray-400">{p.role || "Student"}</span>
                <a
                  href={`mailto:${p.email}`}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Peers;