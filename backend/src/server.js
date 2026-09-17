const app = require('./app');
require('dotenv').config();

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`ERP backend listening on http://localhost:${PORT}`);
});
