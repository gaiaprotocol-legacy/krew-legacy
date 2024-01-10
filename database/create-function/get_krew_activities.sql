CREATE OR REPLACE FUNCTION "public"."get_krew_activities"(
    p_krew_id text,
    last_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
    max_count integer DEFAULT 100
) RETURNS TABLE(
    "block_number" bigint,
    "log_index" bigint,
    "event_type" smallint,
    "args" "text" [],
    "wallet_address" "text",
    "krew" "text",
    "user" "uuid",
    "created_at" timestamp with time zone,
    "user_id" uuid,
    "user_display_name" text,
    "user_avatar" text,
    "user_avatar_thumb" text,
    "user_stored_avatar" text,
    "user_stored_avatar_thumb" text,
    "user_x_username" text,
    "krew_id" text,
    "krew_name" text,
    "krew_image" text
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
        a.user,
        a.created_at,
        u.user_id,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        k.id AS krew_id,
        k.name AS krew_name,
        k.image AS krew_image
    FROM 
        "public"."activities" a
    LEFT JOIN 
        "public"."users_public" u ON a.user = u.user_id
    LEFT JOIN
        "public"."krews" k ON a.krew = k.id
    WHERE 
        a.krew = p_krew_id
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql STABLE;

ALTER FUNCTION "public"."test_get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
