CREATE OR REPLACE FUNCTION "public"."parse_krew_contract_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_receiver UUID;
    v_triggerer UUID;
    v_wallet_address text;
    owner_data RECORD;
begin
    -- create krew
    IF new.event_type = 0 THEN

        IF position('p_' in new.krew) = 1 THEN

            SELECT display_name, profile_image, profile_image_thumbnail, metadata 
            INTO owner_data
            FROM users_public 
            WHERE wallet_address = new.wallet_address;

            IF FOUND THEN
                insert into krews (
                    id, owner, name, image, metadata
                ) values (
                    new.krew, new.wallet_address, owner_data.display_name, owner_data.profile_image_thumbnail, owner_data.metadata
                );
            ELSE
                insert into krews (
                    id, owner
                ) values (
                    new.krew, new.wallet_address
                );
            END IF;

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

        -- update total key balance
        insert into wallets (
            wallet_address, total_key_balance
        ) values (
            new.wallet_address, 1
        ) on conflict (wallet_address) do update
        set
            total_key_balance = total_key_balance + 1;

        -- notify
        v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);

        IF v_receiver IS NOT NULL THEN
            insert into notifications (
                user_id, krew, type
            ) values (
                v_receiver, new.krew, 0
            );
        END IF;

    -- trade
    ELSIF new.event_type = 1 THEN

        update krews set
            supply = new.args[9]::numeric,
            is_key_price_up = new.args[3] = 'true'
        where
            id = new.krew;

        insert into krew_key_holders (
            krew, wallet_address
        ) values (
            new.krew, new.wallet_address
        ) on conflict (krew, wallet_address) do nothing;

        -- update balance
        IF new.args[3] = 'true' THEN
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance + new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;

            insert into wallets (
                wallet_address, total_key_balance
            ) values (
                new.wallet_address, new.args[4]::int8
            ) on conflict (wallet_address) do update
            set
                total_key_balance = total_key_balance + new.args[4]::int8;
        ELSE
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance - new.args[4]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;

            update wallets set
                total_key_balance = total_key_balance - new.args[4]::int8
            where
                wallet_address = new.wallet_address;
        END IF;

        -- notify

        IF position('p_' in new.krew) = 1 THEN

            v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = (
                SELECT owner FROM krews WHERE id = new.krew
            ));
            v_triggerer := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);

            IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
                insert into notifications (
                    user_id, triggerer, krew, amount, type
                ) values (
                    v_receiver, v_triggerer, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                );
            END IF;

        ELSIF position('c_' in new.krew) = 1 THEN

            FOR v_wallet_address IN SELECT wallet_address FROM krew_key_holders WHERE krew = new.krew LOOP
                v_receiver := (SELECT user_id FROM users_public WHERE wallet_address = v_wallet_address);
                v_triggerer := (SELECT user_id FROM users_public WHERE wallet_address = new.wallet_address);

                IF v_receiver IS NOT NULL AND v_receiver != v_triggerer THEN
                    insert into notifications (
                        user_id, triggerer, krew, amount, type
                    ) values (
                        v_receiver, v_triggerer, new.krew, new.args[4]::int8, CASE WHEN new.args[3] = 'true' THEN 1 ELSE 2 END
                    );
                END IF;

            END LOOP;
        END IF;

    -- claim fees
    ELSIF new.event_type = 2 THEN

        insert into wallets (
            wallet_address
        ) values (
            new.wallet_address
        ) on conflict (wallet_address) do nothing;

        update wallets set
            total_earned_trading_fees = total_earned_trading_fees + new.args[2]::numeric
        where
            wallet_address = new.wallet_address;
    END IF;
    RETURN NULL;
end;$$;

ALTER FUNCTION "public"."parse_krew_contract_event"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_krew_contract_event"() TO "service_role";
