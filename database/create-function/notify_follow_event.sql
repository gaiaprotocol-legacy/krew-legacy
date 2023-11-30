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

GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_follow_event"() TO "service_role";
