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

CREATE TRIGGER "update_key_holder_count" AFTER UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."update_key_holder_count"();

GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_key_holder_count"() TO "service_role";
