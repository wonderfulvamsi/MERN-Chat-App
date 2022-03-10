import { Button, Stack } from '@mui/material'
import React, { useContext, useState } from 'react'
import './sidebar.css'
import { SearchRounded } from '@material-ui/icons'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { InputBase } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from './Card';
import { useEffect } from 'react';
import Roomcontext from './Roomcontext';
import './chat.css'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

function SideBar({ username, socket }) {

    const roomcontext = useContext(Roomcontext);
    const getMsgs = roomcontext.getMsgs;
    const setGo = roomcontext.setGo;
    const messageList = roomcontext.messageList;
    const [lastmsg, setLastmsg] = useState("")
    const [userrooms, setUserrooms] = React.useState([])
    const [room, setRoom] = React.useState("");
    const [contact, setContact] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [there, setThere] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false); setThere(false) };

    const [openfren, setOpenFren] = React.useState(false);
    const [therefren, setThereFren] = React.useState(false);
    const handleOpenFren = () => setOpenFren(true);
    const handleCloseFren = () => { setOpenFren(false); setThereFren(false) };

    const contactUser = async () => {
        //contact user
        if (contact !== '') {
            try {
                //first user has to create a room 
                await axios.post("http://localhost:5000/rooms/" + username + "/newroom", {
                    roomname: username + ' X ' + contact,
                    members: [username],
                    messages: [],
                    is_private: true
                })
                //join the contact to the room cretaed by the user
                await axios.post("http://localhost:5000/users/" + contact + '/' + username + ' X ' + contact + '/joinroom', { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } })
                setOpenFren(false)
                setUserrooms([<Card roomname={username + ' X ' + contact} setGotoroom={roomcontext.setGotoroom} getMsgs={getMsgs} setGo={setGo} lastmsg={lastmsg} socket={socket} />, ...userrooms])
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const createRoom = async () => {
        //create new room
        if (room !== '') {
            try {
                await axios.post("http://localhost:5000/rooms/" + username + "/newroom", {
                    roomname: room,
                    members: [username],
                    messages: []
                },
                    { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then((res) => console.log(res))
                setOpen(false)
                setUserrooms([<Card roomname={room} setGotoroom={roomcontext.setGotoroom} getMsgs={getMsgs} setGo={setGo} lastmsg={lastmsg} socket={socket} />, ...userrooms])
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const joinRoom = async () => {
        try {
            await axios.post("http://localhost:5000/users/" + username + '/' + room + '/joinroom', { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then((res) => console.log(res))
            await socket.on('join-room', username + ' X ' + contact);
            setOpen(false);
            setUserrooms([<Card roomname={room} setGotoroom={roomcontext.setGotoroom} getMsgs={getMsgs} setGo={setGo} lastmsg={lastmsg} socket={socket} />, ...userrooms])
        }
        catch (err) {
            console.log(err)
        }
    }

    const enterRoom = async () => {
        //check if room exists else creat one
        try {
            await axios.get("http://localhost:5000/rooms/roomcheck/" + room, { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then(res => {
                if (res.data !== null) {
                    //join existing one
                    joinRoom();
                }
                else {
                    //create new room
                    createRoom();
                }
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    const roomSearch = async (searchtext) => {
        //check if room exists else creat one
        try {
            await axios.get("http://localhost:5000/rooms/roomcheck/" + searchtext, { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then(res => {
                if (res.data !== null) {
                    setThere(true);
                }
                else {
                    setThere(false);
                }
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    const userSearch = async (searchtext) => {
        //check if user exists else shut the fuck up
        try {
            await axios.get("http://localhost:5000/users/usercheck/" + searchtext, { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then(res => {
                if (res.data !== null) {
                    setThereFren(true);
                }
                else {
                    setThereFren(false);
                }
            })
        }
        catch (err) {
            console.log(err)
        }
    }


    useEffect(
        () => {
            async function fetchData() {
                //fetch rooms
                console.log("sucking data from cloud")
                try {
                    await axios.get("http://localhost:5000/users/" + username + "/rooms", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } }).then(res => {
                        setUserrooms(res.data.map((room, i) => {
                            return (<Card roomname={room} setGotoroom={roomcontext.setGotoroom} getMsgs={getMsgs} setGo={setGo} lastmsg={lastmsg} socket={socket} key={i} />)
                        }))
                    })
                }
                catch (err) {
                    console.log(err)
                }
            }
            fetchData();
        }, [socket]);

    // instant contact making insted of a refresh
    useEffect(() => {
        socket.on("receive_private_message_for_first_time", (data) => {
            console.log("New contact made!")
            setUserrooms((list) => {
                return [<Card roomname={data.room} setGotoroom={roomcontext.setGotoroom} getMsgs={getMsgs} setGo={setGo} lastmsg={lastmsg} socket={socket} />, ...list]
            });
        });
    }, [socket]);

    return (
        <>
            <div className='wrapper'>
                <div className='header'>Your Contacts And Rooms</div>
                <div className='searchbox'><div className='search'><SearchRounded fontSize='medium' /><InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search For Contacts & Rooms"
                    inputProps={{ 'aria-label': 'search google maps' }}
                />
                </div></div>
                <div className='myrooms'>
                    {userrooms}
                </div>

                <Button style={{
                    backgroundColor: "#000000",
                    padding: "10px 36px",
                    fontSize: "18px",
                    width: '80%',
                    margin: '2px'
                }} variant="contained" onClick={handleOpen}> Join A Room</Button>
                <Button style={{
                    color: 'black',
                    backgroundColor: "white",
                    padding: "10px 36px",
                    fontSize: "18px",
                    width: '80%',
                    margin: '5px',
                }} variant="contained" onClick={handleOpenFren}> Find A Friend</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Stack direction="column" spacing={3} >
                            <TextField id="standard-basic" label="Enter Room Name" variant="standard" onChange={(e) => {
                                setRoom(e.target.value);
                                roomSearch(e.target.value);
                            }} />
                            {there ? <div>Found it!</div> : <div>No existing rooms</div>}
                            <Button variant="outlined" onClick={enterRoom}>{there ? "Join Now!" : "Create One!"}</Button>
                        </Stack>
                    </Box>
                </Modal>
                <Modal
                    open={openfren}
                    onClose={handleCloseFren}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Stack direction="column" spacing={3} >
                            <TextField id="standard-basic" label="Enter Friend Name" variant="standard" onChange={(e) => {
                                setContact(e.target.value);
                                userSearch(e.target.value);
                            }} />
                            {therefren ? <div>Got ya!</div> : <div>No existing users</div>}
                            <Button disabled={!therefren} variant="outlined" onClick={contactUser} >Conact Now!</Button>
                        </Stack>
                    </Box>
                </Modal>

            </div>
        </>
    )
}

export default SideBar
