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

const INDEXER_TOKEN = { "X-Algo-API-Token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" };
const INDEXER_SERVER = "http://localhost";
const INDEXER_PORT = 4001;

const TWO_ADDR = "LZMV3V7XNQNN6T53DU6ENIGRWTE5DP5SYTSD6MTJ6RKEMK4IKX2XXONF3U"
const APP_CONTRACT = "WCS6TVPJRBSARHLN2326LRU5BYVJZUKI2VJ53CAWKYYHDE455ZGKANWMGM";
const APP_ID = 1

const BLOCK_REFRESH_MS = 5000
const MICROALOS = Math.pow(10, 6)

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

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
      className="buy-connect-button"
      shape="round"
      size="large"
      block
      onClick={connect}
    >
      Connect
    </Button>)
}

function BuyTicket() {
  return <Button className="buy-connect-button" shape="round" size="large" block>Buy</Button>
}

function LottoInfo() {
  const [appState, setAppState] = useState(null);

  function parseAppState(globalStateRaw) {
    const appStateObj = globalStateRaw.reduce((o, x) => {
      const key = Buffer.from(x.key, "base64").toString("ascii")
      const type = x.value.type;
      let value = ""
      if (type === 1) {
        // Value is of type bytes
        value = x.value.bytes;
      } else if (type === 2) {
        // Value is of type uint
        value = x.value.uint;
      }
      return { ...o, [key]: value }
    }, {})
    setAppState(appStateObj);
  }

  async function getAppDetails() {
    const appDetails = await indexerClient.lookupApplications(APP_ID).do();
    parseAppState(appDetails.params["global-state"]);
  }

  function getDrawDate() {
    if (appState) {
      const draw_ts = appState.next_draw_epoch;
      const draw_date = new Date(draw_ts * 1000);
      return draw_date.toDateString("en-GB") + " " + draw_date.toTimeString("en-GB")
    } else {
      return "";
    }
  }

  useEffect(() => {
    getAppDetails();
  })

  return (
    <ul className="no-bp">
      <li><strong>Current Lottery Round: </strong>{appState?.round_num}</li>
      <li><strong>Total Tickets Sold: </strong>{appState?.tickets_sold}</li>
      <li><strong>Ticket Price: </strong>{appState?.ticket_cost / MICROALOS} ALGO</li>
      <li><strong>Draw Date: </strong> {getDrawDate()}</li>
    </ul>
  )
}

function AccountInfo(props) {
  const { userAccount } = props;

  const [tickets, setTickets] = useState(null);

  function getTicketsFromKeyVals(lottoKeyValues) {
    const ticketVars = lottoKeyValues.filter((x) => x.key.length === 4);
    const tickets = ticketVars.filter((x) => x.value.uint !== 0);
    return tickets.map(t => t.value.uint).sort();
  }

  function getAppLocalState(accountInfo) {
    const appsLocalState = accountInfo["apps-local-state"];
    const lottoLocalState = appsLocalState.filter((x) => x.id === APP_ID)[0];
    return lottoLocalState["key-value"];
  }

  async function getUserTickets() {
    const accountInfo = await indexerClient.lookupAccountByID(TWO_ADDR).do();
    const lottoKeyValues = getAppLocalState(accountInfo);
    const tickets = getTicketsFromKeyVals(lottoKeyValues);
    setTickets(tickets);
  }

  useEffect(() => {
    getUserTickets();
  })

  function printTickets() {
    // TODO: only display tickets if user's current round is equal to app's current round.
    if (tickets) {
      return tickets.join(", ");
    } else {
      return "None";
    }
  }

  return (
    <span>
      <hr />
      <ul className="no-bp">
        <li><strong>Connected Wallet: </strong>{userAccount.slice(0, 4)}... {userAccount.slice(-4)}</li>
        <li><strong>Owned Tickets (current round): </strong>{printTickets()}</li>
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
        <LottoInfo />
        {isConnected()
          ? <div><AccountInfo userAccount={userAccount} /><BuyTicket /></div>
          : <WalletConnect setUserAccount={setUserAccount} />
        }
      </div>
    </Card>
  )
}

function DAppHeader() {
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

  return (
    <Row justify="end" align="middle" className="dapp-header">
      <Col>
        <span><strong>Latest Algorand Block: </strong> {latestBlock}</span>
      </Col>
    </Row>

  )
}

export default function DAppPanel() {
  return (
    <div>
      <DAppHeader />
      <Row justify="center" align="middle" className="dapp-panel-row">
        <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="dapp-panel">
          <TweenOne animation={{ y: '-5rem' }}>
            <DAppCard />
          </TweenOne>
        </Col>
      </Row>
    </div>

  )
}
