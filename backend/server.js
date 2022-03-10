const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


const uri = process.env.ATLAS_URI;
mongoose.connect(uri,);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');

app.use('/rooms', roomRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

/*

++++++++++++++++++++++++++++++++++++
JWT Auth
++++++++++++++++++++++++++++++++++++

Backend
=======
0. define verify middelware
1. acess token, refresh token genenration functions
2. add the verify middleware to all
3. refresh token check and new acess token route

========
Frontend
========
0. auth when logged in / signed up => generate & give acess & refresh token
1. save the cookie 
2. for every req from frontend send the acess token in header
3. for every refresh tym send the new acess token req to the server

*/