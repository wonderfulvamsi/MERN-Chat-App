import React from "react";
import loogo from './speech-bubble.png'
function Chat({ username, }) {

  return (
    <>
      <div className="chat-window">
        <div className="shade">
          <div className="logowrapper">
            <img className='logo' src={loogo} height='320' width='320' />
            <h2>Join Rooms To Get Started!</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;