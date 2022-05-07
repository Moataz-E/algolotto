import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';

import { Layout, Image, Button, Menu, Row, Col } from 'antd';
import 'antd/dist/antd.css';

import Signer from "./components/signer";
import InfoBubbles from './components/info_bubbles';
import BannerAnimatedContent from "./components/banner";

import "./App.css";


const { Header, Content, Footer } = Layout;

function AppHeader(props) {

  const headerItems = [
    { label: 'About' },
    { label: <Button shape="round"><Link to="app">Lanuch dApp</Link></Button> }
  ]

  return (
    <Header {...props}>
      <Row justify="end" className="header">
        <Col span={6}>
          <a href="/"><img className="logo-img" src="/white.png" alt="logo" /></a>
        </Col>
        <Col span={6} offset={10}>
          <Menu mode="horizontal" className="header-menu" items={headerItems} />
        </Col>
      </Row>
    </Header >
  )
}

function Banner() {
  return (
    <Row justify="center" align="middle" className="banner">
      <Col span={6} md={9} xs={12} sm={10}>
        <Image src="/logo512.png" preview={false}></Image>
      </Col>
      <Col span={6} md={9} offset={1} xs={11} sm={9} className="banner-right">
        <BannerAnimatedContent />
      </Col>
    </Row>
  )
}

function Home() {
  return (
    <Layout className="App">
      <AppHeader className="header" />
      <Content style={{ padding: '0 50px' }}>
        <Banner />
        <InfoBubbles />
        {/* <Signer /> */}
      </Content>
      <Footer className="footer">Lotto Labs ©2021</Footer>
    </Layout>
  );
}

function DApp() {
  return (
    <Layout className="App">
      <AppHeader className="header" />
      <p>This is the App</p>
      <Footer className="footer">Lotto Labs ©2021</Footer>
    </Layout>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="app" element={<DApp />} />
    </Routes>
  )
}

export default App;
