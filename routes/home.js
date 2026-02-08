const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
 res.send("Home route works Yay!");
});

module.exports = router;
