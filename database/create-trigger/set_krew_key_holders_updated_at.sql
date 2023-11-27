CREATE TRIGGER "set_krew_key_holders_updated_at" BEFORE UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
