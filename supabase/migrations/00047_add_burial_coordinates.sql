-- Migration: Add burial coordinates to fallen table
-- Purpose: Support interactive burial location map
-- Date: 2025-10-31

-- Add burial coordinates column (lat, lng in JSONB format)
ALTER TABLE public.fallen
ADD COLUMN IF NOT EXISTS burial_coordinates JSONB;

-- Add index for spatial queries
CREATE INDEX IF NOT EXISTS idx_fallen_burial_coordinates
ON public.fallen USING gin (burial_coordinates)
WHERE NOT is_deleted AND burial_coordinates IS NOT NULL;

-- Add check constraint to ensure valid coordinates format
ALTER TABLE public.fallen
ADD CONSTRAINT burial_coordinates_format
CHECK (
  burial_coordinates IS NULL OR
  (
    burial_coordinates ? 'lat' AND
    burial_coordinates ? 'lng' AND
    (burial_coordinates->>'lat')::numeric BETWEEN -90 AND 90 AND
    (burial_coordinates->>'lng')::numeric BETWEEN -180 AND 180
  )
);

-- Comment
COMMENT ON COLUMN public.fallen.burial_coordinates IS
'Coordinates of burial location in format: {"lat": 45.123, "lng": 132.456}';

-- Add example UPDATE statement (commented out - for manual use)
-- UPDATE public.fallen
-- SET burial_coordinates = '{"lat": 45.123, "lng": 132.456}'::jsonb
-- WHERE id = 'some-uuid' AND burial_location IS NOT NULL;
