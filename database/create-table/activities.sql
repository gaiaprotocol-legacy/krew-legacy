CREATE TABLE IF NOT EXISTS "public"."activities" (
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "event_type" smallint NOT NULL,
    "args" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "wallet_address" "text" NOT NULL,
    "krew" "text" NOT NULL,
    "user" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."activities" OWNER TO "postgres";

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("block_number", "log_index");

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_krew_fkey" FOREIGN KEY ("krew") REFERENCES "public"."krews"("id");

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users_public"("user_id");

ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."activities" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";
