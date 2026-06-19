import React from "react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title?: string;
}

interface WorkItem {
  id: string;
  title: string;
}

interface NoticeItem {
  id: string;
  title: string;
}

interface DashboardContentProps {
  courses?: Course[];
  pendingWork?: WorkItem[];
  notices?: NoticeItem[];
}

const defaultCourses: Course[] = [
  { id: "1", title: "Course 1" },
  { id: "2", title: "Course 2" },
  { id: "3", title: "Course 3" },
  { id: "4", title: "Course 4" },
];

const Dashboard: React.FC<DashboardContentProps> = ({
  courses = defaultCourses,
  pendingWork = [],
  notices = [],
}) => {
  return (
    <div className=" grid gap-0   w-full ">
      {/* ── Courses List ── */}
      <section className="border border-[#3a3a3d]  p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {courses.map((course) => (
            <Link
            to={`/courses/${course.id}`}
              key={course.id}
              className="aspect-square bg-[#0d0d0f] border border-[#3a3a3d] rounded-2xl flex items-center justify-center text-[#f5f5f3] text-sm"
            >
              {course.title ?? ""}
            </Link>
          ))}
        </div>
        <p className="text-center text-base">Courses List</p>
      </section>

      {/* ── Panding Works + Notice Board ── */}
      <div className="grid grid-cols-1 md:grid-cols-2  ">
        {/* Panding Works */}
        <section className="bg-[#0d0d0f] border border-[#3a3a3d] p-5 flex flex-col">
          <div className="flex-1 flex items-center justify-center min-h-45">
            {pendingWork.length === 0 ? (
              <p className="text-[#f5f5f3] text-lg">Panding Works</p>
            ) : (
              <ul className="w-full flex flex-col gap-2">
                {pendingWork.map((item) => (
                  <li
                    key={item.id}
                    className="text-[#f5f5f3] text-sm border-b border-[#2a2a2d] pb-2"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Notice Board */}
        <section className="bg-[#0d0d0f] border border-[#3a3a3d]   p-5 flex flex-col">

          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {notices.length === 0 ? (
              <p className="text-[#f5f5f3] text-lg">Notice Board</p>
            ) : (
              <ul className="w-full flex flex-col gap-2">
                {notices.map((item) => (
                  <li
                    key={item.id}
                    className="text-[#f5f5f3] text-sm border-b border-[#2a2a2d] pb-2"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;