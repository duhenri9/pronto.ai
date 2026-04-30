CREATE TABLE "vertical_interest_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"vertical" "vertical" NOT NULL,
	"niche" text,
	"signed_up_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notified_at" timestamp with time zone,
	"converted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "idx_vertical_interest_phone" ON "vertical_interest_signups" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_vertical_interest_vertical" ON "vertical_interest_signups" USING btree ("vertical");--> statement-breakpoint
CREATE INDEX "idx_vertical_interest_notified" ON "vertical_interest_signups" USING btree ("notified_at");--> statement-breakpoint

-- Prevent duplicate signups for same phone + vertical
CREATE UNIQUE INDEX "idx_vertical_interest_phone_vertical_unique" ON "vertical_interest_signups" USING btree ("phone", "vertical");
