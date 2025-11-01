-- Migration: Add unique constraint to virtual_flowers
-- Purpose: Ensure each user can only lay flowers once per hero
-- Date: 2025-10-30

-- Add unique constraint on (user_id, fallen_id)
ALTER TABLE public.virtual_flowers
ADD CONSTRAINT virtual_flowers_user_fallen_unique UNIQUE (user_id, fallen_id);

-- Comment
COMMENT ON CONSTRAINT virtual_flowers_user_fallen_unique ON public.virtual_flowers IS
'Ensures each user can only lay flowers once per fallen hero';
