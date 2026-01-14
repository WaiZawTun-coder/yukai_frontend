"use client";
import React, { useState } from 'react';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const Chat = () => {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      console.log("Sending message:", inputText);
      setInputText(""); 
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="back-button">
        <WestRoundedIcon style={{ verticalAlign: 'middle' , fontSize:20 }} /> 
        </div>
        <img src="./Images/Eunsoo.jpg" alt="Profile" className="profile-pic" />
        <div className="user-info">
          <span className="user-name">Thant Sithu Thein </span>
          <span className="last-seen">last seen recently</span>
        </div>
        <div className="header-icon"><CallRoundedIcon style={{ fontSize:30}} /></div>
        <div className="header-icon"><VideocamRoundedIcon style={{ fontSize:30}}/></div>
        <div className="header-icon"><MoreVertRoundedIcon style={{ fontSize:30}}/></div>
        
      </div>

      {/* Message Area */}
      <div className="message-list">
        <div className="message outgoing">
          <div className="bubble">
            Japan looks amazing! 
            <span className="time">10:10 ✓✓</span>
          </div>
        </div>

        <div className="message incoming">
          <div className="bubble">
            <div className="reply-bar">
              <strong>Thant Sithu Thein</strong><br/>Good morning!
            </div>
            Do you know what time is it?
            <span className="time">11:40</span>
          </div>
        </div>

        <div className="message outgoing">
          <div className="bubble">
            It's morning in Tokyo 
            <span className="time">11:43 ✓✓</span>
          </div>
        </div>

        <div className="message incoming">
          <div className="bubble">
            What is the most popular meal in Japan? 
            <span className="time">11:45</span>
          </div>
        </div>

        <div className="message outgoing">
          <div className="bubble">
            I think top two are: 
            <span className="time">11:50 ✓✓</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="icon-clip">
          <AttachFileRoundedIcon />
        </div>
        
        <input 
          type="text" 
          placeholder="Message" 
          className="chat-input"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
        />

        <div className="icon-sticker">
          <SentimentSatisfiedAltRoundedIcon />
        </div>
        
        
        <div 
          className="icon-mic" 
          onClick={handleSend} 
          style={{ color: inputText.trim() ? '#007aff' : '#888',
          transition: 'color 0.2s ease' 
          }}
        >
          {inputText.trim() ? <SendRoundedIcon /> : <MicRoundedIcon />}
        </div>
      </div>
    </div>
  );
};

export default Chat;