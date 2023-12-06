CREATE OR REPLACE FUNCTION get_liked_posts(
    p_user_id uuid,
    last_liked_at timestamp with time zone DEFAULT NULL,
    max_count int DEFAULT 50
)
RETURNS TABLE (
    id int8,
    target int2,
    krew text,
    author uuid,
    author_display_name text,
    author_profile_image text,
    author_profile_image_thumbnail text,
    author_x_username text,
    message text,
    translated jsonb,
    rich jsonb,
    parent int8,
    comment_count int4,
    repost_count int4,
    like_count int4,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    liked boolean,
    reposted boolean,
    like_created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.profile_image,
        u.profile_image_thumbnail,
        u.x_username,
        p.message,
        p.translated,
        p.rich,
        p.parent,
        p.comment_count,
        p.repost_count,
        p.like_count,
        p.created_at,
        p.updated_at,
        EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id) AS liked,
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted,
        pl.created_at AS like_created_at
    FROM 
        post_likes pl
    INNER JOIN 
        posts p ON pl.post_id = p.id
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        pl.user_id = p_user_id
        AND (last_liked_at IS NULL OR pl.created_at > last_liked_at)
    ORDER BY 
        pl.created_at ASC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql;
