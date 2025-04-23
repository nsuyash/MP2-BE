const mongoose = require('mongoose');
const express = require("express")
const cors = require("cors")
const app = express()

require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect")


const leadRoutes = require("./routes/lead")
const agentRoutes = require("./routes/agent")
const commentRoutes = require("./routes/comment")
const reportRoutes = require("./routes/report")


const corsOpt = {
    origin: "*",
    credentials: true
}

app.use(express.json())
app.use(cors(corsOpt))

initializeDatabase();


app.get("/", (req, res) => {
    res.send("Anvaya backend server is Live...");
  });


app.use("/api/clients", leadRoutes)
app.use("/api/sales", agentRoutes)
app.use("/api/communications" ,commentRoutes)
app.use("/api", reportRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`))
  