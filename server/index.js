const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("send_private_message", (payload) => {
    if (payload.first) {
      socket.to(payload.othersocketid.data).emit("receive_private_message_for_first_time", payload.messageData);
    }
    else {
      socket.to(payload.othersocketid.data).emit("receive_private_message", payload.messageData);

    }
  });

  //Video-Chat-Code

  socket.on("peer_created", ({ room, id }) => {
    console.log("peer created! with peer id " + id + " in " + room);
    socket.join(room)
    socket.to(room).emit('peer_connected', id);
    socket.to(room).emit('ask_peerid', id)

    socket.on('ask_peerid', ({ fromsoc, tosoc }) => {
      console.log("asking the old guy peer id")
      socket.to(tosoc.data).emit('what_is_ur_peerid', { fromsoc, tosoc });
    })

    socket.on('my_peerid', ({ id, fromsoc, tosoc }) => {
      console.log("fucking old man's peerid is " + id)
      socket.to(fromsoc.data).emit("old_man_peerid", id);
    })

    //getting reply from the peer we are calling
    socket.on('my_response', ({ acceptedref, tosoc }) => {
      console.log("the response for the call is " + acceptedref.current)
      socket.to(tosoc.data).emit("call response", acceptedref.current)
    })

    //EOC
    socket.on('EOC', (tosoc) => {
      console.log("End of Conversation send to " + tosoc.data);
      socket.to(tosoc.data).emit("Call ended",);
    })
  })

});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
