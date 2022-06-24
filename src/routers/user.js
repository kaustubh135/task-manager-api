const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail, sendCancelationEmail} = require("../email/email")

const router = express.Router();

router.post("/users", async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name)
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.status(200).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = await req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();

		res.send("Logged Out Successfully");
	} catch (e) {
		res.status(500).send({ error: "Unable to Logout" });
	}
});

router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];

		await req.user.save();

		res.send("Logged Out of All Devices Successfully");
	} catch (e) {
		res.status(500).send({ error: "Unable to Logout" });
	}
});

router.get("/users/:id", async (req, res) => {
	const _id = req.params.id;
	try {
		const user = await User.findById(_id);
		if (!user) {
			return res.status(404).send({ error: 404 });
		}
		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.patch("/users/me", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "age", "password"];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid Updates" });
	}
	try {
		const user = req.user;
		updates.forEach((update) => (user[update] = req.body[update]));
		await user.save();

		res.status(200).send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.delete("/users/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		sendCancelationEmail(req.user.email, req.user.name)
		res.status(200).send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error("Please Upload Images with Valid Extensions"));
		}

		cb(undefined, true);
	},
});

router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) {
			throw new Error("User or Avatar not found");
		}

		res.set("Content-Type", "image/jpg");
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send(e);
	}
});

router.post(
	"/users/me/avatar",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete("/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send(req.user);
});

module.exports = router;
