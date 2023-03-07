import { useRef, useEffect } from "react"
import ReactPlayer from "react-player";

export default function Video() {

    return (
        <div>
            <ReactPlayer url='http://1.116.116.170/hls/ri.m3u8' />
        </div>
    )
}
