-- Создание таблиц для советской соцсети

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    factory VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    achievements_count INTEGER DEFAULT 0,
    avatar_emoji VARCHAR(10) DEFAULT '⭐',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица постов
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    achievement_badge VARCHAR(100),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица лайков
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Таблица комментариев
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица значков
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    badge_name VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рекордов
CREATE TABLE IF NOT EXISTS user_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    record_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка 4 пользователей
INSERT INTO users (username, password, display_name, factory, position, achievements_count, avatar_emoji) VALUES
('Ярул', 'Ярул', 'Товарищ Ярул', 'ПАО "Северсталь"', 'Бригадир сталеплавильного цеха', 15, '⭐'),
('Максим', 'Максим', 'Товарищ Максим', 'Камаз', 'Инженер-конструктор', 12, '🏭'),
('Пентагон', 'Пентагон', 'Товарищ Пентагон', 'Уралмаш', 'Мастер механосборочного цеха', 18, '⚙️'),
('Ваня', 'Ваня', 'Товарищ Ваня', 'Норильский никель', 'Начальник смены', 10, '🚀')
ON CONFLICT (username) DO NOTHING;

-- Добавление значков пользователям
INSERT INTO user_badges (user_id, badge_name) VALUES
(1, 'Ударник труда'),
(1, 'Герой социалистического труда'),
(1, 'Новатор производства'),
(2, 'Ударник труда'),
(2, 'Лучший по профессии'),
(3, 'Герой социалистического труда'),
(3, 'Победитель соревнования'),
(3, 'Ударник труда'),
(4, 'Ударник труда'),
(4, 'Новатор производства');

-- Добавление рекордов пользователям
INSERT INTO user_records (user_id, record_text) VALUES
(1, 'Перевыполнение годового плана на 165%'),
(1, 'Лучший бригадир 2025 года'),
(2, 'Разработка новой модели двигателя'),
(2, 'Рационализаторское предложение №1'),
(3, 'Перевыполнение плана 12 месяцев подряд'),
(3, 'Рекорд по производительности цеха'),
(4, 'Безаварийная работа 500 смен');

-- Создание тестовых постов
INSERT INTO posts (user_id, content, achievement_badge, likes_count, comments_count) VALUES
(1, 'Товарищи! Наша бригада перевыполнила квартальный план на 145%! Слава труду! 🏭⭐', 'Ударник труда', 0, 0),
(2, 'Завершена разработка нового двигателя для КАМАЗ-2026. Мощность увеличена на 30%, расход топлива снижен на 15%! Вперёд к новым достижениям! 🚛', 'Новатор производства', 0, 0),
(3, 'Механосборочный цех досрочно выполнил месячную программу! Производительность выросла на 40%. Так держать, товарищи! 💪⚙️', 'Герой социалистического труда', 0, 0),
(4, 'Наша смена установила новый рекорд по добыче никеля - 340 тонн за сутки! Гордимся коллективом! 🏆', NULL, 0, 0);
