CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user" "uuid" NOT NULL,
    "triggered_by" "uuid" NOT NULL,
    "type" smallint NOT NULL,
    "source_id" bigint,
    "amount" bigint,
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."users_public"("user_id");
ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users_public"("user_id");

CREATE POLICY "can view only user" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user" = "auth"."uid"()));

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";