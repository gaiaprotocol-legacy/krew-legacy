CREATE OR REPLACE FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") RETURNS boolean
    LANGUAGE "plpgsql"
AS $$
DECLARE
    owner_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.krews k
        LEFT JOIN public.krew_key_holders kh ON k.id = kh.krew
        WHERE (k.id LIKE 'p_%' AND k.owner = p_wallet_address AND k.supply > 0)
            OR (k.id LIKE 'c_%' AND kh.wallet_address = p_wallet_address AND kh.last_fetched_balance > 0)
    ) INTO owner_exists;

    RETURN owner_exists;
END;
$$;

ALTER FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") OWNER TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "anon";
GRANT EXECUTE ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."check_owned_krews_exist"("p_wallet_address" "text") TO "service_role";
