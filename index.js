const express = require('express');

const bybit = require("./api/bybit");
// Create an instance of express
const app = express();

app.use(express.json({ extended: false }));

app.use("/api/bybit", bybit);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
