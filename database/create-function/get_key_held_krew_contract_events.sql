CREATE OR REPLACE FUNCTION get_key_held_activities(
    p_wallet_address text,
    last_created_at timestamp with time zone DEFAULT NULL,
    max_count int DEFAULT 100
)
RETURNS TABLE (
    block_number int8,
    log_index int8,
    event_type int2,
    args text[],
    wallet_address text,
    krew text,
    krew_id text,
    krew_name text,
    krew_profile_image_thumbnail text,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.block_number,
        a.log_index,
        a.event_type,
        a.args,
        a.wallet_address,
        a.krew,
        k.id AS krew_id,
        k.name AS krew_name,
        k.profile_image_thumbnail AS krew_profile_image_thumbnail,
        a.created_at
    FROM 
        krew_contract_events a
    INNER JOIN 
        krew_key_holders skh ON a.wallet_address = skh.wallet_address
    LEFT JOIN
        krew k ON a.krew = k.id
    WHERE 
        skh.wallet_address = p_wallet_address
        AND skh.last_fetched_balance > 0
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END;
$$;
ALTER FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
