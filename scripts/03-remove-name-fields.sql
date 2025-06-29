-- Remove any first_name/last_name columns if they exist in users table
-- (This is safe to run even if columns don't exist)

-- Check if columns exist and drop them
DO $$ 
BEGIN
    -- Drop first_name column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users DROP COLUMN first_name;
    END IF;
    
    -- Drop last_name column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users DROP COLUMN last_name;
    END IF;
END $$;
