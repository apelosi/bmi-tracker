-- Replace age field with date_of_birth in users table
ALTER TABLE users DROP COLUMN IF EXISTS age;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
