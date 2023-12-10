CREATE OR REPLACE FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS SETOF "public"."users_public"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.*
    FROM 
        users_public u
    INNER JOIN 
        follows f ON u.user_id = f.followee_id
    WHERE 
        f.follower_id = p_user_id
        AND (last_fetched_followed_at IS NULL OR f.followed_at < last_fetched_followed_at)
    ORDER BY 
        f.followed_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "service_role";
