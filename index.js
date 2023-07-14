const express = require('express');
const dotenv = require('dotenv');
const app = express();
// const Connection = require('./src/database/database').Connection;
const router = express.Router();
const routes = require('./src/routes/routes');
dotenv.config();
const port = process.env.PORT;
const host = process.env.HOST;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.use('/', routes);

app.listen(port, ()=> {
    console.log(`[HTTP] Server running at ${host}:${port}`);
    console.log(`[HTTP] Press CTRL + C to stop it`);
})

module.exports = router;
