import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/*
FILE: src/utils/generateToken.js
ROLE: JWT token factory utility. Provides two dedicated functions for generating short-lived access tokens and long-lived refresh tokens, each signed with their own separate secrets to allow independent rotation and revocation strategies.

FUNCTIONS / LOGIC:
  - generateAccessToken(userId) — signs a JWT payload of { id: userId } using the JWT_SECRET environment variable with a 15-minute expiry. Returns the signed token string. Used to grant short-lived API access; forces re-authentication via the refresh token after 15 minutes.
  - generateRefreshToken(userId) — signs a JWT payload of { id: userId } using the JWT_REFRESH_SECRET environment variable with a 7-day expiry. Returns the signed token string. Stored as an httpOnly cookie and used exclusively by the /refresh-token endpoint to silently mint a new access token without requiring the user to log in again.

IMPORTED BY:
  - src/controllers/auth.controller.js — imports { generateAccessToken, generateRefreshToken } and calls both inside sendTokenResponse(), googleCallback(), and refreshToken() to issue or rotate auth cookies.
*/