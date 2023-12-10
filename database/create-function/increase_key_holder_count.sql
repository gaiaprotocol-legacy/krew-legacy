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

GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_key_holder_count"() TO "service_role";
