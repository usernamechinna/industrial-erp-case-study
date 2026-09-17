require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT || 4000);

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => console.log(`ERP backend listening on http://localhost:${PORT}`));
}

start().catch(error => { console.error('Unable to start backend:', error); process.exit(1); });
