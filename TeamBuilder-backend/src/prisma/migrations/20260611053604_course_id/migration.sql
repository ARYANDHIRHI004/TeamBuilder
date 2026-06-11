/*
  Warnings:

  - You are about to drop the column `courseName` on the `RegisteredUser` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `RegisteredUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RegisteredUser" DROP CONSTRAINT "RegisteredUser_courseName_fkey";

-- DropIndex
DROP INDEX "Course_courseName_key";

-- AlterTable
ALTER TABLE "RegisteredUser" DROP COLUMN "courseName",
ADD COLUMN     "courseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RegisteredUser" ADD CONSTRAINT "RegisteredUser_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
