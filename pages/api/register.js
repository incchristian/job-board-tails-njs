import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('./database.sqlite');

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      userClass TEXT NOT NULL,
      company TEXT
    )
  `);
});

export default async (req, res) => {
  if (req.method === 'POST') {
    const { name, email, password, userClass, company } = req.body;

    if (!name || !email || !password || !userClass || (userClass === 'Employer' && !company)) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        `INSERT INTO users (name, email, password, userClass, company) VALUES (?, ?, ?, ?, ?)`,

        [name, email, hashedPassword, userClass, company],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to register user.' });
          }
          res.status(201).json({ message: 'User registered successfully.' });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};