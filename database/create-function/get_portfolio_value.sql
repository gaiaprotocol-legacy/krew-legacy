CREATE OR REPLACE FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    portfolio_value numeric := 0;
    v_holder record;
    v_krew record;
BEGIN
    FOR v_holder IN (
        SELECT 
            krew, 
            last_fetched_balance
        FROM 
            krew_key_holders 
        WHERE 
            wallet_address = p_wallet_address
    ) LOOP
        FOR v_krew IN (
            SELECT 
                id, 
                last_fetched_key_price 
            FROM 
                krews
            WHERE 
                id = v_holder.krew
        ) LOOP
            portfolio_value := portfolio_value + (v_holder.last_fetched_balance::numeric * v_krew.last_fetched_key_price);
        END LOOP;
    END LOOP;
    RETURN portfolio_value::text;
END;
$$;

ALTER FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_portfolio_value"("p_wallet_address" "text") TO "service_role";
