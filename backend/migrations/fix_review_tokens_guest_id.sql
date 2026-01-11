-- Migration: Fix review_tokens table to use guest_id instead of user_id
-- This fixes the foreign key constraint error when generating review tokens for guests
-- Run this script to update the schema

USE gss;

-- Drop the foreign key constraint first
ALTER TABLE review_tokens DROP FOREIGN KEY review_tokens_ibfk_1;

-- Rename the column from user_id to guest_id and make it nullable (for widget tokens)
ALTER TABLE review_tokens CHANGE COLUMN user_id guest_id INT NULL;

-- Add the foreign key constraint to reference guest table
ALTER TABLE review_tokens 
ADD CONSTRAINT review_tokens_ibfk_1 
FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE CASCADE;

-- Verify the changes
DESCRIBE review_tokens;
