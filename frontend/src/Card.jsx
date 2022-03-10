import React from 'react'
import './sidebar.css'
import uniqueRandom from 'unique-random';

function Card({ roomname, setGotoroom, getMsgs, setGo, lastmsg, socket }) {
    const random = uniqueRandom(1, 68);
    const no = random()
    const src = "https://raw.githubusercontent.com/wonderfulvamsi/NFTs/main/pic%20(" + no + ").jpg"
    return (
        <div className='room' onClick={async () => {
            setGotoroom(roomname)
            getMsgs(roomname);
            await socket.emit("join_room", roomname);
            setGo(true);
        }}>
            <img className='roompic' src={src} height='95%' width='20%' />
            <div>{roomname}</div>
        </div>
    )
}

export default Card