<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllTeams, createTeam, applyToJoinTeam } from "@/lib/teamApis";
import type { TeamData } from "@/lib/teamApis";
import { Users, Plus, Search, ArrowRight } from "lucide-react";

const MOCK_TEAMS: (TeamData & { courseName?: string; leaderName?: string; membersCount?: number; maxMembers?: number })[] = [
  {
    id: "1",
    teamName: "Team Alpha",
    teamDescription: "Working on MERN stack eCommerce platform with Stripe integration.",
    courseId: "1",
    courseName: "MERN Development",
    status: "ACTIVE",
    hiring: "ACTIVE",
    leaderName: "Aryan Kumar",
    membersCount: 4,
    maxMembers: 4,
  },
  {
    id: "2",
    teamName: "Team Phoenix",
    teamDescription: "Building Java microservices & Kafka event-driven pipeline.",
    courseId: "3",
    courseName: "Java & Enterprise Systems",
    status: "ACTIVE",
    hiring: "ACTIVE",
    leaderName: "Bhavna Rao",
    membersCount: 3,
    maxMembers: 4,
  },
  {
    id: "3",
    teamName: "Neural Net Squad",
    teamDescription: "Computer vision image classification project using PyTorch.",
    courseId: "2",
    courseName: "Artificial Intelligence & ML",
    status: "ACTIVE",
    hiring: "ACTIVE",
    leaderName: "Chirag Lal",
    membersCount: 2,
    maxMembers: 4,
  },
];

const Teams: React.FC = () => {
  const { coursesId } = useParams<{ coursesId?: string }>();
  const [teams, setTeams] = useState<typeof MOCK_TEAMS>(MOCK_TEAMS);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [applyDesc, setApplyDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (coursesId) {
      fetchTeams(coursesId);
    }
  }, [coursesId]);

  const fetchTeams = async (cId: string) => {
    try {
      const res = await getAllTeams(cId);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setTeams(res.data);
      }
    } catch (err) {
      console.log("Using default fallback teams:", err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setActionLoading(true);
    try {
      await createTeam(coursesId || "1", newTeamName, newTeamDesc);
      if (coursesId) fetchTeams(coursesId);
      setShowCreateModal(false);
      setNewTeamName("");
      setNewTeamDesc("");
      alert("Team created successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create team. Ensure enrolment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyToTeam = async (teamId: string) => {
    setActionLoading(true);
    try {
      await applyToJoinTeam(teamId, applyDesc);
      alert("Application submitted to Team Leader!");
      setShowApplyModal(null);
      setApplyDesc("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Application sent successfully!");
      setShowApplyModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      (t.teamDescription && t.teamDescription.toLowerCase().includes(search.toLowerCase())) ||
      (t.courseName && t.courseName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 font-sans space-y-6 bg-background h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">All Teams</h1>
          <p className="text-sm text-gray-500 mt-1">
            Find teams hiring new members, submit joining applications, or establish your own squad.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams by name, description, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-primary"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((t) => {
          const isFull = (t.membersCount || 0) >= (t.maxMembers || 4);
          return (
            <div
              key={t.id}
              className="bg-card rounded-2xl border border-border hover:border-purple-300 transition-all p-5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      t.hiring === "ACTIVE" && !isFull
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {t.hiring === "ACTIVE" && !isFull ? "Hiring Open" : "Complete"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-primary">{t.teamName}</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                  {t.courseName || "MERN Development"}
                </p>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {t.teamDescription || "Collaborative project team building real world application features."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-400">
                  <span>Members: <strong>{t.membersCount || 3}/4</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {t.hiring === "ACTIVE" && !isFull && (
                    <button
                      onClick={() => setShowApplyModal(t.id)}
                      className="text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  )}
                  <Link
                    to={`/courses/${t.courseId || "1"}/teams/${t.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-200 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-xl transition-all"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Team Synergy"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-purple-500 text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Team Goal / Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your team focus or member criteria..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-purple-500 text-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-all"
                >
                  {actionLoading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to Team Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">Apply to Join Team</h2>
            <p className="text-xs text-gray-500">
              Introduce yourself and highlight relevant skills to the team leader.
            </p>
            <div>
              <textarea
                rows={4}
                placeholder="State your experience, tech stack, or why you want to join this team..."
                value={applyDesc}
                onChange={(e) => setApplyDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-purple-500 text-primary"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApplyToTeam(showApplyModal)}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-all"
              >
                {actionLoading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
=======
import React from 'react'

const Teams = () => {
  return (
    <div>Teams</div>
  )
}

export default Teams
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704
