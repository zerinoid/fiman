-- Add 'pet' category to transaction_category ENUM
ALTER TYPE public.transaction_category ADD VALUE IF NOT EXISTS 'pet' AFTER 'unforeseen';

-- Add tags and transaction_datetime to fiorc_transactions
ALTER TABLE public.fiorc_transactions 
  ADD COLUMN IF NOT EXISTS transaction_datetime TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];
