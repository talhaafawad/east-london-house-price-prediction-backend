const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");

const auth = require("../middleware/auth");
const { User, validate } = require("../models/user");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.send(user);
});

router.get("/details/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  return res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ errorMessage: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json({ errorMessage: "User with given email already registered." });

  user = new User(
    _.pick(req.body, [
      "name",
      "email",
      "password",
      "phoneNo",
      "experience",
      "userType",
      "profilePicture",
    ])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  return res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email", "userType"]));
});

router.put("/", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found for given email." });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/artists", auth, async (req, res) => {
  try {
    const sellers = await User.find({ userType: "seller" }).select("name profilePicture");
    return res.json({ artists: sellers });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred while fetching sellers" });
  }
});

module.exports = router;
