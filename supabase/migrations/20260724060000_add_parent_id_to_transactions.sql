-- Add parent_id to fiorc_transactions for subordinate installments
ALTER TABLE fiorc_transactions
ADD COLUMN parent_id UUID REFERENCES fiorc_transactions(id) ON DELETE CASCADE;
