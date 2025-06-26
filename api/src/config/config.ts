export default () => ({
  database: {
    databaseUrl: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE,
  },
  cors: {
    origin: process.env.FRONTEND_URL,
  },
  port: process.env.PORT,
});
