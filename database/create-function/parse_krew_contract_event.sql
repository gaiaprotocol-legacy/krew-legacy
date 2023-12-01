begin
    IF event_type = 0 THEN
        IF position('p_' in new.krew) = 1 THEN
            insert into krews (
                id, owner
            ) values (
                new.krew, new.wallet_address
            ) on conflict (subject) do nothing;
        ELSIF position('c_' in new.krew) = 1 THEN
            insert into krews (
                id
            ) values (
                new.krew
            ) on conflict (subject) do nothing;
        END IF;
        insert into krew_key_holders (
            krew, wallet_address, last_fetched_balance
        ) values (
            new.key, new.wallet_address, 1
        );
        --TODO: noti
    ELSIF event_type = 1 THEN
        insert into krew_key_holders (
            krew, wallet_address
        ) values (
            new.key, new.wallet_address
        ) on conflict (subject) do nothing;
        IF new.args[3] = 'true' THEN
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance + new.args[2]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;
        ELSE
            update krew_key_holders set
                last_fetched_balance = last_fetched_balance - new.args[2]::int8
            where
                krew = new.krew and
                wallet_address = new.wallet_address;
        END IF;
        --TODO: noti
    END IF;
    RETURN NULL;
end;