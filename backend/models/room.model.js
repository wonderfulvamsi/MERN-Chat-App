const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomname: { type: String, required: true, unique: true },
    members: { type: Array },
    messages: { type: Array },
    is_private: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;