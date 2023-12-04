CREATE TABLE IF NOT EXISTS "public"."krew_contract_events" (
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "event_type" smallint NOT NULL,
    "args" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "wallet_address" "text" NOT NULL,
    "krew" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."krew_contract_events" OWNER TO "postgres";

ALTER TABLE ONLY "public"."krew_contract_events"
    ADD CONSTRAINT "krew_contract_events_pkey" PRIMARY KEY ("block_number", "log_index");

ALTER TABLE ONLY "public"."krew_contract_events"
    ADD CONSTRAINT "krew_contract_events_krew_fkey" FOREIGN KEY ("krew") REFERENCES "public"."krews"("id");

ALTER TABLE "public"."krew_contract_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."krew_contract_events" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."krew_contract_events" TO "anon";
GRANT ALL ON TABLE "public"."krew_contract_events" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_contract_events" TO "service_role";
