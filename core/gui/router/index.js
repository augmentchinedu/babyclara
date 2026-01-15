const express = require("express");

const controller = require("../controller");

const router = express.Router();

router.get("/workstation", controller.getWorkstation);



router.post("/auth/signup", controller.signup);
router.post("/auth/signin", controller.signin);


module.exports = router;
