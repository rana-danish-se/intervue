import crypto from 'crypto';

const generateVerifyToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

export default generateVerifyToken;

/*
FILE: src/utils/generateVerifyToken.js
ROLE: Cryptographic token generator utility. Creates a secure random token pair used for email verification and password-reset flows. The raw token is sent to the user (via URL), while only the hashed version is stored in the database, preventing token theft from a DB leak.

FUNCTIONS / LOGIC:
  - generateVerifyToken() — uses crypto.randomBytes(32) to generate 32 bytes of cryptographically secure random data, then converts it to a 64-character hex string (rawToken). Immediately hashes the rawToken using SHA-256 via crypto.createHash('sha256') to produce hashedToken. Returns both as { rawToken, hashedToken }. The rawToken is embedded in the email link; the hashedToken is saved to the user document for later comparison.

IMPORTED BY:
  - src/services/auth.service.js — imports generateVerifyToken as the default export and calls it inside createUser() (for email verification tokens) and createPasswordResetToken() (for password reset tokens).
*/
