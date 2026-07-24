-- Add UNIQUE constraints to month_year columns using an idempotent DO block

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fiorc_monthly_targets_month_year_key'
    ) THEN
        ALTER TABLE public.fiorc_monthly_targets ADD CONSTRAINT fiorc_monthly_targets_month_year_key UNIQUE (month_year);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fiorc_rent_boletos_month_year_key'
    ) THEN
        ALTER TABLE public.fiorc_rent_boletos ADD CONSTRAINT fiorc_rent_boletos_month_year_key UNIQUE (month_year);
    END IF;
END $$;
