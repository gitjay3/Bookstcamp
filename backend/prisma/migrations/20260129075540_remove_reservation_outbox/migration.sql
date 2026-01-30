/*
  Warnings:

  - You are about to drop the `ReservationOutbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReservationOutbox" DROP CONSTRAINT "ReservationOutbox_reservationId_fkey";

-- DropTable
DROP TABLE "ReservationOutbox";
