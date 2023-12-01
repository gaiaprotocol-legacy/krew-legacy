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

GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_repost_event"() TO "service_role";
