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

GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_post_comment_event"() TO "service_role";
