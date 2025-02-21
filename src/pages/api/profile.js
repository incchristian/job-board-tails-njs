import sqlite3 from 'sqlite3';
import { getSession } from 'next-auth/react';

const db = new sqlite3.Database('./database.sqlite');

export default async (req, res) => {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  if (req.method === 'GET') {
    db.get(
      'SELECT * FROM candidates WHERE user_id = ? AND email = ?',
      [userId, userEmail],
      (err, row) => {
        if (err) {
          console.error('Error retrieving profile data:', err);
          return res.status(500).json({ error: 'Failed to retrieve profile data.' });
        }
        const profile = row || { name: '', phone: '', address: '', bio: '' };
        console.log('Fetched profile data:', profile);
        res.status(200).json(profile);
      }
    );
  } else if (req.method === 'PUT') {
    const { name, phone, address, bio } = req.body;
    console.log('Updating profile with data:', { name, phone, address, bio });

    db.run(
      'UPDATE candidates SET name = ?, phone = ?, address = ?, bio = ? WHERE user_id = ? AND email = ?',
      [name, phone, address, bio, userId, userEmail],
      function(err) {
        if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        if (this.changes === 0) {
          db.run(
            'INSERT INTO candidates (user_id, email, name, phone, address, bio) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, userEmail, name, phone, address, bio],
            (err) => {
              if (err) {
                console.error('Error creating profile:', err);
                return res.status(500).json({ error: 'Failed to create profile' });
              }
              res.status(200).json({ name, phone, address, bio });
            }
          );
        } else {
          res.status(200).json({ name, phone, address, bio });
        }
      }
    );
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};