CREATE OR REPLACE FUNCTION "public"."get_owned_krews"(
    "p_wallet_address" "text",
    "last_created_at" timestamp with time zone DEFAULT NULL,
    "max_count" int DEFAULT 1000
) RETURNS TABLE("id" "text", "name" "text", "image" "text", "image_thumbnail" "text", "metadata" "jsonb", "supply" "text", "last_fetched_key_price" "text", "total_trading_key_volume" "text", "is_key_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "key_holder_count" integer, "last_key_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
LANGUAGE "plpgsql"
AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.name,
        k.image,
        k.image_thumbnail,
        k.metadata,
        k.supply::TEXT,
        k.last_fetched_key_price::TEXT,
        k.total_trading_key_volume::TEXT,
        k.is_key_price_up,
        k.last_message,
        k.last_message_sent_at,
        k.key_holder_count,
        k.last_key_purchased_at,
        k.created_at,
        k.updated_at
    FROM 
        public.krews k
    LEFT JOIN 
        public.krew_key_holders kh ON k.id = kh.krew
    WHERE 
        (
            (k.id LIKE 'p_%' AND k.owner = p_wallet_address)
            OR
            (k.id LIKE 'c_%' AND kh.wallet_address = p_wallet_address AND kh.last_fetched_balance > 0)
        )
        AND (last_created_at IS NULL OR k.created_at < last_created_at)
    ORDER BY 
        k.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_owned_krews"("p_wallet_address" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text") TO "service_role";
