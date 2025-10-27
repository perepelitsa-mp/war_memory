-- Add UPDATE policy for memory_items table
-- Allows authors, card owners, editors, and admins to update memories

CREATE POLICY "Authors and owners can update memory"
ON public.memory_items FOR UPDATE
USING (
  -- Author can update own memory
  created_by = auth.uid()
  OR
  -- Card owner can update
  EXISTS (
    SELECT 1 FROM fallen
    WHERE fallen.id = memory_items.fallen_id
    AND fallen.owner_id = auth.uid()
  )
  OR
  -- Card editors can update
  EXISTS (
    SELECT 1 FROM editors
    WHERE editors.fallen_id = memory_items.fallen_id
    AND editors.user_id = auth.uid()
  )
  OR
  -- Admins and moderators can update
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('superadmin', 'admin', 'moderator')
    AND NOT users.is_deleted
  )
);
