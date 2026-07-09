-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'NEEDS_FOLLOW_UP', 'COMPLETED', 'BILLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('HEALTHY', 'DECAYED', 'FILLED', 'CROWNED', 'ROOT_CANAL', 'MISSING', 'IMPLANT', 'EXTRACTION_NEEDED', 'SEALANT', 'OTHER');

-- AlterTable: add the new status column alongside the old `completed` boolean (not dropped yet)
ALTER TABLE "Treatment" ADD COLUMN "status" "TreatmentStatus" NOT NULL DEFAULT 'PLANNED';

-- Backfill: existing completed treatments become COMPLETED, everything else stays PLANNED
UPDATE "Treatment" SET "status" = 'COMPLETED' WHERE "completed" = true;

-- CreateTable
CREATE TABLE "TreatmentTooth" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentTooth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientTooth" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "status" "ToothStatus" NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "PatientTooth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientTooth_patientId_toothNumber_key" ON "PatientTooth"("patientId", "toothNumber");

-- AddForeignKey
ALTER TABLE "TreatmentTooth" ADD CONSTRAINT "TreatmentTooth_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTooth" ADD CONSTRAINT "PatientTooth_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTooth" ADD CONSTRAINT "PatientTooth_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- Backfill: unnest each existing Treatment.teethInvolved array into TreatmentTooth rows
INSERT INTO "TreatmentTooth" ("id", "treatmentId", "toothNumber", "createdAt")
SELECT gen_random_uuid(), t."id", tooth, t."createdAt"
FROM "Treatment" t, unnest(t."teethInvolved") AS tooth
WHERE t."teethInvolved" IS NOT NULL AND array_length(t."teethInvolved", 1) > 0;

-- AlterTable: drop the old flat columns now that data has been migrated
ALTER TABLE "Treatment" DROP COLUMN "completed",
DROP COLUMN "teethInvolved";
