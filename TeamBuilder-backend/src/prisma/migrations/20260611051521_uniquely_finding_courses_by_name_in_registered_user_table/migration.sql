/*
  Warnings:

  - You are about to drop the column `courseId` on the `RegisteredUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courseName]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseName` to the `RegisteredUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RegisteredUser" DROP CONSTRAINT "RegisteredUser_courseId_fkey";

-- AlterTable
ALTER TABLE "RegisteredUser" DROP COLUMN "courseId",
ADD COLUMN     "courseName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseName_key" ON "Course"("courseName");

-- AddForeignKey
ALTER TABLE "RegisteredUser" ADD CONSTRAINT "RegisteredUser_courseName_fkey" FOREIGN KEY ("courseName") REFERENCES "Course"("courseName") ON DELETE RESTRICT ON UPDATE CASCADE;
