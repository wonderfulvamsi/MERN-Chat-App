const router = require("express").Router();
const Room = require("../models/room.model");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const [verify_token, generateAccessToken, generateRefreshToken] = require("../controller/jwtFuctions");

//add new room

router.post("/:username/newroom", verify_token, async (req, res) => {
    const newRoom = new Room(req.body);
    try {
        const savedRoom = await newRoom.save();
        //update room creator's rooms list
        const user = await User.findOne({ username: req.params.username, })
        await user.updateOne({ $push: { userrooms: req.body.roomname } })
        res.status(200).json(savedRoom);

    } catch (err) {
        res.status(500).json(err);
    }
});

//get roominfo

router.get("/:roomname/roominfo", verify_token, async (req, res) => {
    try {
        const roominfo = await Room.findOne({
            roomname: req.params.roomname,
        });
        res.status(200).json(roominfo);
    } catch (err) {
        res.status(500).json(err);
    }
});



//get messages

router.get("/:username/:roomname/messages", verify_token, async (req, res) => {
    try {
        const roominfo = await Room.findOne({
            roomname: req.params.roomname,
        });
        res.status(200).json(roominfo.messages);
    } catch (err) {
        res.status(500).json(err);
    }
});



//add a message

router.post("/:username/:roomname/messages", verify_token, async (req, res) => {
    try {
        const roominfo = await Room.findOne({
            roomname: req.params.roomname,
        });
        //res.status(200).json(roominfo);
        await roominfo.updateOne({ $push: { messages: req.body.msg } })
        const newroominfo = await Room.findOne({
            roomname: req.params.roomname,
        });
        res.status(200).json(newroominfo.messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

//roomcheck
router.get("/roomcheck/:roomname", verify_token, async (req, res) => {
    try {
        await Room.findOne({
            roomname: req.params.roomname,
        }).then(data => res.status(200).json(data));
    }
    catch (err) {
        console.log(err)
    }
})

module.exports = router;