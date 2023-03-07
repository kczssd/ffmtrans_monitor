import { useRef, useState } from 'react'
import Video from "./components/video";
import './App.css'


function App() {
  return (
    <div className="App">
      <h1>Play video throught hls</h1>
      <Video></Video>
    </div>
  )
}

export default App
