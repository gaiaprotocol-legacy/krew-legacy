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

GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_krew_last_message"() TO "service_role";