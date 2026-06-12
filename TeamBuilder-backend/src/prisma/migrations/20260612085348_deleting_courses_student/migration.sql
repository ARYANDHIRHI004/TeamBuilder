/*
  Warnings:

  - You are about to drop the `CoursesStudent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId,userEmail]` on the table `RegisteredUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CoursesStudent" DROP CONSTRAINT "CoursesStudent_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CoursesStudent" DROP CONSTRAINT "CoursesStudent_userId_fkey";

-- DropTable
DROP TABLE "CoursesStudent";

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredUser_courseId_userEmail_key" ON "RegisteredUser"("courseId", "userEmail");
