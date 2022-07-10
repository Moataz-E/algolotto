import React from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./dapp_panel.css";


function MyAlgoWallet() {
  const myalgoSettings = {
    shouldSelectOneAccount: false,
    openManager: false
  };
  const algodClient = new algosdk.Algodv2("", "https://node.testnet.algoexplorerapi.io", "");
  const myAlgoConnect = new MyAlgoConnect();

  const connect = async (e) => {
    e.preventDefault()
    const accounts = await myAlgoConnect.connect(myalgoSettings);
    console.log(accounts);
    // const sender = accounts[0].address;
  };

  return (
    <Button
      className="myalgo-connect-btn"
      shape="round"
      size="large"
      block
      onClick={connect}
    >
      Connect
    </Button>)
}


function DAppCard() {
  return (
    <Card className="panel-card" title="Purchase Weekly Lottery" bordered={true} style={{ textAlign: 'center' }}>
      <div className="banner-card-body">
        <span className="description text-secondary">
          Display current round, draw date, tickets bought and box to purchase additional tickets
        </span>
        <MyAlgoWallet />
        <Button className="buy-button" shape="round" size="large" block>Buy</Button>
      </div>
    </Card>
  )
}


export default function DAppPanel() {
  return (
    <Row justify="center" align="middle" className="dapp-panel-row">
      <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="dapp-panel">
        <TweenOne animation={{ y: '-5rem' }}>
          <DAppCard />
        </TweenOne>
      </Col>
    </Row>
  )
}
