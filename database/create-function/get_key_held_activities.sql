CREATE OR REPLACE FUNCTION "public"."get_key_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS SETOF "public"."krew_contract_events"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM 
        krew_contract_events a
    INNER JOIN 
        subject_key_holders skh ON a.wallet_address = skh.wallet_address
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
ALTER FUNCTION "public"."get_key_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_key_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_activities"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
