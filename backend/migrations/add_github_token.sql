-- Add github_token column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
