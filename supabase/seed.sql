
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."append_galxe_credential_personal_buy_keys"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    IF new.event_type = 1 AND position('p_' in new.krew) = 1 THEN
        perform net.http_post(
            'https://sfwnwiuxgehxbyystchq.supabase.co/functions/v1/append-galxe-credential-personal-buy-keys',
            headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes"}'::JSONB,
            body := ('{"walletAddress": "' || new.wallet_address || '"}')::JSONB
        ) AS request_id;
    END IF;
    RETURN null;
END;$$;

ALTER FUNCTION "public"."append_galxe_credential_personal_buy_keys"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    owner_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.krews k
        LEFT JOIN public.krew_key_holders kh ON k.id = kh.krew
        WHERE (k.id LIKE 'p_%' AND k.owner = p_wallet_address AND k.supply > 0)
            OR (k.id LIKE 'c_%' AND kh.wallet_address = p_wallet_address AND kh.last_fetched_balance > 0)
    ) INTO owner_exists;

    RETURN owner_exists;
END;
$$;

ALTER FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrease_follow_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update users_public
  set
    follower_count = follower_count - 1
  where
    user_id = old.followee_id;
  update users_public
  set
    following_count = following_count - 1
  where
    user_id = old.follower_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_follow_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrease_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF old.parent IS NOT NULL THEN
    update posts
    set
      comment_count = comment_count - 1
    where
      id = old.parent;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_post_comment_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrease_post_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    like_count = like_count - 1
  where
    id = old.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_post_like_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrease_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    repost_count = repost_count - 1
  where
    id = old.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."decrease_repost_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        POSITION(lower(search_string) IN lower(p.message)) > 0
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("user_id" "uuid", "wallet_address" "text", "display_name" "text", "avatar" "text", "avatar_thumb" "text", "avatar_stored" boolean, "x_username" "text", "metadata" "jsonb", "follower_count" integer, "following_count" integer, "blocked" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "followed_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.wallet_address,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.avatar_stored,
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
$$;

ALTER FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    INNER JOIN 
        follows f ON p.author = f.followee_id
    WHERE 
        f.follower_id = p_user_id
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("user_id" "uuid", "wallet_address" "text", "display_name" "text", "avatar" "text", "avatar_thumb" "text", "avatar_stored" boolean, "x_username" "text", "metadata" "jsonb", "follower_count" integer, "following_count" integer, "blocked" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "followed_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.wallet_address,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.avatar_stored,
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

CREATE OR REPLACE FUNCTION "public"."get_global_krew_contract_events"("last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("block_number" bigint, "log_index" bigint, "event_type" smallint, "args" "text"[], "wallet_address" "text", "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "krew" "text", "krew_id" "text", "krew_name" "text", "krew_image" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
        u.x_username as user_x_username,
        a.krew,
        k.id AS krew_id,
        k.name AS krew_name,
        k.image AS krew_image,
        a.created_at
    FROM 
        krew_contract_events a
    LEFT JOIN 
        users_public u ON a.wallet_address = u.wallet_address
    LEFT JOIN
        krews k ON a.krew = k.id
    WHERE 
        (a.event_type = 0 OR a.event_type = 1)
        AND (last_created_at IS NULL OR a.created_at < last_created_at)
    ORDER BY 
        a.created_at DESC
    LIMIT 
        max_count;
END
$$;

ALTER FUNCTION "public"."get_global_krew_contract_events"("last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_global_posts"("last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.parent IS NULL AND
        last_post_id IS NULL OR p.id < last_post_id
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("block_number" bigint, "log_index" bigint, "event_type" smallint, "args" "text"[], "wallet_address" "text", "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "krew" "text", "krew_id" "text", "krew_name" "text", "krew_image" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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
        u.avatar as user_avatar,
        u.avatar_thumb as user_avatar_thumb,
        u.stored_avatar as user_stored_avatar,
        u.stored_avatar_thumb as user_stored_avatar_thumb,
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

CREATE OR REPLACE FUNCTION "public"."get_key_held_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 1000) RETURNS TABLE("id" "text", "name" "text", "image" "text", "metadata" "jsonb", "supply" "text", "last_fetched_key_price" "text", "total_trading_key_volume" "text", "is_key_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "key_holder_count" integer, "last_key_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.name,
        k.image,
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
    INNER JOIN 
        public.krew_key_holders kh ON k.id = kh.krew
    WHERE 
        kh.wallet_address = p_wallet_address
        AND kh.last_fetched_balance > 0
        AND (last_created_at IS NULL OR k.created_at < last_created_at)
    ORDER BY 
        k.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_key_held_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    INNER JOIN 
        krew_key_holders skh ON p.krew = skh.krew AND u.wallet_address = skh.wallet_address
    WHERE 
        skh.wallet_address = p_wallet_address
        AND skh.last_fetched_balance > 0
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS TABLE("block_number" bigint, "log_index" bigint, "event_type" smallint, "args" "text"[], "wallet_address" "text", "krew" "text", "user" "uuid", "created_at" timestamp with time zone, "user_id" "uuid", "user_display_name" "text", "user_avatar" "text", "user_avatar_thumb" "text", "user_stored_avatar" "text", "user_stored_avatar_thumb" "text", "user_x_username" "text", "krew_id" "text", "krew_name" "text", "krew_image" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
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
$$;

ALTER FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."users_public" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text",
    "display_name" "text",
    "avatar" "text",
    "avatar_thumb" "text",
    "avatar_stored" boolean DEFAULT false NOT NULL,
    "x_username" "text",
    "metadata" "jsonb",
    "follower_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "blocked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "stored_avatar" "text",
    "stored_avatar_thumb" "text"
);

ALTER TABLE "public"."users_public" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 100) RETURNS SETOF "public"."users_public"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.*
    FROM 
        public.users_public u
    INNER JOIN 
        public.krew_key_holders kh ON u.wallet_address = kh.wallet_address
    WHERE 
        kh.krew = p_krew_id
        AND kh.last_fetched_balance > 0
        AND (last_created_at IS NULL OR u.created_at < last_created_at)
    ORDER BY 
        u.created_at DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "like_created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
$$;

ALTER FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_owned_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 1000) RETURNS TABLE("id" "text", "name" "text", "image" "text", "metadata" "jsonb", "supply" "text", "last_fetched_key_price" "text", "total_trading_key_volume" "text", "is_key_price_up" boolean, "last_message" "text", "last_message_sent_at" timestamp with time zone, "key_holder_count" integer, "last_key_purchased_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.name,
        k.image,
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
        public.krew_key_holders kh ON k.id = kh.krew AND kh.wallet_address = p_wallet_address
    WHERE 
        (
            (k.id LIKE 'p_%' AND k.owner = p_wallet_address AND k.supply > 0)
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

ALTER FUNCTION "public"."get_owned_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    portfolio_value numeric := 0;
    v_holder record;
    v_krew record;
BEGIN
    FOR v_holder IN (
        SELECT 
            krew, 
            last_fetched_balance
        FROM 
            krew_key_holders 
        WHERE 
            wallet_address = p_wallet_address
    ) LOOP
        FOR v_krew IN (
            SELECT 
                id, 
                last_fetched_key_price 
            FROM 
                krews
            WHERE 
                id = v_holder.krew
        ) LOOP
            portfolio_value := portfolio_value + (v_holder.last_fetched_balance::numeric * v_krew.last_fetched_key_price);
        END LOOP;
    END LOOP;

    RETURN portfolio_value::text;
END;
$$;

ALTER FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint DEFAULT NULL::bigint, "max_comment_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "depth" integer)
    LANGUAGE "sql"
    AS $$
WITH RECURSIVE ancestors AS (
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        0 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.id = p_post_id
    UNION
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        a.depth - 1 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    JOIN 
        ancestors a ON p.id = a.parent
),
comments AS (
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted,
        1 AS depth
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.parent = p_post_id AND
        last_comment_id IS NULL OR p.id < last_comment_id
    ORDER BY p.id
    LIMIT max_comment_count
)
SELECT * FROM ancestors
UNION ALL
SELECT * FROM comments
ORDER BY depth, id;
$$;

ALTER FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean, "repost_created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        r.created_at
    FROM 
        reposts r
    INNER JOIN 
        posts p ON r.post_id = p.id
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        r.user_id = p_user_id
        AND (last_reposted_at IS NULL OR r.created_at > last_reposted_at)
    ORDER BY 
        r.created_at ASC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.author = p_user_id
        AND p.parent IS NOT NULL
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_avatar" "text", "author_avatar_thumb" "text", "author_stored_avatar" "text", "author_stored_avatar_thumb" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
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
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.author = p_user_id
        AND p.parent IS NULL
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_follow_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update users_public
  set
    follower_count = follower_count + 1
  where
    user_id = new.followee_id;
  update users_public
  set
    following_count = following_count + 1
  where
    user_id = new.follower_id;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_follow_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_key_holder_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update krews
  set
    key_holder_count = key_holder_count + 1
  where
    id = new.krew;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_key_holder_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF new.parent IS NOT NULL THEN
    update posts
    set
      comment_count = comment_count + 1
    where
      id = new.parent;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_post_comment_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_post_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    like_count = like_count + 1
  where
    id = new.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_post_like_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increase_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update posts
  set
    repost_count = repost_count + 1
  where
    id = new.post_id;
  return null;
end;$$;

ALTER FUNCTION "public"."increase_repost_count"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."notify_follow_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
    insert into notifications (
        user_id, triggerer, type
    ) values (
        new.followee_id, new.follower_id, 3
    );
    return null;
end;$$;

ALTER FUNCTION "public"."notify_follow_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."notify_post_comment_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_author UUID;
begin
    IF new.parent IS NOT NULL THEN
        SELECT author INTO v_author FROM posts WHERE id = new.parent;
        IF v_author <> new.author THEN
            INSERT INTO notifications (
                user_id, triggerer, type, post_id, post_message
            ) VALUES (
                v_author, new.author, 6, new.id, new.message
            );
        END IF;
    END IF;
    return null;
end;$$;

ALTER FUNCTION "public"."notify_post_comment_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."notify_post_like_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_author UUID;
    v_message TEXT;
BEGIN
    SELECT author, message INTO v_author, v_message FROM posts WHERE id = new.post_id;
    
    IF v_author <> new.user_id THEN
        INSERT INTO notifications (
            user_id, triggerer, type, post_id, post_message
        ) VALUES (
            v_author, new.user_id, 4, new.post_id, v_message
        );
    END IF;
    
    RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."notify_post_like_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."notify_repost_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_author UUID;
    v_message TEXT;
BEGIN
    SELECT author, message INTO v_author, v_message FROM posts WHERE id = new.post_id;
    
    IF v_author <> new.user_id THEN
        INSERT INTO notifications (
            user_id, triggerer, type, post_id, post_message
        ) VALUES (
            v_author, new.user_id, 5, new.post_id, v_message
        );
    END IF;
    
    RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."notify_repost_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."parse_krew_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_receiver UUID;
    v_triggerer UUID;
    v_wallet_address text;
    owner_data RECORD;
begin
    -- create krew
    IF new.event_type = 0 THEN

        IF position('p_' in new.krew) = 1 THEN

            SELECT display_name, avatar, avatar_thumb, metadata 
            INTO owner_data
            FROM users_public 
            WHERE wallet_address = new.wallet_address;

            IF FOUND THEN
                insert into krews (
                    id, owner, name, image, metadata
                ) values (
                    new.krew, new.wallet_address, owner_data.display_name, owner_data.avatar, owner_data.metadata
                );
            ELSE
                insert into krews (
                    id, owner
                ) values (
                    new.krew, new.wallet_address
                );
            END IF;

        ELSIF position('c_' in new.krew) = 1 THEN
            insert into krews (
                id
            ) values (
                new.krew
            );
        END IF;

        insert into krew_key_holders (
            krew, wallet_address, last_fetched_balance
        ) values (
            new.krew, new.wallet_address, 1
        );

        -- update total key balance
        insert into wallets (
            wallet_address, total_key_balance
        ) values (
            new.wallet_address, 1
        ) on conflict (wallet_address) do update
        set
            total_key_balance = wallets.total_key_balance + 1;

        -- notify
        v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);

        insert into activities (
            block_number, log_index, event_type, args, wallet_address, krew, "user"
        ) values (
            new.block_number, new.log_index, new.event_type, new.args, new.wallet_address, new.krew, v_receiver
        );

        IF v_receiver IS NOT NULL THEN
            insert into notifications (
                user_id, krew, type
            ) values (
                v_receiver, new.krew, 0
            );
        END IF;

    -- trade
    ELSIF new.event_type = 1 THEN

        update krews set
            supply = new.args[9]::numeric,
            is_key_price_up = new.args[3] = 'true'
        where
            id = new.krew;

        insert into krew_key_holders (
            krew, wallet_address
        ) values (
            new.krew, new.wallet_address
        ) on conflict (krew, wallet_address) do nothing;

        -- update balance
        IF new.args[3] = 'true' THEN
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance + new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;

            insert into wallets (
                wallet_address, total_key_balance
            ) values (
                new.wallet_address, new.args[4]::int8
            ) on conflict (wallet_address) do update
            set
                total_key_balance = wallets.total_key_balance + new.args[4]::int8;
        ELSE
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance - new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;

            update wallets set
                total_key_balance = wallets.total_key_balance - new.args[4]::int8
            where
                wallet_address = new.wallet_address;
        END IF;

        -- notify

        v_triggerer := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);

        insert into activities (
            block_number, log_index, event_type, args, wallet_address, krew, "user"
        ) values (
            new.block_number, new.log_index, new.event_type, new.args, new.wallet_address, new.krew, v_triggerer
        );

        IF position('p_' in new.krew) = 1 THEN

            v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = (
                SELECT owner FROM krews WHERE id = new.krew
            ));

            IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
                insert into notifications (
                    user_id, triggerer, krew, amount, type
                ) values (
                    v_receiver, v_triggerer, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                );
            END IF;

        ELSIF position('c_' in new.krew) = 1 THEN

            FOR v_wallet_address IN SELECT wallet_address FROM krew_key_holders WHERE krew = new.krew LOOP
                v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = v_wallet_address);

                IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
                    insert into notifications (
                        user_id, triggerer, krew, amount, type
                    ) values (
                        v_receiver, v_triggerer, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                    );
                END IF;

            END LOOP;
        END IF;

    -- claim fees
    ELSIF new.event_type = 2 THEN

        insert into wallets (
            wallet_address
        ) values (
            new.wallet_address
        ) on conflict (wallet_address) do nothing;

        update wallets set
            total_earned_trading_fees = total_earned_trading_fees + new.args[3]::numeric
        where
            wallet_address = new.wallet_address;
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_krew_contract_event"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_krew_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update krews
    set
        last_message = (SELECT display_name FROM public.users_public WHERE user_id = new.author) || ': ' || new.message,
        last_message_sent_at = now()
    where
        id = new.krew;
  return null;
end;$$;

ALTER FUNCTION "public"."set_krew_last_message"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_notification_read_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF old.read = false AND new.read = true THEN
    new.read_at := now();
  END IF;
  RETURN new;
END;
$$;

ALTER FUNCTION "public"."set_notification_read_at"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_topic_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  update topics
    set
        last_message = (SELECT display_name FROM public.users_public WHERE user_id = new.author) || ': ' || new.message,
        last_message_sent_at = now()
    where
        topic = new.topic;
  return null;
end;$$;

ALTER FUNCTION "public"."set_topic_last_message"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  new.updated_at := now();
  RETURN new;
END;$$;

ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_user_metadata_to_public"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if strpos(new.raw_user_meta_data ->> 'iss', 'twitter') > 0 then
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored, x_username)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      case 
        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
        else
          new.raw_user_meta_data ->> 'avatar_url'
      end,
      new.raw_user_meta_data ->> 'avatar_url',
      false,
      new.raw_user_meta_data ->> 'user_name'
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = case 
                        when strpos(new.raw_user_meta_data ->> 'avatar_url', '_normal') > 0 then
                          replace(new.raw_user_meta_data ->> 'avatar_url', '_normal', '')
                        else
                          new.raw_user_meta_data ->> 'avatar_url'
                      end,
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false,
      x_username = new.raw_user_meta_data ->> 'user_name';
  else
    insert into public.users_public (user_id, display_name, avatar, avatar_thumb, avatar_stored)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      false
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      avatar = new.raw_user_meta_data ->> 'avatar_url',
      avatar_thumb = new.raw_user_meta_data ->> 'avatar_url',
      avatar_stored = false;
  end if;
  return new;
end;
$$;

ALTER FUNCTION "public"."set_user_metadata_to_public"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."test_get_global_posts"("last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_profile_image" "text", "author_profile_image_thumbnail" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = signed_user_id)
            ELSE FALSE 
        END AS liked,
        CASE 
            WHEN signed_user_id IS NOT NULL THEN 
                EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = signed_user_id)
            ELSE FALSE 
        END AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        p.parent IS NULL AND
        last_post_id IS NULL OR p.id < last_post_id
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."test_get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_key_holder_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  IF old.last_fetched_balance = 0 AND new.last_fetched_balance > 0 THEN
    update krews
    set
      key_holder_count = key_holder_count + 1
    where
      id = new.krew;
  ELSIF old.last_fetched_balance > 0 AND new.last_fetched_balance = 0 THEN
    update krews
    set
      key_holder_count = key_holder_count - 1
    where
      id = new.krew;
  END IF;
  return null;
end;$$;

ALTER FUNCTION "public"."update_key_holder_count"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."activities" (
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "event_type" smallint NOT NULL,
    "args" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "wallet_address" "text" NOT NULL,
    "krew" "text" NOT NULL,
    "user" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."activities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."topic_chat_messages" (
    "id" bigint NOT NULL,
    "topic" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"(),
    "message" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source" smallint DEFAULT '0'::smallint NOT NULL,
    "external_author_id" "text",
    "external_author_name" "text",
    "external_author_avatar" "text",
    "external_message_id" "text"
);

ALTER TABLE "public"."topic_chat_messages" OWNER TO "postgres";

ALTER TABLE "public"."topic_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."follows" (
    "follower_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "followed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."follows" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."krew_chat_messages" (
    "id" bigint NOT NULL,
    "krew" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"(),
    "message" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source" smallint DEFAULT '0'::smallint NOT NULL,
    "external_author_id" "text",
    "external_author_name" "text",
    "external_author_avatar" "text",
    "external_message_id" "text"
);

ALTER TABLE "public"."krew_chat_messages" OWNER TO "postgres";

ALTER TABLE "public"."krew_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."krew_chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."krew_contract_events" (
    "block_number" bigint NOT NULL,
    "log_index" bigint NOT NULL,
    "event_type" smallint NOT NULL,
    "args" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "wallet_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "krew" "text" NOT NULL
);

ALTER TABLE "public"."krew_contract_events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."krew_key_holders" (
    "krew" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "last_fetched_balance" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."krew_key_holders" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."krews" (
    "id" "text" NOT NULL,
    "last_fetched_key_price" numeric DEFAULT '62500000000000'::numeric NOT NULL,
    "total_trading_key_volume" numeric DEFAULT '0'::numeric NOT NULL,
    "is_key_price_up" boolean,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "key_holder_count" integer DEFAULT 0 NOT NULL,
    "last_key_purchased_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "owner" "text",
    "name" "text",
    "image" "text",
    "metadata" "jsonb",
    "supply" numeric DEFAULT '1'::numeric NOT NULL
);

ALTER TABLE "public"."krews" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "triggerer" "uuid",
    "type" smallint NOT NULL,
    "amount" bigint,
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "post_id" bigint,
    "post_message" "text",
    "krew" "text"
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

CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."post_likes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "target" smallint,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text" NOT NULL,
    "translated" "jsonb",
    "rich" "jsonb",
    "parent" bigint,
    "comment_count" integer DEFAULT 0 NOT NULL,
    "repost_count" integer DEFAULT 0 NOT NULL,
    "like_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "krew" "text"
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."reposts" (
    "post_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reposts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."topics" (
    "topic" "text" NOT NULL,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."topics" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tracked_event_blocks" (
    "contract_type" smallint NOT NULL,
    "block_number" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."tracked_event_blocks" OWNER TO "postgres";

ALTER TABLE "public"."tracked_event_blocks" ALTER COLUMN "contract_type" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tracked_event_blocks_contract_type_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."wallet_linking_nonces" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."wallet_linking_nonces" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "wallet_address" "text" NOT NULL,
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "total_key_balance" bigint DEFAULT '0'::bigint NOT NULL
);

ALTER TABLE "public"."wallets" OWNER TO "postgres";

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("block_number", "log_index");

ALTER TABLE ONLY "public"."topic_chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "followee_id");

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."krew_contract_events"
    ADD CONSTRAINT "krew_contract_events_pkey" PRIMARY KEY ("block_number", "log_index");

ALTER TABLE ONLY "public"."krew_key_holders"
    ADD CONSTRAINT "krew_key_holders_pkey" PRIMARY KEY ("krew", "wallet_address");

ALTER TABLE ONLY "public"."krews"
    ADD CONSTRAINT "krews_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("topic");

ALTER TABLE ONLY "public"."tracked_event_blocks"
    ADD CONSTRAINT "tracked_event_blocks_pkey" PRIMARY KEY ("contract_type");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_wallet_address_key" UNIQUE ("wallet_address");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("wallet_address");

CREATE OR REPLACE TRIGGER "append_galxe_credential_personal_buy_keys" AFTER INSERT ON "public"."krew_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."append_galxe_credential_personal_buy_keys"();

CREATE OR REPLACE TRIGGER "decrease_follow_count" AFTER DELETE ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_follow_count"();

CREATE OR REPLACE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();

CREATE OR REPLACE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();

CREATE OR REPLACE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();

CREATE OR REPLACE TRIGGER "increase_follow_count" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."increase_follow_count"();

CREATE OR REPLACE TRIGGER "increase_key_holder_count" AFTER INSERT ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."increase_key_holder_count"();

CREATE OR REPLACE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();

CREATE OR REPLACE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();

CREATE OR REPLACE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();

CREATE OR REPLACE TRIGGER "notify_follow_event" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."notify_follow_event"();

CREATE OR REPLACE TRIGGER "notify_post_comment_event" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_comment_event"();

CREATE OR REPLACE TRIGGER "notify_post_like_event" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_like_event"();

CREATE OR REPLACE TRIGGER "notify_repost_event" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_repost_event"();

CREATE OR REPLACE TRIGGER "parse_krew_contract_event" AFTER INSERT ON "public"."krew_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."parse_krew_contract_event"();

CREATE OR REPLACE TRIGGER "set_krew_key_holders_updated_at" BEFORE UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_krew_last_message" AFTER INSERT ON "public"."krew_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_krew_last_message"();

CREATE OR REPLACE TRIGGER "set_krews_updated_at" BEFORE UPDATE ON "public"."krews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_notification_read_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_notification_read_at"();

CREATE OR REPLACE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_topic_last_message" AFTER INSERT ON "public"."topic_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_topic_last_message"();

CREATE OR REPLACE TRIGGER "set_topics_updated_at" BEFORE UPDATE ON "public"."topics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_tracked_event_blocks_updated_at" BEFORE UPDATE ON "public"."tracked_event_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "set_wallets_updated_at" BEFORE UPDATE ON "public"."wallets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "update_key_holder_count" AFTER UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."update_key_holder_count"();

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_krew_fkey" FOREIGN KEY ("krew") REFERENCES "public"."krews"("id");

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_krew_fkey" FOREIGN KEY ("krew") REFERENCES "public"."krews"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_triggerer_fkey" FOREIGN KEY ("triggerer") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."reposts"
    ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."topic_chat_messages"
    ADD CONSTRAINT "topic_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "can delete only authed" ON "public"."posts" FOR DELETE TO "authenticated" USING (("author" = "auth"."uid"()));

CREATE POLICY "can follow only follower" ON "public"."follows" FOR INSERT TO "authenticated" WITH CHECK ((("follower_id" = "auth"."uid"()) AND ("follower_id" <> "followee_id")));

CREATE POLICY "can like only authed" ON "public"."post_likes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can repost only authed" ON "public"."reposts" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can unfollow only follower" ON "public"."follows" FOR DELETE TO "authenticated" USING (("follower_id" = "auth"."uid"()));

CREATE POLICY "can unlike only authed" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can unrepost only authed" ON "public"."reposts" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can update only holder or owner" ON "public"."krews" FOR UPDATE TO "authenticated" USING (("owner" = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"())))) WITH CHECK (("owner" = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))));

CREATE POLICY "can view only holder or owner" ON "public"."krew_chat_messages" FOR SELECT TO "authenticated" USING (((( SELECT "krews"."owner"
   FROM "public"."krews"
  WHERE ("krews"."id" = "krew_chat_messages"."krew")) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
   FROM "public"."krew_key_holders"
  WHERE (("krew_key_holders"."krew" = "krew_chat_messages"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"()))))))));

CREATE POLICY "can view only user" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can write only authed" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((("message" <> ''::"text") AND ("length"("message") <= 2000) AND ("author" = "auth"."uid"()) AND (("krew" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."krews"
  WHERE (("krews"."id" = "posts"."krew") AND (((POSITION(('p_'::"text") IN ("krews"."id")) = 1) AND ("krews"."owner" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))) OR ((POSITION(('c_'::"text") IN ("krews"."id")) = 1) AND (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
           FROM "public"."krew_key_holders"
          WHERE (("krew_key_holders"."krew" = "posts"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
                   FROM "public"."users_public"
                  WHERE ("users_public"."user_id" = "auth"."uid"()))))))))))))));

CREATE POLICY "can write only authed" ON "public"."topic_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((((("message" IS NOT NULL) AND ("message" <> ''::"text") AND ("length"("message") <= 1000)) OR (("message" IS NULL) AND ("rich" IS NOT NULL))) AND ("author" = "auth"."uid"())));

CREATE POLICY "can write only holder or owner" ON "public"."krew_chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((((("message" <> ''::"text") AND ("length"("message") < 1000)) OR ("rich" IS NOT NULL)) AND ("author" = "auth"."uid"()) AND ((( SELECT "krews"."owner"
   FROM "public"."krews"
  WHERE ("krews"."id" = "krew_chat_messages"."krew")) = ( SELECT "users_public"."wallet_address"
   FROM "public"."users_public"
  WHERE ("users_public"."user_id" = "auth"."uid"()))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
   FROM "public"."krew_key_holders"
  WHERE (("krew_key_holders"."krew" = "krew_chat_messages"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))))))));

ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."krew_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."krew_contract_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."krew_key_holders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."krews" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reposts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."topic_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tracked_event_blocks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users_public" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."activities" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."follows" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."krew_contract_events" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."krew_key_holders" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."krews" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."post_likes" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."reposts" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."topic_chat_messages" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."topics" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."users_public" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."wallets" FOR SELECT USING (true);

CREATE POLICY "view everyone or only keyholders" ON "public"."posts" FOR SELECT USING ((("target" = 0) OR ("author" = "auth"."uid"()) OR ("krew" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."krews"
  WHERE (("krews"."id" = "posts"."krew") AND (((POSITION(('p_'::"text") IN ("krews"."id")) = 1) AND ("krews"."owner" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
           FROM "public"."krew_key_holders"
          WHERE (("krew_key_holders"."krew" = "posts"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
                   FROM "public"."users_public"
                  WHERE ("users_public"."user_id" = "auth"."uid"()))))))))))));

ALTER TABLE "public"."wallet_linking_nonces" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "anon";
GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_post_comment_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_post_like_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_repost_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_followers"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_users"("p_user_id" "uuid", "last_fetched_followed_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_krew_contract_events"("last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_krew_contract_events"("last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_krew_contract_events"("last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_krew_contract_events"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_key_held_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_krew_activities"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON TABLE "public"."users_public" TO "anon";
GRANT ALL ON TABLE "public"."users_public" TO "authenticated";
GRANT ALL ON TABLE "public"."users_public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_liked_posts"("p_user_id" "uuid", "last_liked_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_owned_krews"("p_wallet_address" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_and_comments"("p_post_id" bigint, "last_comment_id" bigint, "max_comment_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reposts"("p_user_id" "uuid", "last_reposted_at" timestamp with time zone, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_comment_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_post_comment_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_post_like_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_repost_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_topic_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_topic_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_topic_last_message"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_metadata_to_public"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."test_get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "service_role";

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";

GRANT ALL ON TABLE "public"."topic_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."topic_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";

GRANT ALL ON TABLE "public"."krew_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."krew_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."krew_chat_messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."krew_contract_events" TO "anon";
GRANT ALL ON TABLE "public"."krew_contract_events" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_contract_events" TO "service_role";

GRANT ALL ON TABLE "public"."krew_key_holders" TO "anon";
GRANT ALL ON TABLE "public"."krew_key_holders" TO "authenticated";
GRANT ALL ON TABLE "public"."krew_key_holders" TO "service_role";

GRANT ALL ON TABLE "public"."krews" TO "anon";
GRANT ALL ON TABLE "public"."krews" TO "authenticated";
GRANT ALL ON TABLE "public"."krews" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."reposts" TO "anon";
GRANT ALL ON TABLE "public"."reposts" TO "authenticated";
GRANT ALL ON TABLE "public"."reposts" TO "service_role";

GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";

GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "anon";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "service_role";

GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "service_role";

GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "service_role";

GRANT ALL ON TABLE "public"."wallets" TO "anon";
GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
