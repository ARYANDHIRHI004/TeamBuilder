import React from "react";

interface CohortDetailProps {
  cohortName?: string;
  tagLine?: string;
  startDate?: string;
  endDate?: string;
  children?: React.ReactNode;
}

const CohortDetail: React.FC<CohortDetailProps> = ({
  cohortName = "Cohort 1",
  tagLine = "Tag Line",
  startDate = "Start Date",
  endDate = "End Date",
  children,
}) => {
  return (
    <div className=" flex flex-col w-full">
      {/* ── Header card ── */}
      <div className=" px-6 pt-4 pb-3 flex-1">
        <h1 className="font-extrabold text-[40px] leading-tight text-[#f5f5f3] tracking-tight">
          {cohortName}
        </h1>
        <p className="text-[#9a9a9e] text-sm mt-1 mb-3">{tagLine}</p>
        <div className="h-px bg-[#f5f5f3]" />
      </div>

      {/* ── Start / End date row ── */}
      <div className="flex items-center justify-between px-1 text-[#f5f5f3] text-sm">
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>

      {/* ── Detail panel ── */}
      <section className="bg-[#0d0d0f] border border-[#3a3a3d] rounded-3xl min-h-75 flex items-center justify-center p-8">
        {children ?? (
          <p className="text-[#f5f5f3] text-3xl font-medium">
            {cohortName} Detail
          </p>
        )}
      </section>
    </div>
  );
};

export default CohortDetail;