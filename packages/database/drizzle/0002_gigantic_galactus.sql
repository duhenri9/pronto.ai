ALTER TYPE "public"."lifecycle_state" ADD VALUE 'deleted';--> statement-breakpoint
CREATE TABLE "launch_phase_config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"founder_cap" integer DEFAULT 1000 NOT NULL,
	"founder_count" integer DEFAULT 0 NOT NULL,
	"manual_founder_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan_tier" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "founder_benefit_locked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "selected_specialist" text;--> statement-breakpoint
CREATE INDEX "idx_launch_phase_ended" ON "launch_phase_config" USING btree ("ended_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_plan_tier" ON "subscriptions" USING btree ("plan_tier");

-- Founder Benefit CHECK constraints (Sprint 3)
ALTER TABLE "subscriptions" ADD CONSTRAINT "plan_tier_valid"
  CHECK ("plan_tier" IS NULL OR "plan_tier" IN ('founder', 'pro_single'));

ALTER TABLE "subscriptions" ADD CONSTRAINT "pro_single_must_have_specialist"
  CHECK ("plan_tier" != 'pro_single' OR "selected_specialist" IS NOT NULL);

ALTER TABLE "subscriptions" ADD CONSTRAINT "founder_no_selected_specialist"
  CHECK ("plan_tier" != 'founder' OR "selected_specialist" IS NULL);

-- Singleton constraint on launch_phase_config
ALTER TABLE "launch_phase_config" ADD CONSTRAINT "launch_phase_singleton"
  CHECK ("id" = 1);

-- Seed: singleton row for launch phase
INSERT INTO "launch_phase_config" ("id") VALUES (1);