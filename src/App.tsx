import { useRef, useState, useEffect } from 'react'
import flvjs from "flv.js"
import { Input, Button, Layout, Checkbox, Typography, Space } from "@arco-design/web-react"
import { IconCaretRight, IconCaretLeft, IconSettings } from '@arco-design/web-react/icon';
import Styles from "./App.module.css"

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;
const Group = Checkbox.Group;

const App = () => {
  const monitor = useRef<HTMLVideoElement>(null);
  const player = useRef<flvjs.Player>();
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [inputUrl, setInputUrl] = useState("localhost:8080/live?app=ffmtrans&stream=test");
  const [mediaDataSource, setMediaDataSource] = useState<flvjs.MediaDataSource>({ type: "flv", isLive: true, hasAudio: true, hasVideo: true });

  function play() {
    console.log("player!", player.current);
    if (player.current) {
      console.log("player!")
      player.current.load();
      player.current.play();
    }
  }

  useEffect(() => {
    console.log("flvjs.isSupported,", flvjs.isSupported(), monitor.current, mediaDataSource);
    if (monitor.current) {
      let flvPlayer = flvjs.createPlayer(mediaDataSource);
      flvPlayer.attachMediaElement(monitor.current);
      player.current = flvPlayer;
    }
    return () => {
      player.current?.destroy();
    }
  }, [monitor, mediaDataSource])

  return (
    <Layout className={Styles.container}>
      <Header className={Styles.header}>
        <div style={{ flex: "1 0 auto" }} className={Styles.prefix}>Stream URL:</div>
        <Input className={Styles.input} size='large' addBefore="http://" placeholder='input rtmp-flv url' allowClear value={inputUrl} onChange={(v) => { setInputUrl(v); setMediaDataSource((o) => ({ ...o, url: v })) }} />
        <Button type="primary" size="large" onClick={() => { }}>Load</Button>
        <Button type="primary" status="success" size="large" onClick={() => { }}>Play</Button>
        <Button size="large" onClick={() => { }}>Pause</Button>
        <Button size="large" status="danger" onClick={() => { }}>stop</Button>
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
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App
