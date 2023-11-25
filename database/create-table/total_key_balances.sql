CREATE TABLE IF NOT EXISTS "public"."total_key_balances" (
    "wallet_address" "text" NOT NULL,
    "total_key_balance" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."total_key_balances" OWNER TO "postgres";

ALTER TABLE ONLY "public"."total_key_balances"
    ADD CONSTRAINT "total_key_balances_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE "public"."total_key_balances" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."total_key_balances" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."total_key_balances" TO "anon";
GRANT ALL ON TABLE "public"."total_key_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."total_key_balances" TO "service_role";
