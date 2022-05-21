import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';

import { Layout, Image, Button, Menu, Row, Col } from 'antd';
import 'antd/dist/antd.css';

import Banner from "./components/banner";
import Signer from "./components/signer";
import InfoBubbles from './components/info_bubbles';

import "./App.css";


const { Header, Content, Footer } = Layout;

function AppHeader(props) {

  const headerItems = [
    { label: 'Docs' },
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

function Home() {
  return (
    <Layout className="App">
      <AppHeader className="header" />
      <Content style={{ padding: '0 50px' }}>
        <Banner />
        <InfoBubbles />
        {/* <Signer /> */}
      </Content>
      <Footer className="footer">Hachi Sittah Technologies ©2021</Footer>
    </Layout>
  );
}

function DApp() {
  return (
    <Layout className="App">
      <AppHeader className="header" />
      <p>This is the App</p>
      <Footer className="footer">Hachi Sittah Technologies ©2021</Footer>
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
