CREATE TABLE IF NOT EXISTS "public"."topics" (
    "topic" "text" NOT NULL,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."topics" OWNER TO "postgres";

ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("topic");

ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."topics" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";
