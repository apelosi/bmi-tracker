-- Add name field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
