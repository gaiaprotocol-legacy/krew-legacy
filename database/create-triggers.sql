
CREATE TRIGGER "decrease_follow_count" AFTER DELETE ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_follow_count"();
CREATE TRIGGER "increase_follow_count" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."increase_follow_count"();
CREATE TRIGGER "notify_follow_event" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."notify_follow_event"();
CREATE TRIGGER "set_notification_read_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_notification_read_at"();
CREATE TRIGGER "set_krew_key_holders_updated_at" BEFORE UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_krews_updated_at" BEFORE UPDATE ON "public"."krews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_topic_last_message" AFTER INSERT ON "public"."topic_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_topic_last_message"();
CREATE TRIGGER "set_krew_last_message" AFTER INSERT ON "public"."krew_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_krew_last_message"();
CREATE TRIGGER "set_topics_updated_at" BEFORE UPDATE ON "public"."topics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_total_key_balances_updated_at" BEFORE UPDATE ON "public"."total_key_balances" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_users_public_updated_at" BEFORE UPDATE ON "public"."users_public" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_wallets_updated_at" BEFORE UPDATE ON "public"."wallets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "set_tracked_event_blocks_updated_at" BEFORE UPDATE ON "public"."tracked_event_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "parse_krew_contract_event" AFTER INSERT ON "public"."krew_contract_events" FOR EACH ROW EXECUTE FUNCTION "public"."parse_krew_contract_event"();
CREATE TRIGGER "update_key_holder_count" AFTER UPDATE ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."update_key_holder_count"();
CREATE TRIGGER "increase_key_holder_count" AFTER INSERT ON "public"."krew_key_holders" FOR EACH ROW EXECUTE FUNCTION "public"."increase_key_holder_count"();

-- for post
CREATE TRIGGER "decrease_post_comment_count" AFTER DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_comment_count"();
CREATE TRIGGER "decrease_post_like_count" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_post_like_count"();
CREATE TRIGGER "decrease_repost_count" AFTER DELETE ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_repost_count"();
CREATE TRIGGER "increase_post_comment_count" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_comment_count"();
CREATE TRIGGER "increase_post_like_count" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increase_post_like_count"();
CREATE TRIGGER "increase_repost_count" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."increase_repost_count"();
CREATE TRIGGER "set_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE TRIGGER "notify_post_comment_event" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_comment_event"();
CREATE TRIGGER "notify_post_like_event" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."notify_post_like_event"();
CREATE TRIGGER "notify_repost_event" AFTER INSERT ON "public"."reposts" FOR EACH ROW EXECUTE FUNCTION "public"."notify_repost_event"();
