const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 4000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established.");
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
    process.exit(1);
  });


