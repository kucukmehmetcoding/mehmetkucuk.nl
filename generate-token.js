const crypto = require('crypto');

// .env dosyasından secret'ı oku
const secret = process.env.NEXTAUTH_SECRET || 'z4gE7pbOT3wVYCNcpIr4z9HyzSqAvXCbQd/JGSpZ61Y=';

// Base64 URL encode helper
function base64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// JWT header
const header = {
  alg: 'HS256',
  typ: 'JWT'
};

// JWT payload
const payload = {
  sub: 'admin',
  role: 'admin',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 saat
};

// Token oluştur
const headerEncoded = base64url(JSON.stringify(header));
const payloadEncoded = base64url(JSON.stringify(payload));
const signatureInput = headerEncoded + '.' + payloadEncoded;

// HMAC-SHA256 ile imzala
const signature = crypto
  .createHmac('sha256', secret)
  .update(signatureInput)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

const token = signatureInput + '.' + signature;

console.log('\n=== ADMIN JWT TOKEN ===\n');
console.log(token);
console.log('\n=== KULLANIM ===\n');
console.log('1. Admin paneline git: http://localhost:3000/tr/admin');
console.log('2. Cookie veya header ile token gönder');
console.log('   Authorization: Bearer ' + token);
console.log('\n');

