const jwt = require('jsonwebtoken');

// Секретный ключ из .env.development
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long-for-development';

// Текущее время и время истечения (10 лет)
const now = Math.floor(Date.now() / 1000);
const expires = now + (10 * 365 * 24 * 60 * 60); // 10 лет

// Генерация anon токена
const anonPayload = {
  iss: 'supabase-dev',
  role: 'anon',
  iat: now,
  exp: expires
};

// Генерация service_role токена
const servicePayload = {
  iss: 'supabase-dev',
  role: 'service_role',
  iat: now,
  exp: expires
};

const anonToken = jwt.sign(anonPayload, JWT_SECRET);
const serviceToken = jwt.sign(servicePayload, JWT_SECRET);

console.log('JWT_SECRET=' + JWT_SECRET);
console.log('SUPABASE_ANON_KEY=' + anonToken);
console.log('SUPABASE_SERVICE_KEY=' + serviceToken);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=' + anonToken);
