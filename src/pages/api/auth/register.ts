import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  username: string;
  password: string;
}

const users: User[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
}