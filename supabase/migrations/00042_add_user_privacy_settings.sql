-- Add privacy settings fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_link TEXT,
ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS telegram_link TEXT,
ADD COLUMN IF NOT EXISTS show_telegram BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vk_link TEXT,
ADD COLUMN IF NOT EXISTS show_vk BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.users.show_phone IS 'Whether to show phone number on public profile';
COMMENT ON COLUMN public.users.whatsapp_link IS 'WhatsApp contact link (e.g., https://wa.me/79123456789)';
COMMENT ON COLUMN public.users.show_whatsapp IS 'Whether to show WhatsApp link on public profile';
COMMENT ON COLUMN public.users.telegram_link IS 'Telegram contact link (e.g., https://t.me/username)';
COMMENT ON COLUMN public.users.show_telegram IS 'Whether to show Telegram link on public profile';
COMMENT ON COLUMN public.users.vk_link IS 'VK (VKontakte) profile link (e.g., https://vk.com/id123456)';
COMMENT ON COLUMN public.users.show_vk IS 'Whether to show VK link on public profile';
