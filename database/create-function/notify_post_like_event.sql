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

GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_post_like_event"() TO "service_role";
