const express = require("express");
const router = express.Router();
const members_only_controller = require("../controllers/members_only");

router.get("/", members_only_controller.index)

router.get("/sign-up", members_only_controller.sign_up_get)

router.post("/sign-up", members_only_controller.sign_up_post)

router.get("/login", members_only_controller.login_get)

router.post("/login", members_only_controller.login_post)

module.exports = router;