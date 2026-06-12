-- CreateTable
CREATE TABLE "CoursesStudent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CoursesStudent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CoursesStudent" ADD CONSTRAINT "CoursesStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursesStudent" ADD CONSTRAINT "CoursesStudent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
