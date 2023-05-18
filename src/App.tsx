import { useRef, useState, useEffect, useCallback } from 'react'
import flvjs from "flv.js"
import { Input, Button, Layout, Checkbox, Typography, Space, Divider, InputTag, Switch, Message } from "@arco-design/web-react"
import { IconCaretRight, IconCaretLeft, IconSettings } from '@arco-design/web-react/icon';
import Styles from "./App.module.css"

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;

// localhost:8080/live?app=ffmtrans&stream=test
const App = () => {
  const monitor = useRef<HTMLVideoElement>(null); // video 标签
  const player = useRef<flvjs.Player>(); // flv.js 播放器实例
  const [collapsed, setCollapsed] = useState<boolean>(true); // 设置面板是否折叠
  const [mediaDataSource, setMediaDataSource] = useState<flvjs.MediaDataSource>({ type: "flv", isLive: true, hasAudio: true, hasVideo: true }); // 播放器设置
  const [withOSD, setWithOSD] = useState(true); // 是否开启过滤器
  const [filterGraph, setFilterGraph] = useState<string[]>(["drawtext=fontcolor=red:fontsize=20:x=5:y=5:text='%{localtime\\:%Y-%m-%d %H.%M.%S}'"]); // 滤镜信息

  function init() {
    if (monitor.current) {
      let flvPlayer = flvjs.createPlayer(mediaDataSource);
      flvPlayer.attachMediaElement(monitor.current);
      player.current = flvPlayer;
    }
  }

  function load() {
    if (player.current) {
      player.current.load();
    } else {
      init();
      load();
    }
  }

  function play() {
    if (player.current) {
      player.current.play();
    }
  }

  function pause() {
    if (player.current) {
      player.current.pause();
    }
  }

  function destroy() {
    if (player.current) {
      player.current.pause();
      player.current?.unload();
      player.current?.detachMediaElement();
      player.current?.destroy();
      player.current = undefined;
    }
  }

  function handleInput(v: string) {
    let httpReg = new RegExp(/^http:\/\//);
    if (httpReg.test(v)) {
      setMediaDataSource((o) => ({ ...o, url: v }));
    } else {
      v = "http://" + v;
      setMediaDataSource((o) => ({ ...o, url: v }));
    }
  }

  async function changeOSD(withOSD: boolean, filterGraph: string[]) {
    if (withOSD && filterGraph.length > 0) {
      let res = await fetch("http://127.0.0.1:3000/setosd", {
        method: "POST",
        body: JSON.stringify({ osd: filterGraph.join(",") }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      let msg = await res.text();
      Message.success("后台ffmtrans_with_filter成功启动");
    } else {
      let res = await fetch("http://127.0.0.1:3000/setosd", {
        method: "POST",
        body: JSON.stringify({ osd: "" }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      let msg = await res.text();
      Message.success("后台ffmtrans_remux成功启动");
    }
  }

  async function closeOSD() {
    let res = await fetch("http://127.0.0.1:3000/close", {
      method: "GET",
      keepalive: true
    })
    let msg = await res.text();
    return msg;
  }

  useEffect(() => {
    const handleClose = async (e: BeforeUnloadEvent) => {
      e.preventDefault();
      await closeOSD();
    }
    window.addEventListener("beforeunload", handleClose);
    return () => {
      window.removeEventListener("beforeunload", handleClose);
    }
  }, [])

  useEffect(() => {
    changeOSD(withOSD, filterGraph);
    return () => {
      destroy();
    }
  }, [withOSD, filterGraph])

  useEffect(() => {
    init();
    Message.success("播放器初始化完成");
    return () => {
      destroy();
    }
  }, [monitor, mediaDataSource])


  return (
    <Layout className={Styles.container}>
      <Header className={Styles.header}>
        <div style={{ flex: "1 0 auto" }} className={Styles.prefix}>Stream URL:</div>
        <Input className={Styles.input} size='large' addBefore="http://" placeholder='input rtmp-flv url' allowClear onChange={handleInput} />
        <Button type="primary" size="large" onClick={() => {
          load();
          Message.success("播放器加载完成");
        }}>Load</Button>
        <Button type="primary" status="success" size="large" onClick={() => {
          play();
          Message.success("播放器继续播放");
        }}>Play</Button>
        <Button size="large" onClick={() => {
          pause();
          Message.success("播放器暂停");
        }}>Pause</Button>
        <Button size="large" status="danger" onClick={() => {
          destroy();
          Message.success("播放器销毁完成");
        }}>stop</Button>
      </Header>
      <Layout className={Styles.main}>
        <Content className={Styles.content}>
          <video className={Styles.video} ref={monitor} controls autoPlay></video>
        </Content>
        <Sider collapsible trigger={collapsed ? <IconCaretLeft /> : <IconCaretRight />} collapsed={collapsed} onCollapse={() => setCollapsed((v) => !v)}>
          <p className={Styles.controlTitle}><IconSettings /></p>
          <div className={Styles.options}>
            <Checkbox className={Styles.option} onChange={(b) => setMediaDataSource((o) => ({ ...o, isLive: b }))} checked={mediaDataSource.isLive}>Is Stream</Checkbox>
            <Checkbox className={Styles.option} onChange={(b) => setMediaDataSource((o) => ({ ...o, hasVideo: b }))} checked={mediaDataSource.hasVideo}>Has Video</Checkbox>
            <Checkbox className={Styles.option} onChange={(b) => setMediaDataSource((o) => ({ ...o, hasAudio: b }))} checked={mediaDataSource.hasAudio}>Has Audio</Checkbox>
            <Divider></Divider>
            <Checkbox className={Styles.option} onChange={(v) => { setWithOSD(v) }} checked={withOSD}>With OSD</Checkbox>
            <InputTag onChange={(value) => { setFilterGraph(value) }} value={filterGraph} onFocus={() => setCollapsed(false)} placeholder='filter1,filter2,...' tokenSeparators={[',']} />
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App
