import React from 'react'

function Msg({ username, messageContent }) {
    return (
        <>
            <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
            >
                <div>
                    <div className="message-content">
                        <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                        <p id="time">{messageContent.time}</p>
                        <p id="author">{messageContent.author}</p>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Msg