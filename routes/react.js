const express = require("express")
const router = express.Router()

const reactController = require("../controllers/reactController")

router.get("/", reactController.index)

module.exports = router
