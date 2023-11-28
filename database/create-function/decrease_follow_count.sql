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

GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_follow_count"() TO "service_role";
