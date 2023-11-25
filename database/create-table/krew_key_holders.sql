CREATE TABLE IF NOT EXISTS "public"."krew_key_holders" (
    "krew" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."krew_key_holders" OWNER TO "postgres";

ALTER TABLE ONLY "public"."krew_key_holders"
    ADD CONSTRAINT "krew_key_holders_pkey" PRIMARY KEY ("krew", "wallet_address");

ALTER TABLE "public"."krew_key_holders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."krew_key_holders" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."krew_key_holders" TO "anon";
GRANT ALL ON TABLE "public"."krew_key_holders" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_key_holders" TO "service_role";
