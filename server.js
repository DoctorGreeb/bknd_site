const express = require('express');
   const betterSqlite3 = require('better-sqlite3');
   const bcrypt = require('bcrypt');
   const session = require('express-session');
   const path = require('path');

   const app = express();

   // Настройка сессий
   app.use(session({
       secret: 'your-secret-key', // Замените на безопасный ключ
       resave: false,
       saveUninitialized: false,
       cookie: { secure: false } // Установите secure: true для HTTPS
   }));

   // Парсинг JSON
   app.use(express.json());

   // Статическая папка для HTML, CSS, JS
   app.use(express.static(path.join(__dirname, 'public')));

   // Инициализация базы данных
   const db = betterSqlite3('./users.db');
   db.exec(`CREATE TABLE IF NOT EXISTS users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       username TEXT UNIQUE NOT NULL,
       password TEXT NOT NULL
   )`);

    // Создание таблицы для комментариев
   db.exec(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);


   // Маршрут для главной страницы
   app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });

   // Маршрут для регистрации
   app.post('/api/register', async (req, res) => {
       const { username, password } = req.body;
       if (!username || !password) {
           return res.status(400).json({ error: 'Введите имя пользователя и пароль' });
       }

       try {
           const hashedPassword = await bcrypt.hash(password, 10);
           const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
           const result = stmt.run(username, hashedPassword);
           req.session.user = { id: result.lastInsertRowid, username };
           res.json({ message: 'Регистрация успешна', username });
       } catch (error) {
           if (error.code === 'SQLITE_CONSTRAINT') {
               return res.status(400).json({ error: 'Пользователь уже существует' });
           }
           res.status(500).json({ error: 'Ошибка сервера' });
       }
   });

   // Маршрут для авторизации
   app.post('/api/login', async (req, res) => {
       const { username, password } = req.body;
       if (!username || !password) {
           return res.status(400).json({ error: 'Введите имя пользователя и пароль' });
       }

       const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
       const user = stmt.get(username);
       if (!user) {
           return res.status(400).json({ error: 'Пользователь не найден' });
       }

       const match = await bcrypt.compare(password, user.password);
       if (!match) {
           return res.status(400).json({ error: 'Неверный пароль' });
       }

       req.session.user = { id: user.id, username: user.username };
       res.json({ message: 'Вход успешен', username: user.username });
   });

   // Маршрут для проверки текущего пользователя
   app.get('/api/user', (req, res) => {
       if (req.session.user) {
           res.json({ username: req.session.user.username });
       } else {
           res.status(401).json({ error: 'Не авторизован' });
       }
   });

   // проверка сессии
   app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ isLoggedIn: true, username: req.session.user.username });
    } else {
        res.json({ isLoggedIn: false });
    }
});

   // Маршрут для выхода
   app.post('/api/logout', (req, res) => {
       req.session.destroy();
       res.json({ message: 'Выход успешен' });
   });

   // Получение всех комментариев
app.get('/api/comments', (req, res) => {
    const comments = db.prepare(`
        SELECT id, username, text, user_id FROM comments ORDER BY id DESC
    `).all();

    const userId = req.session.user?.id;

    const result = comments.map(c => ({
        id: c.id,
        username: c.username,
        text: c.text,
        canEdit: c.user_id === userId
    }));

    res.json(result);
});

// Добавление комментария
app.post('/api/comments', (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Не авторизован' });

    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Пустой комментарий' });
    }

    const stmt = db.prepare('INSERT INTO comments (user_id, username, text) VALUES (?, ?, ?)');
    stmt.run(user.id, user.username, text.trim());

    res.json({ success: true });
});

// Удаление комментария
app.delete('/api/comments/:id', (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Не авторизован' });

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!comment || comment.user_id !== user.id) {
        return res.status(403).json({ error: 'Нет доступа' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Редактирование комментария
app.put('/api/comments/:id', (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Не авторизован' });

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!comment || comment.user_id !== user.id) {
        return res.status(403).json({ error: 'Нет доступа' });
    }

    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Пустой комментарий' });
    }

    db.prepare('UPDATE comments SET text = ? WHERE id = ?').run(text.trim(), req.params.id);
    res.json({ success: true });
});


   // Закрытие базы данных при завершении работы сервера
   process.on('SIGINT', () => {
       db.close();
       process.exit();
   });

   // Запуск сервера
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
       console.log(`Сервер запущен на порту ${PORT}`);
   });