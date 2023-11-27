CREATE TRIGGER "set_total_key_balances_updated_at" BEFORE UPDATE ON "public"."total_key_balances" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
