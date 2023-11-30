
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

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

CREATE OR REPLACE FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_profile_image" "text", "author_profile_image_thumbnail" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
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

CREATE OR REPLACE FUNCTION "public"."get_global_posts"("last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50, "signed_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_profile_image" "text", "author_profile_image_thumbnail" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
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

ALTER FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint DEFAULT NULL::bigint, "max_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "target" smallint, "krew" "text", "author" "uuid", "author_display_name" "text", "author_profile_image" "text", "author_profile_image_thumbnail" "text", "author_x_username" "text", "message" "text", "translated" "jsonb", "rich" "jsonb", "parent" bigint, "comment_count" integer, "repost_count" integer, "like_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "liked" boolean, "reposted" boolean)
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
        EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id) AS liked,
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    INNER JOIN 
        subject_key_holders skh ON u.wallet_address = skh.wallet_address
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
        new.followee_id, new.follower_id, 2
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
                user_id, triggerer, type, source_id
            ) VALUES (
                v_author, new.author, 5, new.id
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
BEGIN
    SELECT author INTO v_author FROM posts WHERE id = new.post_id;
    
    IF v_author <> new.user_id THEN
        INSERT INTO notifications (
            user_id, triggerer, type, source_id
        ) VALUES (
            v_author, new.user_id, 3, new.post_id
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
BEGIN
    SELECT author INTO v_author FROM posts WHERE id = new.post_id;
    
    IF v_author <> new.user_id THEN
        INSERT INTO notifications (
            user_id, triggerer, type, source_id
        ) VALUES (
            v_author, new.user_id, 4, new.post_id
        );
    END IF;
    
    RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."notify_repost_event"() OWNER TO "postgres";

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
    insert into public.users_public (user_id, display_name, profile_image, profile_image_thumbnail, profile_image_stored, x_username)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      false,
      new.raw_user_meta_data ->> 'user_name'
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      profile_image = new.raw_user_meta_data ->> 'avatar_url',
      profile_image_thumbnail = new.raw_user_meta_data ->> 'avatar_url',
      profile_image_stored = false,
      x_username = new.raw_user_meta_data ->> 'user_name';
  else
    insert into public.users_public (user_id, display_name, profile_image, profile_image_thumbnail, profile_image_stored)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      false
    ) on conflict (user_id) do update
    set
      display_name = new.raw_user_meta_data ->> 'full_name',
      profile_image = new.raw_user_meta_data ->> 'avatar_url',
      profile_image_thumbnail = new.raw_user_meta_data ->> 'avatar_url',
      profile_image_stored = false;
  end if;
  return new;
end;
$$;

ALTER FUNCTION "public"."set_user_metadata_to_public"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."topic_chat_messages" (
    "id" bigint NOT NULL,
    "topic" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
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
    "author" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
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
    "last_fetched_key_price" numeric DEFAULT '10000000000000000'::numeric NOT NULL,
    "total_trading_key_volume" numeric DEFAULT '0'::numeric NOT NULL,
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "is_key_price_up" boolean,
    "last_message" "text",
    "last_message_sent_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "key_holder_count" integer DEFAULT 0 NOT NULL,
    "last_key_purchased_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "owner" "text",
    "type" smallint NOT NULL
);

ALTER TABLE "public"."krews" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "triggerer" "uuid" NOT NULL,
    "type" smallint NOT NULL,
    "source_id" bigint,
    "amount" bigint,
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "post_id" bigint,
    "post_message" "text"
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

CREATE TABLE IF NOT EXISTS "public"."total_key_balances" (
    "wallet_address" "text" NOT NULL,
    "total_key_balance" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."total_key_balances" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users_public" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text",
    "total_earned_trading_fees" numeric DEFAULT '0'::numeric NOT NULL,
    "display_name" "text",
    "profile_image" "text",
    "profile_image_thumbnail" "text",
    "profile_image_stored" boolean DEFAULT false NOT NULL,
    "x_username" "text",
    "metadata" "jsonb",
    "follower_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "blocked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."users_public" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."wallet_linking_nonces" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."wallet_linking_nonces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."topic_chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "followee_id");

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_pkey" PRIMARY KEY ("id");

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

ALTER TABLE ONLY "public"."total_key_balances"
    ADD CONSTRAINT "total_key_balances_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE ONLY "public"."users_public"
    ADD CONSTRAINT "users_public_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."wallet_linking_nonces"
    ADD CONSTRAINT "wallet_linking_nonces_pkey" PRIMARY KEY ("user_id");

CREATE TRIGGER "decrease_follow_count" AFTER DELETE ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_follow_count"();

CREATE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();

CREATE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();

CREATE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();

CREATE TRIGGER "increase_follow_count" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."increase_follow_count"();

CREATE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();

CREATE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();

CREATE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();

CREATE TRIGGER "notify_follow_event" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."notify_follow_event"();

CREATE TRIGGER "notify_post_comment_event" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_comment_event"();

CREATE TRIGGER "notify_post_like_event" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_like_event"();

CREATE TRIGGER "notify_repost_event" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_repost_event"();

CREATE TRIGGER "set_krew_key_holders_updated_at" BEFORE UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_krews_updated_at" BEFORE UPDATE ON "public"."krews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_notification_read_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_notification_read_at"();

CREATE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_topic_last_message" AFTER INSERT ON "public"."topic_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_topic_last_message"();

CREATE TRIGGER "set_topics_updated_at" BEFORE UPDATE ON "public"."topics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_total_key_balances_updated_at" BEFORE UPDATE ON "public"."total_key_balances" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users_public"("user_id");

ALTER TABLE ONLY "public"."krew_chat_messages"
    ADD CONSTRAINT "krew_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

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

CREATE POLICY "can delete only authed" ON "public"."posts" FOR DELETE TO "authenticated" USING (("author" = "auth"."uid"()));

CREATE POLICY "can follow only follower" ON "public"."follows" FOR INSERT TO "authenticated" WITH CHECK ((("follower_id" = "auth"."uid"()) AND ("follower_id" <> "followee_id")));

CREATE POLICY "can like only authed" ON "public"."post_likes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can repost only authed" ON "public"."reposts" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "can unfollow only follower" ON "public"."follows" FOR DELETE TO "authenticated" USING (("follower_id" = "auth"."uid"()));

CREATE POLICY "can unlike only authed" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "can unrepost only authed" ON "public"."reposts" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

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
  WHERE (("krews"."id" = "posts"."krew") AND ((("krews"."type" = 0) AND ("krews"."owner" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))) OR (("krews"."type" = 1) AND (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
           FROM "public"."krew_key_holders"
          WHERE (("krew_key_holders"."krew" = "krew_key_holders"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
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

ALTER TABLE "public"."krew_key_holders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."krews" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reposts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."topic_chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."total_key_balances" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users_public" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."follows" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."krew_key_holders" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."krews" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."post_likes" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."reposts" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."topic_chat_messages" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."topics" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."total_key_balances" FOR SELECT USING (true);

CREATE POLICY "view everyone" ON "public"."users_public" FOR SELECT USING (true);

CREATE POLICY "view everyone or only keyholders" ON "public"."posts" FOR SELECT USING ((("target" = 0) OR ("author" = "auth"."uid"()) OR ("krew" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."krews"
  WHERE (("krews"."id" = "posts"."krew") AND ((("krews"."type" = 0) AND ("krews"."owner" = ( SELECT "users_public"."wallet_address"
           FROM "public"."users_public"
          WHERE ("users_public"."user_id" = "auth"."uid"())))) OR (1 <= ( SELECT "krew_key_holders"."last_fetched_balance"
           FROM "public"."krew_key_holders"
          WHERE (("krew_key_holders"."krew" = "krew_key_holders"."krew") AND ("krew_key_holders"."wallet_address" = ( SELECT "users_public"."wallet_address"
                   FROM "public"."users_public"
                  WHERE ("users_public"."user_id" = "auth"."uid"()))))))))))));

ALTER TABLE "public"."wallet_linking_nonces" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

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

GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_posts"("p_user_id" "uuid", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_global_posts"("last_post_id" bigint, "max_count" integer, "signed_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_key_held_posts"("p_user_id" "uuid", "p_wallet_address" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_follow_count"() TO "service_role";

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

GRANT ALL ON TABLE "public"."total_key_balances" TO "anon";
GRANT ALL ON TABLE "public"."total_key_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."total_key_balances" TO "service_role";

GRANT ALL ON TABLE "public"."users_public" TO "anon";
GRANT ALL ON TABLE "public"."users_public" TO "authenticated";
GRANT ALL ON TABLE "public"."users_public" TO "service_role";

GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_linking_nonces" TO "service_role";

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
