import './App.css';
import io from "socket.io-client";
import {useEffect, useState} from "react";


let timeformatted;
let isHost = true;

const socket = io.connect("http://185.211.61.164:3001");

const requestServerTime = () => {
  socket.emit("request_server_time");
}

const setServerTime = (value) => {
  socket.emit("set_server_time", value*60)
}

const toggleActive = (condition) => {
  socket.emit("toggle_active_status", condition)
}

const sendResetTimer = () => {
  socket.emit("reset_timer")
}

setInterval(requestServerTime, 1000);


const toggleHost = (condition) => {
  isHost = condition;
}

function App() {

  // Time Formatting
  const secondsToHMS = (secs) => {
    secs = Number(secs);

    var h = Math.floor(secs / 3600);
    var m = Math.floor(secs % 3600 / 60);
    var s = Math.floor(secs % 3600 % 60);

    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);

  } 

  // Time Set UseState
  const[time, setTime] = useState(600);

    // Server Time Live Update
    useEffect(() => {
      socket.on("receive_server_time", (data) => {

        setTime(data);
        timeformatted = secondsToHMS(data);
        //console.log(data);

      })
    }, [socket])

  //HTML Frontend
  return (

    <div className="App">

      {isHost &&
      <div>
      <button onClick={() => toggleHost(false)}>Client View</button>
      </div>
      }   


      <h1>{timeformatted}</h1>

      {isHost && 
      <div id='buttonsTime'>
      <button onClick={() => setServerTime(5)}>+5</button>
      <button onClick={() => setServerTime(10)}>+10</button>
      <button onClick={() => setServerTime(-5)}>-5</button>
      <button onClick={() => setServerTime(-10)}>-10</button>
      </div>
      }

      {isHost && 
      <div id="buttonsSSR">
      <button onClick={() => toggleActive(true)}>Start</button>
      <button onClick={() => toggleActive(false)}>Stop</button>
      <button onClick={() => sendResetTimer()}>Reset</button>
      <p>Hooked Server Time (Seconds): {time}</p>
      </div>
      }


    </div>
  );
}

export default App;
