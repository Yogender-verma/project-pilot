-- Migration: add_portfolio_visibility
-- Adds 'username' (unique, nullable) and 'portfolioPublic' (boolean, default false)
-- to the User table to support shareable public portfolio pages.

-- Add portfolioPublic column with a default of false
ALTER TABLE "User" ADD COLUMN "portfolioPublic" BOOLEAN NOT NULL DEFAULT false;

-- Add username column as a nullable unique string
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Create a unique index on username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
