CREATE TABLE IF NOT EXISTS "public"."krew_chat_messages" (
    "id" bigint NOT NULL,
    "krew" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."krew_chat_messages" OWNER TO "postgres";
ALTER TABLE "public"."krew_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."krew_chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

CREATE POLICY "can view only holder or owner" ON "public"."krew_chat_messages" FOR SELECT TO "authenticated" USING (((( SELECT "krews"."owner"
   FROM "public"."krews"
  WHERE ("krews"."id" = "krew_chat_messages"."krew")) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
   FROM "public"."krew_key_holders"
  WHERE (("krew_key_holders"."krew" = "krew_chat_messages"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"()))))))));

CREATE POLICY "can write only holder or owner" ON "public"."krew_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((((("message" <> ''::"text") AND ("length"("message") < 1000)) OR ("rich" IS NOT NULL)) AND ("author" = "auth"."uid"()) AND ((( SELECT "krews"."owner"
   FROM "public"."krews"
  WHERE ("krews"."id" = "krew_chat_messages"."krew")) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
   FROM "public"."krew_key_holders"
  WHERE (("krew_key_holders"."krew" = "krew_chat_messages"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))))))));

ALTER TABLE "public"."krew_chat_messages" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."krew_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."krew_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "service_role";