-- =============================================
-- SuperWizard — схема БД для Supabase
-- =============================================
-- Проект: https://supabase.com/dashboard/project/dfostzoumcoqsnylauhe
-- Выполните в SQL Editor: Dashboard → SQL → New query
--
-- Требуется включённый Auth (Email). Таблицы ссылаются на auth.users.
-- При повторном запуске политики пересоздаются (DROP … IF EXISTS).

-- ─── Таблицы ───

CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content           TEXT NOT NULL DEFAULT '',
  model             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS chat_bots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  author_name   TEXT NOT NULL DEFAULT '',
  username      TEXT NOT NULL UNIQUE
                CHECK (
                  username = lower(username)
                  AND username ~ '^[a-z0-9_]{3,24}$'
                  AND username !~ '(ai|lumiere|safiyev|marat)'
                ),
  description   TEXT NOT NULL DEFAULT '',
  model         TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  is_public     BOOLEAN NOT NULL DEFAULT false,
  avatar_url    TEXT NOT NULL DEFAULT '',
  media_links   TEXT[] NOT NULL DEFAULT '{}',
  use_count     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_bots_user ON chat_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_bots_public ON chat_bots(is_public, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_bots_use_count ON chat_bots(use_count DESC);

-- ─── RLS ───

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_bots     ENABLE ROW LEVEL SECURITY;

-- Сброс политик (идемпотентный повторный запуск)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

DROP POLICY IF EXISTS "Users can view own bots or public bots" ON chat_bots;
DROP POLICY IF EXISTS "Users can create own bots" ON chat_bots;
DROP POLICY IF EXISTS "Users can update own bots" ON chat_bots;
DROP POLICY IF EXISTS "Users can delete own bots" ON chat_bots;
DROP POLICY IF EXISTS "Admins can view all bots" ON chat_bots;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in own conversations"
  ON messages FOR UPDATE
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own bots or public bots"
  ON chat_bots FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own bots"
  ON chat_bots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bots"
  ON chat_bots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bots"
  ON chat_bots FOR DELETE
  USING (auth.uid() = user_id);

-- Админ: замените email на свой или задайте через отдельную таблицу ролей
CREATE POLICY "Admins can view all bots"
  ON chat_bots FOR SELECT
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) IN ('safievmarat65@gmail.com'));

CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) IN ('safievmarat65@gmail.com'));

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) IN ('safievmarat65@gmail.com'));

-- ─── Запрет смены username у бота ───

CREATE OR REPLACE FUNCTION prevent_bot_username_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.username <> OLD.username THEN
    RAISE EXCEPTION 'username cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_bot_username_update ON chat_bots;
CREATE TRIGGER trg_prevent_bot_username_update
  BEFORE UPDATE ON chat_bots
  FOR EACH ROW
  EXECUTE FUNCTION prevent_bot_username_update();

-- ─── RPC: счётчик использования (тренды) ───

CREATE OR REPLACE FUNCTION increment_bot_usage(bot_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE chat_bots
  SET use_count = use_count + 1,
      updated_at = now()
  WHERE id = bot_id_input
    AND (is_public = true OR user_id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION increment_bot_usage(uuid) TO authenticated;
