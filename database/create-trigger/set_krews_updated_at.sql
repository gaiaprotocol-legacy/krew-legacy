CREATE TRIGGER "set_krews_updated_at" BEFORE UPDATE ON "public"."krews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
