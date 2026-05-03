-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "caloriesBurned" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workouts_userId_idx" ON "workouts"("userId");

-- CreateIndex
CREATE INDEX "workouts_userId_createdAt_idx" ON "workouts"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
