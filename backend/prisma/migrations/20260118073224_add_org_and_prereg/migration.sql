-- CreateEnum
CREATE TYPE "PreRegStatus" AS ENUM ('INVITED', 'CLAIMED', 'REVOKED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CamperOrganization" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CamperOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CamperPreRegistration" (
    "id" UUID NOT NULL,
    "claimedUserId" UUID,
    "organizationId" UUID NOT NULL,
    "camperId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "track" "Track" NOT NULL,
    "status" "PreRegStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CamperPreRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CamperOrganization_userId_organizationId_key" ON "CamperOrganization"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "CamperPreRegistration_username_idx" ON "CamperPreRegistration"("username");

-- AddForeignKey
ALTER TABLE "CamperOrganization" ADD CONSTRAINT "CamperOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamperOrganization" ADD CONSTRAINT "CamperOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamperPreRegistration" ADD CONSTRAINT "CamperPreRegistration_claimedUserId_fkey" FOREIGN KEY ("claimedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamperPreRegistration" ADD CONSTRAINT "CamperPreRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
