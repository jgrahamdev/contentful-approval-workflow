const express = require("express");
const app = express();

const path = require("path")

const reactRoutes = require("./routes/react")
const eventRoutes = require("./routes/events")

app.use(express.static(path.join(__dirname, '/build')));

app.use('/app', reactRoutes)
app.use('/events', eventRoutes)

app.listen(8080, () => {console.log("Express server running")})
