-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "intensity" INTEGER,
ADD COLUMN     "reps" INTEGER,
ADD COLUMN     "sets" INTEGER,
ADD COLUMN     "toFailure" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "durationMin" DROP NOT NULL;
