const router = require("express").Router();
const User = require("../models/user.model");
const Room = require("../models/room.model")
const jwt = require('jsonwebtoken');
require('dotenv').config();
const [verify_token, generateAccessToken, generateRefreshToken] = require("../controller/jwtFuctions");

//usercheck
router.get("/usercheck/:username", verify_token, async (req, res) => {
    try {
        await User.findOne({
            username: req.params.username,
        }).then(data => res.status(200).json(data));
    }
    catch (err) {
        console.log(err)
    }
})

//get rooms

router.get("/:username/rooms", verify_token, async (req, res) => {
    try {
        const userinfo = await User.findOne({
            username: req.params.username,
        });
        res.status(200).json(userinfo.userrooms);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user socketid

router.get("/:username/socketid", async (req, res) => {
    try {
        const userinfo = await User.findOne({
            username: req.params.username,
        });
        res.status(200).json(userinfo.socketid);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update user socketid

router.put("/:username/socketid", async (req, res) => {
    try {
        const userinfo = await User.findOne({
            username: req.params.username,
        });
        await userinfo.updateOne({ $set: { socketid: req.body.socketid } })
        res.status(200).json(userinfo.socketid);
    } catch (err) {
        res.status(500).json(err);
    }
});


//join rooms

router.post("/:username/:roomname/joinroom", verify_token, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username, })
        if (!user) { res.status(404).json("user not found"); }
        else {
            //check if already in room
            if (user.userrooms.includes(req.params.roomname)) {
                res.status(200).json("already in the room");
            }
            else {
                //update user rooms list
                const room = await Room.findOne({ roomname: req.params.roomname })
                if (!room) { res.status(404).json("room not found"); }
                else {
                    await user.updateOne({ $push: { userrooms: req.params.roomname } })
                    await room.updateOne({ $push: { members: req.params.username } })
                    const joinedroom = await Room.findOne({ roomname: req.params.roomname })
                    res.status(200).json(joinedroom.members);
                }
            }
        }

    } catch (err) {
        res.status(500).json(err);
    }
});

//leave room
router.post("/:username/:roomname/leaveroom", verify_token, async (req, res) => {
    try {
        //update user rooms list
        const user = await User.findOne({ username: req.params.username, })
        !user && res.status(404).json("user not found");
        //check if already in room
        if (!user.userrooms.includes(req.params.roomname)) {
            res.status(200).json("already out of the room");
        }
        else {
            const room = await Room.findOne({ roomname: req.params.roomname })
            !room && res.status(404).json("room not found");
            await user.updateOne({ $pull: { userrooms: req.params.roomname } })
            await room.updateOne({ $pull: { members: req.params.username } })
            const leftroom = await Room.findOne({ roomname: req.params.roomname })
            res.status(200).json(leftroom.members);
        }

    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;