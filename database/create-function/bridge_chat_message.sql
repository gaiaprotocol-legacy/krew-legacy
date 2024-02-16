CREATE OR REPLACE FUNCTION "public"."bridge_chat_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    IF new.source = 0 and new.topic = 'general' THEN
        perform net.http_post(
            'https://sfwnwiuxgehxbyystchq.supabase.co/functions/v1/bridge-chat-message',
            headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes"}'::JSONB,
            body := ('{"key": "{KEY}", "topic": "general", "from": "krew", "messageId": ' || new.id || '}')::JSONB
        ) AS request_id;
    END IF;
    RETURN null;
END;$$;

ALTER FUNCTION "public"."bridge_chat_message"() OWNER TO "postgres";

CREATE TRIGGER "bridge_chat_message" AFTER INSERT ON "public"."topic_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."bridge_chat_message"();

GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."bridge_chat_message"() TO "service_role";