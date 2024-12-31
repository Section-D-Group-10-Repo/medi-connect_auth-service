/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL;
