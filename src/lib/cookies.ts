import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Access token expires in 15 minutes (1/96 of a day)
const ACCESS_TOKEN_EXPIRY = 1 / 96;

// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRY = 7;

// Cookie configuration
const cookieConfig = {
  secure: window.location.protocol === 'https:', // Use secure cookies in production (HTTPS)
  sameSite: 'lax' as const, // CSRF protection
};

/**
 * Store authentication tokens in cookies
 */
export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...cookieConfig,
    expires: ACCESS_TOKEN_EXPIRY,
  });

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...cookieConfig,
    expires: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Get the access token from cookies
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

/**
 * Get the refresh token from cookies
 */
export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

/**
 * Check if user has valid tokens (at least access token exists)
 */
export const hasAuthTokens = (): boolean => {
  return !!getAccessToken() || !!getRefreshToken();
};

/**
 * Clear all authentication cookies
 */
export const clearAuthTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
