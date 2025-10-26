-- =====================================================
-- Книга Памяти Кавалерово - Демо-данные наград
-- =====================================================
-- Миграция: 00022_demo_awards.sql
-- Описание: Добавление демо-наград для тестового героя
-- Дата: 2025-01-21

-- Добавляем награды для демо-героя (используем ID демо-пользователя как создателя)
DO $$
DECLARE
  demo_user_id UUID;
  demo_fallen_id UUID := '10000000-0000-0000-0000-000000000001';
  award_courage_id UUID;
  award_svo_id UUID;
  award_combat_merit_id UUID;
BEGIN
  -- Получаем ID демо-пользователя
  SELECT id INTO demo_user_id FROM users WHERE full_name = 'Demo User' LIMIT 1;

  -- Если демо-пользователь не найден, создаем
  IF demo_user_id IS NULL THEN
    INSERT INTO users (full_name, role, email_verified, notification_preferences)
    VALUES ('Demo User', 'user', false, '{}'::jsonb)
    RETURNING id INTO demo_user_id;
  END IF;

  -- Получаем ID нужных наград
  SELECT id INTO award_courage_id FROM awards WHERE name = 'Орден Мужества' LIMIT 1;
  SELECT id INTO award_svo_id FROM awards WHERE name = 'Медаль "Участнику специальной военной операции"' LIMIT 1;
  SELECT id INTO award_combat_merit_id FROM awards WHERE name = 'Медаль "За боевые заслуги"' LIMIT 1;

  -- Добавляем награды
  INSERT INTO fallen_awards (fallen_id, award_id, citation, awarded_date, decree_number, status, created_by)
  VALUES
    (
      demo_fallen_id,
      award_courage_id,
      'За мужество, отвагу и самоотверженность, проявленные при исполнении воинского долга',
      '2023-09-15',
      'Указ Президента РФ №123 от 15.09.2023',
      'approved',
      demo_user_id
    ),
    (
      demo_fallen_id,
      award_svo_id,
      'За непосредственное участие в специальной военной операции на территории Донецкой и Луганской народных республик',
      '2023-10-20',
      'Указ Президента РФ №456 от 20.10.2023',
      'approved',
      demo_user_id
    ),
    (
      demo_fallen_id,
      award_combat_merit_id,
      'За умелые, инициативные и смелые действия в бою, способствовавшие выполнению боевой задачи',
      '2023-08-05',
      'Приказ МО РФ №789 от 05.08.2023',
      'approved',
      demo_user_id
    )
  ON CONFLICT (fallen_id, award_id) DO NOTHING;

END $$;
