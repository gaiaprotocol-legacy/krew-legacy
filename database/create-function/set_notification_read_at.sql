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

GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_notification_read_at"() TO "service_role";
