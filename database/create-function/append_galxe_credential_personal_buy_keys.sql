CREATE OR REPLACE FUNCTION "public"."append_galxe_credential_personal_buy_keys"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    IF new.event_type = 1 AND position('p_' in new.krew) = 1 THEN
        perform net.http_post(
            'https://sfwnwiuxgehxbyystchq.supabase.co/functions/v1/append-galxe-credential-personal-buy-keys',
            headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes"}'::JSONB,
            body := ('{"walletAddress": "' || new.wallet_address || '"}')::JSONB
        ) AS request_id;
    END IF;
    RETURN null;
END;$$;

ALTER FUNCTION "public"."append_galxe_credential_personal_buy_keys"() OWNER TO "postgres";

CREATE TRIGGER "append_galxe_credential_personal_buy_keys" AFTER INSERT ON "public"."krew_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."append_galxe_credential_personal_buy_keys"();

GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "anon";
GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_galxe_credential_personal_buy_keys"() TO "service_role";
