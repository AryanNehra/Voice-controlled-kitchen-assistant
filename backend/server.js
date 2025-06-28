const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./router/authRouter');
const recipesRouter = require('./router/recipesRouter');

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('DB connection failed:', err));