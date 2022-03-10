import React from 'react'
import { Box, Stack, Button, Model } from '@mui/material';
import Modal from '@mui/material/Modal';
import { Link } from 'react-router-dom';
import SideBar from './SideBar';
import Chat from './Chat';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import Roomcontext from './Roomcontext';
import Gochat from './Gochat'
import { Lock } from '@material-ui/icons';
import './App.css';
import { AddIcCall, CallEnd, Videocam } from "@material-ui/icons";
import Peer from 'peerjs';
import jwt_decode from "jwt-decode";

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

function Home({ socket }) {
    const { username } = useParams();
    const [gotoroom, setGotoroom] = useState('blabla');
    const [messageList, setMessageList] = useState([]);
    const [go, setGo] = useState(0);

    const [openLogout, setOpenLogout] = React.useState(false);
    const handleOpenLogout = () => setOpenLogout(true);
    const handleCloseLogout = () => setOpenLogout(false);

    //refreshing function
    const axiosJWT = axios.create();
    const refreshFunction = async () => {
        try {
            const res = await axiosJWT.post("http://localhost:5000/auth/jwt/refresh", { token: sessionStorage.getItem('refreshtoken'), username: username });
            sessionStorage.setItem('accesstoken', res.data.accessToken)
            sessionStorage.setItem('refreshtoken', res.data.refreshToken)
            console.log("fetdched the new token!")
        } catch (err) {
            console.log(err);
        }
    };

    //do this for every axios req
    axios.interceptors.request.use(
        async (req) => {
            let currentDate = new Date();
            const decodedToken = jwt_decode(sessionStorage.getItem('accesstoken'));
            //checking for expire tym
            //let's assume the tym taken to reach the server is 2sec then we need to add that tym too ryt?
            const transfer_tym = 2 * 1000; //2
            if (decodedToken.exp * 1000 < (currentDate.getTime() + transfer_tym)) {
                console.log("token expired! getting new 1")
                const oldtoken = sessionStorage.getItem('accesstoken');
                await refreshFunction();
                const newtoken = sessionStorage.getItem('accesstoken');
                console.log(oldtoken === newtoken);
                req.headers["authorization"] = "Bearer " + sessionStorage.getItem('accesstoken');
                return req;
            }
            return req;
        },
        (error) => {
            return Promise.reject(error);
        }
    );



    const getMsgs = async (room) => {
        //fetching prev msgs
        try {
            await axios.get("http://localhost:5000/rooms/" + username + "/" + room + "/messages", { headers: { 'authorization': 'Bearer ' + sessionStorage.getItem('accesstoken') } }).then((res) => {
                setMessageList([...res.data]);
            });
        }
        catch (err) {
            console.log(err)
        }
    }

    async function updateSocketid() {
        //update Socketid
        socket.on('connect', async () => {
            try {
                await axios.put("http://localhost:5000/users/" + username + "/socketid", {
                    socketid: socket.id
                })
                console.log("updating sids in DB");
            }
            catch (err) {
                console.log(err)
            }
        })
    }

    updateSocketid();

    axios.put("http://localhost:5000/users/" + username + "/socketid", {
        socketid: socket.id
    }).then(res =>
        console.log("updating sids in DB for first tym"))

    useEffect(
        () => {
            updateSocketid();
        }, [socket]);

    return (
        <>
            <div className="topbar">
                <h3 className='topbartext'>React Chat App</h3>
                <div className='logout' onClick={handleOpenLogout}><Lock />Logout</div>
            </div>
            <Stack direction="row" spacing={0} >
                <Roomcontext.Provider value={{ gotoroom, setGotoroom, getMsgs, messageList, setMessageList, go, setGo, }}>
                    <SideBar username={username} socket={socket} />
                    {go ? <Gochat username={username} socket={socket} /> : <Chat username={username} />}
                    <Modal
                        open={openLogout}
                        onClose={handleCloseLogout}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Stack direction="column" spacing={3} >
                                <h3>Are You Sure?</h3>
                                <div>See you soon!</div>
                                <Button variant="outlined" component={Link} to='/' onClick={() => { console.log("logged out"); sessionStorage.clear() }}>Yup</Button>
                            </Stack>
                        </Box>
                    </Modal>
                </Roomcontext.Provider>
            </Stack>
        </>
    )
}

export default Home