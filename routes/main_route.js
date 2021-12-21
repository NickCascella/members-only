const express = require("express");
const router = express.Router();
const members_only_controller = require("../controllers/members_only");

router.get("/", members_only_controller.index);

router.get("/sign-up", members_only_controller.sign_up_get);

router.post("/sign-up", members_only_controller.sign_up_post);

router.get("/login", members_only_controller.login_get);

router.post("/login", members_only_controller.login_post);

router.get("/logout", members_only_controller.logout_get);

router.get("/members-sign-in", members_only_controller.members_get);

router.post("/members-sign-in", members_only_controller.members_post);

router.get("/create-message", members_only_controller.message_get);

router.post("/create-message", members_only_controller.message_post);

module.exports = router;
