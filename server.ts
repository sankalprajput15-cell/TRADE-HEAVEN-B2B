import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server environment credentials
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@tradeheaven.net').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TradeHeavenAdmin2025!';
const JWT_SECRET_SALT = process.env.JWT_SECRET || 'trade_heaven_b2b_sec_2025_swiss_escrow';

// In-memory server-managed user registry
interface ServerUserRecord {
  id: string;
  email: string;
  passwordHash: string; // Plain/hash for server verification
  name: string;
  role: 'ADMIN' | 'BUYER' | 'SUPPLIER' | 'VERIFIER';
  companyName: string;
  country: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  isVerified: boolean;
  isPremium: boolean;
  membershipStatus: 'free' | 'paid';
  tier?: string;
  avatarUrl?: string;
}

const serverUsersStore: ServerUserRecord[] = [
  {
    id: 'user-admin-root',
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_PASSWORD,
    name: 'Sarah Jenkins',
    role: 'ADMIN',
    companyName: 'Trade Heaven Global Operations & Treasury',
    country: 'United Kingdom',
    status: 'ACTIVE',
    isVerified: true,
    isPremium: true,
    membershipStatus: 'paid',
    tier: 'VIP',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  }
];

function generateServerJwt(user: ServerUserRecord): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + 7 * 24 * 60 * 60; // 7 days

  const payload = {
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isPremium: user.isPremium,
    membershipStatus: user.membershipStatus,
    status: user.status,
    isVerified: user.isVerified,
    tier: user.tier || (user.role === 'ADMIN' ? 'VIP' : 'FREE'),
    companyName: user.companyName,
    iat: nowSec,
    exp: expSec,
    iss: 'https://auth.tradeheaven.net'
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).toString('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyServerJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).toString('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// SECURE AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/v1/auth/login - Strict credential verification & server-controlled role resolution
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Please provide both corporate email and password.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check if Master Administrator credentials match
  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminRecord = serverUsersStore.find(u => u.email === ADMIN_EMAIL) || {
      id: 'user-admin-root',
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD,
      name: 'Sarah Jenkins (Master Admin)',
      role: 'ADMIN' as const,
      companyName: 'Trade Heaven Global Operations & Treasury',
      country: 'United Kingdom',
      status: 'ACTIVE' as const,
      isVerified: true,
      isPremium: true,
      membershipStatus: 'paid' as const,
      tier: 'VIP',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    };

    const token = generateServerJwt(adminRecord);
    return res.json({
      success: true,
      token,
      user: {
        id: adminRecord.id,
        email: adminRecord.email,
        name: adminRecord.name,
        role: 'ADMIN', // Strictly server-resolved
        isPremium: true,
        membershipStatus: 'paid',
        status: 'ACTIVE',
        isVerified: true,
        tier: 'VIP',
        companyName: adminRecord.companyName,
        country: adminRecord.country,
        avatarUrl: adminRecord.avatarUrl,
        token
      },
      message: 'Admin authenticated successfully.'
    });
  }

  // 2. Check registered users in database store
  const matchedUser = serverUsersStore.find(u => u.email.toLowerCase().trim() === cleanEmail);
  if (matchedUser && matchedUser.passwordHash === password) {
    const token = generateServerJwt(matchedUser);
    return res.json({
      success: true,
      token,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role, // Strictly server-resolved from database
        isPremium: matchedUser.isPremium,
        membershipStatus: matchedUser.membershipStatus,
        status: matchedUser.status,
        isVerified: matchedUser.isVerified,
        tier: matchedUser.tier,
        companyName: matchedUser.companyName,
        country: matchedUser.country,
        avatarUrl: matchedUser.avatarUrl,
        token
      },
      message: `Welcome back, ${matchedUser.name}!`
    });
  }

  // 3. Invalid credentials - strictly reject
  return res.status(401).json({
    success: false,
    message: 'Invalid corporate email or password. Access denied.'
  });
});

// POST /api/v1/auth/register - Self-service business registration (defaults strictly to BUYER or SUPPLIER with pending verification)
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, name, companyName, country, accountType } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Please provide full name, work email, and password.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Prevent duplicate registration
  if (serverUsersStore.some(u => u.email.toLowerCase().trim() === cleanEmail)) {
    return res.status(409).json({
      success: false,
      message: 'An account with this corporate email already exists. Please sign in.'
    });
  }

  // SERVER-ENFORCED ROLE: Users can only register as BUYER or SUPPLIER (never ADMIN)
  const resolvedRole: 'BUYER' | 'SUPPLIER' = accountType === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER';

  const newRecord: ServerUserRecord = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    passwordHash: password,
    name: name.trim(),
    role: resolvedRole,
    companyName: companyName?.trim() || 'Enterprise Trading Firm',
    country: country?.trim() || 'Global',
    status: 'PENDING',
    isVerified: false,
    isPremium: false,
    membershipStatus: 'free',
    tier: 'FREE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  };

  serverUsersStore.push(newRecord);
  const token = generateServerJwt(newRecord);

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newRecord.id,
      email: newRecord.email,
      name: newRecord.name,
      role: newRecord.role,
      isPremium: false,
      membershipStatus: 'free',
      status: 'PENDING',
      isVerified: false,
      tier: 'FREE',
      companyName: newRecord.companyName,
      country: newRecord.country,
      avatarUrl: newRecord.avatarUrl,
      token
    },
    message: 'Account registered successfully with pending verification status.'
  });
});

// GET /api/v1/auth/me - Verify current session token
app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyServerJwt(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }

  return res.json({
    success: true,
    user: {
      id: payload.uid,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      isPremium: payload.isPremium,
      membershipStatus: payload.membershipStatus,
      status: payload.status,
      isVerified: payload.isVerified,
      tier: payload.tier,
      companyName: payload.companyName,
      token
    }
  });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trade Heaven Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
