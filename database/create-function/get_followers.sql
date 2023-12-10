CREATE OR REPLACE FUNCTION get_followers(
    p_user_id uuid,
    last_fetched_followed_at timestamp with time zone DEFAULT NULL,
    max_count int DEFAULT 50
)
RETURNS TABLE (
    user_id uuid,
    wallet_address text,
    display_name text,
    profile_image text,
    profile_image_thumbnail text,
    profile_image_stored boolean,
    x_username text,
    metadata jsonb,
    follower_count int,
    following_count int,
    blocked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    followed_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.wallet_address,
        u.display_name,
        u.profile_image,
        u.profile_image_thumbnail,
        u.profile_image_stored,
        u.x_username,
        u.metadata,
        u.follower_count,
        u.following_count,
        u.blocked,
        u.created_at,
        u.updated_at,
        f.followed_at
    FROM 
        users_public u
    INNER JOIN 
        follows f ON u.user_id = f.follower_id
    WHERE 
        f.followee_id = p_user_id
        AND (last_fetched_followed_at IS NULL OR f.followed_at < last_fetched_followed_at)
    ORDER BY 
        f.followed_at DESC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "service_role";
