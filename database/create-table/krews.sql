CREATE TABLE IF NOT EXISTS "public"."krews" (
    "id" "text" NOT NULL,
    "owner" "text",
    "name" "text",
    "profile_image" "text",
    "profile_image_thumbnail" "text",
    "metadata" "jsonb",
    "supply" numeric DEFAULT '1'::numeric NOT NULL,
    "last_fetched_key_price" numeric DEFAULT '68750000000000'::numeric NOT NULL,
    "total_trading_key_volume" numeric DEFAULT '0'::numeric NOT NULL,
    "is_key_price_up" boolean,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "key_holder_count" integer DEFAULT 1 NOT NULL,
    "last_key_purchased_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."krews" OWNER TO "postgres";

ALTER TABLE ONLY "public"."krews"
    ADD CONSTRAINT "krews_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."krews" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."krews" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."krews" TO "anon";
GRANT ALL ON TABLE "public"."krews" TO "authenticated";
GRANT ALL ON TABLE "public"."krews" TO "service_role";
