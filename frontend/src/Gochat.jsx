import axios from "axios";
import React, { useState, useContext, useEffect, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Msg from './Msg';
import Roomcontext from "./Roomcontext";
import { AddIcCall, CallEnd, Videocam } from "@material-ui/icons";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack'
import Peer from 'peerjs'

function Gochat({ username, socket }) {

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        height: '85%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    const callrecivedstyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '30%',
        height: '18%',
        bgcolor: '#263238',
        boxShadow: 24,
        color: 'white',
        p: 4,
    }

    const roomcontext = useContext(Roomcontext);

    const room = roomcontext.gotoroom;
    const messageList = roomcontext.messageList;
    const setMessageList = roomcontext.setMessageList;

    const [currentMessage, setCurrentMessage] = useState("");
    const [privateroom, setPrivateroom] = useState(false);
    const [connected, setConnected] = useState(false);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time:
                    new Date(Date.now()).getHours() +
                    ":" +
                    new Date(Date.now()).getMinutes(),
            };

            //check if private room 
            const roominfo = await axios.get("http://localhost:5000/rooms/" + room + "/roominfo", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
            if (roominfo.data.is_private) {
                //get other person socketid
                const otherguy = (roominfo.data.members[0] === username) ? roominfo.data.members[1] : roominfo.data.members[0];
                const othersocketid = await axios.get("http://localhost:5000/users/" + otherguy + "/socketid", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                //send private msg
                //lol .to() cannot be done @ client side!
                const first = roominfo.data.messages.length === 0 ? true : false;
                await socket.emit("send_private_message", { messageData, othersocketid, first });
                axios.post("http://localhost:5000/rooms/" + username + "/" + room + "/messages", {
                    msg: messageData
                }, { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                setMessageList((list) => [...list, messageData]);
                setCurrentMessage("");
                console.log("Sent " + currentMessage + " from my side to " + otherguy + " with sid " + othersocketid.data);
                console.log(othersocketid.data)
            }
            else {
                await socket.emit("send_message", messageData);
                axios.post("http://localhost:5000/rooms/" + username + "/" + room + "/messages", {
                    msg: messageData
                }, { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                setMessageList((list) => [...list, messageData]);
                setCurrentMessage("");
            }
        }
    };

    // instant msg reciving insted of a refresh
    useEffect(() => {
        socket.on("receive_message", (data) => {
            if (data.room === room) {
                setMessageList((list) => [...list, data]);
            }
        });
    }, [socket]);

    // instant private msg reciving insted of a refresh
    useEffect(() => {
        socket.on("receive_private_message", (data) => {
            console.log("got a private text!")
            if (data.room === room) {
                setMessageList((list) => [...list, data]);
            }
        });
    }, [socket]);

    useEffect(() => {
        socket.on("receive_private_message_for_first_time", (data) => {
            if (data.room === room) {
                setMessageList((list) => [...list, data]);
            }
        });
    }, [socket]);

    useEffect(() => {
        async function privatecheck() {
            //check if private room 
            const roominfo = await axios.get("http://localhost:5000/rooms/" + room + "/roominfo", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
            if (roominfo.data.is_private) {
                setPrivateroom(true);
            }
            else {
                setPrivateroom(false)
            }
        }
        privatecheck();
    }, [room])


    var peer = new Peer(undefined, {
        host: '/',
        port: '3003',
        debug: 3,
        secure: false
    });

    const [loaded, setLoaded] = useState(false);
    const [call, setCall] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [mypeerid, setMypeerid] = useState("blaa blaaa")
    const [otherguypeerid, setOtherguypeerid] = useState("")
    const [otherguysocketid, setOtherguysocketid] = useState("other socket")
    const [callended, setCallended] = useState(false)

    const acceptedref = useRef(false);

    const myVideo = useRef()
    const userVideo = useRef()
    const myVideores = useRef()
    const userVideores = useRef()
    const mystreamref = useRef();

    const [openRecivedCall, setopenRecivedCall] = React.useState(false);
    const handleOpenRecivedCall = () => setopenRecivedCall(true);
    const handleCloseRecivedCall = () => setopenRecivedCall(false);

    //making a call
    const makeCall = async () => {
        setCall(true);
        setCallended(false);
        //make a call and send the stream.
        mystreamref.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        myVideo.current.srcObject = mystreamref.current;
        console.log("calling to " + otherguypeerid)
        const call = peer.call(otherguypeerid, mystreamref.current)
        socket.on("call response", async (res) => {
            if (res) {
                setLoaded(true);
                setConnected(true);
                call.on('stream', userVideoStream => {
                    userVideo.current.srcObject = userVideoStream;
                })
            }
            else {
                setCallended(true);
            }
        })
    }

    useEffect(
        async () => {
            peer.on('open', async (id) => {
                //setEoc(false);
                setMypeerid(id);
                console.log("My peerid is " + id);
                //send peer id 
                socket.emit("peer_created", { room, id });

                const roominfo = await axios.get("http://localhost:5000/rooms/" + room + "/roominfo", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                const otherguy = (roominfo.data.members[0] === username) ? roominfo.data.members[1] : roominfo.data.members[0];
                const fromsoc = await axios.get("http://localhost:5000/users/" + username + "/socketid", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                const tosoc = await axios.get("http://localhost:5000/users/" + otherguy + "/socketid", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
                //req the socket server to ask the peerid
                socket.emit('ask_peerid', { fromsoc, tosoc });
                // responding the server cuz for some reason usestate isn't working
                socket.on('what_is_ur_peerid', ({ fromsoc, tosoc }) => {
                    socket.emit("my_peerid", { id, fromsoc, tosoc })
                })
            })
        }, []);

    const handleCloseCall = async () => {
        const roominfo = await axios.get("http://localhost:5000/rooms/" + room + "/roominfo", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
        const otherguy = (roominfo.data.members[0] === username) ? roominfo.data.members[1] : roominfo.data.members[0];
        const tosoc = await axios.get("http://localhost:5000/users/" + otherguy + "/socketid", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
        socket.emit("EOC", tosoc);
        setLoaded(false);
        setCall(false);
        setAccepted(false);
        if (mystreamref.current) {
            mystreamref.current.getTracks().forEach(function (track) {
                track.stop();
            });

        }
    }

    useEffect(
        async () => {
            //finally getting the old one's peerid
            socket.on('old_man_peerid', oldpeerid => {
                setOtherguypeerid(oldpeerid);
            })

            //when other guy joined the room
            socket.on('peer_connected', (peerid) => {
                setOtherguypeerid(peerid);
            })
            //how to respond to a call recived
            const roominfo = await axios.get("http://localhost:5000/rooms/" + room + "/roominfo", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
            const otherguy = (roominfo.data.members[0] === username) ? roominfo.data.members[1] : roominfo.data.members[0];
            const tosoc = await axios.get("http://localhost:5000/users/" + otherguy + "/socketid", { headers: { 'authorization': 'Barer ' + sessionStorage.getItem('accesstoken') } });
            peer.on('call', async (call) => {
                //setEoc(false);
                console.log("call coming!")
                setCallended(false);
                setopenRecivedCall(true)
                setTimeout(async () => {
                    //sending our response
                    //it is taking the deafult value of accepted that is false
                    //and not considering the result of the openRecivedCall component
                    //i think we need to turn that into a promise!
                    socket.emit("my_response", { acceptedref, tosoc })
                    //need to get this "accepted" msg from socket man!
                    setLoaded(false);
                    if (acceptedref.current) {
                        mystreamref.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        //for some wierd reason myVideores is not working!
                        myVideores.current.srcObject = mystreamref.current;
                        call.answer(mystreamref.current);
                        call.on('stream', (stream) => {
                            //set caller video in calle's UI
                            //for some wierd reason userVideores is not working!
                            setLoaded(true);
                            userVideores.current.srcObject = stream;
                        })
                    }
                }, 6000);
            })
        }, [socket, accepted]);

    useEffect(() => {
        acceptedref.current = accepted
    }, [accepted])

    useEffect(() => {
        socket.on("Call ended", () => {
            //code to close call
            setCall(false);
            setAccepted(false);
            setCallended(false);
            if (mystreamref.current) {
                mystreamref.current.getTracks().forEach(function (track) {
                    track.stop();
                });
            }
            setLoaded(false);
        })
    }, [])

    return (
        < div className="chat-window-wrapper" >
            <div className="chat-window">
                <div className="chat-header">
                    <p>@{room}</p>
                    {privateroom ?
                        <p id="call" onClick={() => { makeCall(); }}><AddIcCall style={{ marginRight: '5px', marginLeft: '0px', }} />Make a call</p>
                        : <></>}
                    <Modal
                        open={call}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Stack direction="column" spacing={3} >
                                <div className="call-status">{connected ? 'Connected to ' + room : 'Connecting to ' + room}</div>
                                <div className="call-grid">
                                    <div className="video" style={{ backgroundColor: '#34383a' }}>
                                        <video playsInline muted ref={myVideo} autoPlay style={{ height: '100%', width: '100%' }}></video>
                                    </div>
                                    <div className="video" style={{ backgroundColor: '#34383a' }} >
                                        {(callended) ? <h1 style={{ color: 'white', position: 'relative', top: '40%', left: '40%' }} > Call declined!</h1> : < video playsInline ref={userVideo} autoPlay style={{ height: '100%', width: '100%' }} />}:
                                    </div>
                                </div>
                                <div className='call-bottom'>
                                    <div className="endcall"><CallEnd fontSize="large" onClick={() => { handleCloseCall(); }} style={{ padding: '5px' }} /></div>
                                </div>
                            </Stack>
                        </Box>
                    </Modal>
                    <Modal
                        open={openRecivedCall}
                        onClose={handleCloseRecivedCall}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={callrecivedstyle}>
                            <Stack direction="column" spacing={3} >
                                <h3 style={{ margin: '2px' }}>Call reciving...</h3>
                                <div className='reply'>
                                    <div className='startcall'>
                                        <AddIcCall fontSize='large' onClick={() => { setopenRecivedCall(false); setAccepted(true); }}>Answer</AddIcCall>
                                    </div>
                                    <div className="endcalls">
                                        <CallEnd fontSize='large' onClick={() => { setopenRecivedCall(false); setAccepted(false); }}>Decline</CallEnd>
                                    </div>
                                </div>
                            </Stack>
                        </Box>
                    </Modal>
                    <Modal
                        open={true}
                        onClose={handleCloseRecivedCall}
                        sx={accepted ? {} : { display: 'none' }}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Stack direction="column" spacing={3} >
                                <div className="call-status">{loaded ? 'Connected to ' + room : 'Please wait while connecting...'}</div>
                                <div className="call-grid">
                                    <div className="video" style={{ backgroundColor: '#34383a' }}>
                                        <video playsInline muted ref={myVideores} autoPlay style={{ height: '100%', width: '100%' }}></video>
                                    </div>
                                    <div className="video" style={{ backgroundColor: '#34383a' }} >
                                        <video playsInline ref={userVideores} autoPlay style={{ height: '100%', width: '100%' }} />:
                                    </div>
                                </div>
                                <div className='call-bottom'>
                                    <div className="endcall"><CallEnd fontSize="large" onClick={() => { handleCloseCall(); }} style={{ padding: '5px' }} /></div>
                                </div>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
                <div className="chat-body">
                    <ScrollToBottom className="message-container">
                        {messageList.map((messageContent, i) => {
                            return (
                                <Msg username={username} messageContent={messageContent} key={i} />
                            );
                        })}
                    </ScrollToBottom>
                </div>
                <div className="chat-footer">
                    <input
                        type="text"
                        value={currentMessage}
                        placeholder="Hey..."
                        onChange={(event) => {
                            setCurrentMessage(event.target.value);
                        }}
                        onKeyPress={(event) => {
                            event.key === "Enter" && sendMessage();
                        }}
                    />
                    <button onClick={sendMessage}>&#9658;</button>
                </div>
            </div>
        </div >
    );
}

export default Gochat;


//creating peer account

/*

video chat:
+++++++++++++++++++++++++++++++++++++++++
create a peer account in home.jsx

get peer id of the current user and store it somewere

define both calle & caller logic
send caller logic into Gochat.jsx as params 
+++++++++++++++++++++++++++++++++++++++++
@ caller side 

1. get the calle's peer id using socket connection
2. start a call 
3. send caller's data along with video

@ calle side 

1. on "call" event:
2. if calle answered the call{
    on answer(calle stream) => send video
    on stream(caller stream) => render UI
    }

*/