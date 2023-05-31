const path = require('path');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

const { APP } = require('./config');
const { authMiddleware } = require('./middlewares/auth');

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10MB' }));

app.use('/admin', require('./routes/admin'))
app.use('/themes', authMiddleware, require('./routes/themes'));

app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(APP.PORT, '0.0.0.0', () => { console.log(`server started on port: ${APP.PORT}`); });
