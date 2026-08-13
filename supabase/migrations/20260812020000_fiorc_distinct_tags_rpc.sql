-- RPC function to get all distinct tags from fiorc_transactions table

CREATE OR REPLACE FUNCTION public.fiorc_get_distinct_tags()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT unnest(tags) AS tag
  FROM public.fiorc_transactions
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.fiorc_get_distinct_tags() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fiorc_get_distinct_tags() TO service_role;
