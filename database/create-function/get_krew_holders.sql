CREATE OR REPLACE FUNCTION "public"."get_krew_holders"(
    p_krew_id text,
    last_created_at timestamp with time zone DEFAULT NULL,
    max_count integer DEFAULT 100
) RETURNS SETOF "public"."users_public" AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.*
    FROM 
        public.users_public u
    INNER JOIN 
        public.krew_key_holders kh ON u.wallet_address = kh.wallet_address
    WHERE 
        kh.krew = p_krew_id
        AND (last_created_at IS NULL OR u.created_at < last_created_at)
    ORDER BY 
        u.created_at DESC
    LIMIT 
        max_count;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_krew_holders"("p_krew_id" "text", "last_created_at" timestamp with time zone, "max_count" integer) TO "service_role";
