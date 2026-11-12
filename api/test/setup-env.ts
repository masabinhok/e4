// Runs before AppModule is imported, because config.ts reads process.env at load time.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'mongodb://localhost:27017/e4-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
// Rate limits would trip on the many signups in these suites; throttle.e2e-spec turns them back on.
process.env.DISABLE_THROTTLE = 'true';
process.env.PROXY_SECRET = 'test-proxy-secret';
