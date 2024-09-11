/*
  Warnings:

  - Made the column `type` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `type` ENUM('free', 'notice', 'faq') NOT NULL DEFAULT 'free';
