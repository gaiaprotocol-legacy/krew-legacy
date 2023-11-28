
CREATE TRIGGER "decrease_follow_count" AFTER DELETE ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_follow_count"();

CREATE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();

CREATE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();

CREATE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();

CREATE TRIGGER "increase_follow_count" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."increase_follow_count"();

CREATE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();

CREATE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();

CREATE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();

CREATE TRIGGER "set_krew_key_holders_updated_at" BEFORE UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_krews_updated_at" BEFORE UPDATE ON "public"."krews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_topic_last_message" AFTER INSERT ON "public"."topic_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_topic_last_message"();

CREATE TRIGGER "set_topics_updated_at" BEFORE UPDATE ON "public"."topics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_total_key_balances_updated_at" BEFORE UPDATE ON "public"."total_key_balances" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
