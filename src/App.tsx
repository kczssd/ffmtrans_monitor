import { useRef, useState, useEffect } from 'react'
import flvjs from "flv.js"
import { Input, Button, Layout, Checkbox, Typography, Space } from "@arco-design/web-react"
import { IconCaretRight, IconCaretLeft, IconSettings } from '@arco-design/web-react/icon';
import Styles from "./App.module.css"

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;

// localhost:8080/live?app=ffmtrans&stream=test
const App = () => {
  const monitor = useRef<HTMLVideoElement>(null);
  const player = useRef<flvjs.Player>();
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [mediaDataSource, setMediaDataSource] = useState<flvjs.MediaDataSource>({ type: "flv", isLive: true, hasAudio: true, hasVideo: true });

  function init() {
    if (monitor.current) {
      console.log(mediaDataSource)
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

  useEffect(() => {
    console.log("rerender")
    init();
    return () => {
      destroy();
    }
  }, [monitor, mediaDataSource])

  return (
    <Layout className={Styles.container}>
      <Header className={Styles.header}>
        <div style={{ flex: "1 0 auto" }} className={Styles.prefix}>Stream URL:</div>
        <Input className={Styles.input} size='large' addBefore="http://" placeholder='input rtmp-flv url' allowClear onChange={handleInput} />
        <Button type="primary" size="large" onClick={load}>Load</Button>
        <Button type="primary" status="success" size="large" onClick={play}>Play</Button>
        <Button size="large" onClick={pause}>Pause</Button>
        <Button size="large" status="danger" onClick={destroy}>stop</Button>
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
