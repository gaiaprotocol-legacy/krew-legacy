CREATE OR REPLACE FUNCTION "public"."parse_krew_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_sender UUID;
    v_receiver UUID;
    v_wallet_address text;
begin
    IF new.event_type = 0 THEN
        IF position('p_' in new.krew) = 1 THEN
            insert into krews (
                id, owner
            ) values (
                new.krew, new.wallet_address
            );
        ELSIF position('c_' in new.krew) = 1 THEN
            insert into krews (
                id
            ) values (
                new.krew
            );
        END IF;
        insert into krew_key_holders (
            krew, wallet_address, last_fetched_balance
        ) values (
            new.krew, new.wallet_address, 1
        );
        insert into notifications (
            user_id, krew, type
        ) values (
            (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address),
            new.krew, 0
        );
    ELSIF new.event_type = 1 THEN
        update krews set
            supply = new.args[9]::numeric
        where
            krew = new.krew;
        insert into krew_key_holders (
            krew, wallet_address
        ) values (
            new.krew, new.wallet_address
        ) on conflict (subject) do nothing;
        IF new.args[3] = 'true' THEN
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance + new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;
        ELSE
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance - new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;
        END IF;
        IF position('p_' in new.krew) = 1 THEN
            v_sender := (SELECT user_id FROM users_public WHERE wallet_address = (
                SELECT owner FROM krews WHERE id = new.krew
            ));
            v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);
            IF v_sender != v_receiver THEN
                insert into notifications (
                    user_id, triggerer, krew, amount, type
                ) values (
                    v_sender, v_receiver, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                );
            END IF;
        ELSIF position('c_' in new.krew) = 1 THEN
            FOR v_wallet_address IN SELECT wallet_address FROM krew_key_holders WHERE krew = new.krew LOOP
                v_sender := (SELECT user_id FROM users_public WHERE wallet_address = v_wallet_address);
                v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);
                IF v_sender != v_receiver THEN
                    insert into notifications (
                        user_id, triggerer, krew, amount, type
                    ) values (
                        v_sender, v_receiver, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                    );
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_krew_contract_event"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "service_role";
