CREATE OR REPLACE FUNCTION "public"."get_key_held_krew_contract_events"(
        "p_wallet_address" "text",
        "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone,
        "max_count" integer DEFAULT 100
    ) RETURNS TABLE(
        "block_number" bigint,
        "log_index" bigint,
        "event_type" smallint,
        "args" "text" [],
        "wallet_address" "text",
        "user_id" "uuid",
        "user_display_name" "text",
        "user_profile_image" "text",
        "user_profile_image_thumbnail" "text",
        "user_stored_profile_image" "text",
        "user_stored_profile_image_thumbnail" "text",
        "user_x_username" "text",
        "krew" "text",
        "krew_id" "text",
        "krew_name" "text",
        "krew_image" "text",
        "created_at" timestamp with time zone
    ) LANGUAGE "plpgsql" AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.block_number,
        a.log_index,
        a.event_type,
        a.args,
        a.wallet_address,
        u.user_id as user_id,
        u.display_name as user_display_name,
        u.profile_image as user_profile_image,
        u.profile_image_thumbnail as user_profile_image_thumbnail,
        u.stored_profile_image as user_stored_profile_image,
        u.stored_profile_image_thumbnail as user_stored_profile_image_thumbnail,
        u.x_username as user_x_username,
        a.krew,
        k.id AS krew_id,
        k.name AS krew_name,
        k.image AS krew_image,
        a.created_at
    FROM 
        krew_contract_events a
    INNER JOIN 
        krew_key_holders skh ON a.wallet_address = skh.wallet_address
    LEFT JOIN 
        users_public u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        krews k ON a.krew = k.id
    WHERE 
        (a.event_type = 0 OR a.event_type = 1)
        AND skh.krew = a.krew
        AND skh.wallet_address = p_wallet_address
        AND skh.last_fetched_balance > 0
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END
$$;

ALTER FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
