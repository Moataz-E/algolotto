import React, { useEffect, useState } from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./dapp_panel.css";

const ALGOD_TOKEN = "";
const ALGOD_SERVER = "https://node.testnet.algoexplorerapi.io";
const ALGOD_PORT = "";

const BLOCK_REFRESH_MS = 5000

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

function WalletConnect(props) {
  const { setUserAccount } = props;

  const myalgoSettings = {
    shouldSelectOneAccount: false,
    openManager: false
  };
  const myAlgoConnect = new MyAlgoConnect();

  const connect = async (e) => {
    e.preventDefault()
    const accounts = await myAlgoConnect.connect(myalgoSettings);
    setUserAccount(accounts[0].address);
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

function BuyTicket() {
  return <Button className="buy-button" shape="round" size="large" block>Buy</Button>
}

function AlgoInfo() {
  const [latestBlock, setLatestBlock] = useState("");

  async function getLatestBlock(e) {
    try {
      const status = await algodClient.status().do();
      setLatestBlock(status["last-round"]);
    } catch {
      console.log(e)
    }
  }

  useEffect(() => {
    getLatestBlock();
    const interval = setInterval(() => {
      getLatestBlock();
    }, BLOCK_REFRESH_MS);
    return () => clearInterval(interval);
  }, [])

  return <div><strong>Latest Algorand Block: </strong> {latestBlock}</div>
}

function LottoInfo() {
  return (
    <ul className="no-bp">
      <li><strong>Current Lottery Round: </strong></li>
      <li><strong>Draw Date: </strong></li>
      <li><strong>Ticket Price: </strong></li>
    </ul>
  )
}

function AccountInfo(props) {
  const { userAccount } = props;

  return (
    <span>
      <hr />
      <ul className="no-bp">
        <li><strong>Connected Wallet: </strong>{userAccount.slice(0, 4)}... {userAccount.slice(-4)}</li>
        <li><strong>Tickets Bought (current round): </strong></li>
      </ul>
    </span>
  )
}


function DAppCard() {
  const [userAccount, setUserAccount] = useState("");

  function isConnected() {
    return (userAccount !== "");
  }

  return (
    <Card className="panel-card" title="Purchase Weekly Lottery" bordered={true} style={{ textAlign: 'left' }}>
      <div className="banner-card-body">
        <AlgoInfo />
        <hr />
        <LottoInfo />
        {isConnected()
          ? <AccountInfo userAccount={userAccount} />
          : <WalletConnect setUserAccount={setUserAccount} />
        }
        <BuyTicket />
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
