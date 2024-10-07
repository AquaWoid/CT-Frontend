import './App.css';
import io from "socket.io-client";
import {useEffect, useState} from "react";


let timeformatted;
let isHost = true;

const green =  "rgb(145, 235, 56)";
const yellow =  "rgb(255, 249, 79)";
const red =  "rgb(247, 69, 69)";


let color =  green;

let redLimit = 1;
let yellowLimit = 5;

document.body.style.backgroundColor = color;

const socket = io.connect("https://server.deltanoise.net");

const requestServerTime = () => {
  socket.emit("request_server_time");
}

const setServerTime = (value) => {
  socket.emit("set_server_time", value*60)
}

const setYellowLimitServer = (limit) => {
  socket.emit("set_yellow_limit", limit);
}

const setRedLimitServer = (limit) => {
  socket.emit("set_red_limit", limit);
}

const requestLimits = () => {
  socket.emit("request_limits");
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


function updateLimitsUI(y,r) {
  yellowLimit = y;
  redLimit = r;
}


function App() {

  requestLimits();

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

  const[redLimitState, setRedLimit] = useState(1);
  const[yellowLimitState, setYellowLimit] = useState(1);
  const[col, setColor] = useState("rgb(145, 235, 56)")


    /* TODO : Limits and BG (APP Class) only update when time is running
       Receive-Limit-Sockets are called normally 
       To Reproduce - Stop Timer, set limit so that the color changes 
       See how the UI of the Limit Values and the bG of APP Class div color doesnt update while the socket transmission happens correctly (check console)
    */

    // Server Time Live Update
    useEffect(() => {
      socket.on("receive_server_time", (data) => {

        setTime(data);
        timeformatted = secondsToHMS(data);

        if(data > yellowLimit*60) {
          color = green;
          setColor("rgb(145, 235, 56)")
        }
        else if(data < yellowLimit*60 && data > redLimit*60) {
          color = yellow;
          setColor("rgb(255, 249, 79)")
        }
        else if(data < redLimit*60) {
          color = red;
          setColor("rgb(247, 69, 69)")
        }
        //console.log(data);
        document.body.style.backgroundColor = color;
      })

      socket.on("receive_yellow_limit", (limit) => {
        yellowLimit = limit;
        setYellowLimit(limit);
        console.log("Received new Yellow Limit with value" + limit + "new value= " + yellowLimit);
      })
  
      socket.on("receive_red_limit", (limit) => {
        redLimit = limit;
        setRedLimit(limit);
        console.log("Received new red Limit with value" + limit + "new value= " + redLimit);
      })

    }, [socket])

  //HTML Frontend
  return (

    <div className="App" style={{backgroundColor: col}}>

      {isHost &&
      <div>
      <button onClick={() => toggleHost(false)}>Client View</button>
      </div>
      }   

      <h1>{timeformatted}</h1>

      {isHost && 
      <div id='buttonsTime'>
      <div>
      <button onClick={() => setYellowLimitServer(-1)}>-</button> {yellowLimitState} <button onClick={() => setYellowLimitServer(+1)}>+</button>
      </div>
      <div>
      <button onClick={() => setRedLimitServer(-1)}>-</button> {redLimitState} <button onClick={() => setRedLimitServer(+1)}>+</button>
      </div>



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
      <p className='testClass'>Hooked Server Time (Seconds): {time}</p>
      </div>
      }


    </div>
  );
}

export default App;
