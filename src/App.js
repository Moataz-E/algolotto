import React, { useEffect, useState } from 'react';

import { Layout, Drawer, Button, Menu, Row, Col } from 'antd';
import 'antd/dist/antd.css';

import Signer from "./components/signer";

import "./App.css";


const { Header, Content, Footer } = Layout;

function AppHeader(props) {

  const headerItems = [
    { label: 'About' },
    { label: 'FAQ' },
    { label: <Button shape="round"><a href="app/">Lanuch dApp</a></Button> }
  ]

  return (
    <Header {...props}>
      <Row justify="end">
        <Col span={6}>
          <a href="/"><img className="logo-img" src="/white.png" alt="logo" /></a>
        </Col>
        <Col span={6} offset={8}>
          <Menu mode="horizontal" className="header" items={headerItems} />
        </Col>

      </Row>
    </Header >
  )
}


function App() {
  return (
    <Layout>
      <AppHeader className="header" />
      <Content style={{ padding: '0 50px' }}>
        <Signer />
      </Content>
      <Footer style={{ textAlign: 'center' }}>Lotto Labs ©2021</Footer>
    </Layout>
  );
}

export default App;
