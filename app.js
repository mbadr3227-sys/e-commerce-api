const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cartRouter = require('./routes/cart');
const db = require('./db');
const passport = require('./config/passport');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const app = express();
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Sessions stored in PostgreSQL
app.set('trust proxy', 1);
app.use(
  session({
    store: new pgSession({
      pool: db.pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
        cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API is running' });
});

// Routes
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
// API documentation
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: '/swagger-custom.css',
    customSiteTitle: 'E-Commerce API — Documentation',
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      tryItOutEnabled: true,
    },
  })
);
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;