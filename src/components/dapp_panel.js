import React, { useEffect, useState } from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button, Select, Tooltip } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./dapp_panel.css";
import { INDX_CONFIG, ALGOD_CONFIG, NETWORKS } from "../config";
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const TWO_ADDR = "LZMV3V7XNQNN6T53DU6ENIGRWTE5DP5SYTSD6MTJ6RKEMK4IKX2XXONF3U"
const APP_CONTRACT = "WCS6TVPJRBSARHLN2326LRU5BYVJZUKI2VJ53CAWKYYHDE455ZGKANWMGM";
const APP_ID = 1

const BLOCK_REFRESH_MS = 5000;
const STATE_REFRESH_MS = 13000;
const MICROALOS = Math.pow(10, 6);

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

function BuyTicket(props) {
  const { tickets } = props;

  function purchaseTickets(e) {
    console.log(e);
  }

  function ticketSelect() {
    return (
      <Select defaultValue="1" size="large" className="ticket-select">
        {Array.from({ length: 15 - tickets.length }, (_, i) => i + 1).map(
          (i) => <Option value={i} key={i}>{i}</Option>)
        }
      </Select>
    )
  }

  return (
    <div>
      {ticketSelect()}
      <Button
        className="buy-connect-button"
        shape="round"
        size="large"
        block
        onSubmit={purchaseTickets}
      >
        Buy Tickets
      </Button>
    </div>
  )
}

function LottoInfo(props) {
  const { indexerClient } = props;
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
    const interval = setInterval(() => {
      getAppDetails();
    }, STATE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [])

  return (
    <ul className="no-bp">
      <li><strong>Current Raffle Round: </strong>{appState?.round_num}</li>
      <li><strong>Total Tickets Sold: </strong>{appState?.tickets_sold}</li>
      <li><strong>Ticket Price: </strong>{appState?.ticket_cost / MICROALOS} ALGO</li>
      <li><strong>Draw Date: </strong> {getDrawDate()}</li>
    </ul>
  )
}

function AccountInfo(props) {
  const { userAccount, tickets, userRound } = props;

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
      <ul className="no-bp">
        <li><strong>Connected Wallet: </strong>{userAccount.slice(0, 4)}... {userAccount.slice(-4)}</li>
        <li>
          <strong>Tickets Round</strong>
          <Tooltip title="Raffle round in which the participant's tickets were bought." className="form-tooltip">
            <QuestionCircleOutlined />
          </Tooltip>:&nbsp;
          {tickets ? userRound : "No Participation"}
        </li>
        <li>
          <strong>Owned Raffle Numbers</strong>
          <Tooltip title="Serial numbers of tickets owned by the participant." className="form-tooltip">
            <QuestionCircleOutlined />
          </Tooltip>:&nbsp;
          {printTickets()}</li>
      </ul>
    </span>
  )
}

function DAppCard(props) {
  const { indexerClient, userAccount, setUserAccount } = props;
  const [tickets, setTickets] = useState(null);
  const [userRound, setUserRound] = useState(null);

  function isConnected() {
    return (userAccount !== "");
  }

  function getTicketsFromKeyVals(lottoKeyValues) {
    const ticketVars = lottoKeyValues.filter((x) => x.key.length === 4);
    const tickets = ticketVars.filter((x) => x.value.uint !== 0);
    return tickets.map(t => t.value.uint).sort(function (a, b) { return a - b; });
  }

  function getUserRoundFromKeyVals(lottoKeyValues) {
    const otherVars = lottoKeyValues.filter((x) => x.key.length !== 4);
    const userRound = otherVars.filter(
      (x) => Buffer.from(x.key, "base64").toString("ascii") === "draw_round"
    )
    return userRound?.pop().value.uint;
  }

  function getAppLocalState(accountInfo) {
    const appsLocalState = accountInfo["apps-local-state"];
    const lottoLocalState = appsLocalState.filter((x) => x.id === APP_ID)[0];
    return lottoLocalState["key-value"];
  }

  async function getUserState() {
    const accountInfo = await indexerClient.lookupAccountByID(TWO_ADDR).do();
    const lottoKeyValues = getAppLocalState(accountInfo);
    const tickets = getTicketsFromKeyVals(lottoKeyValues);
    const userRound = getUserRoundFromKeyVals(lottoKeyValues);
    setTickets(tickets);
    setUserRound(userRound);
  }

  useEffect(() => {
    getUserState();
    const interval = setInterval(() => {
      getUserState();
    }, STATE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [])

  return (
    <Row>
      <Card className="panel-card" title="Weekly Raffle" bordered={true} style={{ textAlign: 'left' }}>
        <div className="banner-card-body">
          <LottoInfo indexerClient={indexerClient} />
        </div>
      </Card>
      <Card className="panel-card">
        {isConnected()
          ? <div>
            <AccountInfo userAccount={userAccount} tickets={tickets} userRound={userRound} />
            <BuyTicket tickets={tickets} />
          </div>
          : <WalletConnect setUserAccount={setUserAccount} />
        }
      </Card>
    </Row>
  )
}

function DAppHeader(props) {
  const { network, setNetwork, algodClient } = props;
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
  }, [algodClient])

  return (
    <Row justify="end" align="middle" className="dapp-header">
      <Col>
        <span className="header-item"><strong>Latest Block: </strong> {latestBlock}</span>
        <Select className="header-item" defaultValue={network} onSelect={(e) => setNetwork(e)}>
          {NETWORKS.map((x) => <Option key={x} value={x}>{x}</Option>)}
        </Select>
      </Col>
    </Row>

  )
}

export default function DAppPanel() {
  const [userAccount, setUserAccount] = useState("");
  const [network, setNetwork] = useState(NETWORKS[0]);

  const [algodClient, setAlgodClient] = useState(
    new algosdk.Algodv2(
      ALGOD_CONFIG[network].token,
      ALGOD_CONFIG[network].host,
      ALGOD_CONFIG[network].port
    )
  )

  const [indexerClient, setIndexerClient] = useState(
    new algosdk.Indexer(
      INDX_CONFIG[network].token,
      INDX_CONFIG[network].host,
      INDX_CONFIG[network].port
    )
  );

  useEffect(() => {
    // Set client
    const algod = new algosdk.Algodv2(
      ALGOD_CONFIG[network].token,
      ALGOD_CONFIG[network].host,
      ALGOD_CONFIG[network].port
    );
    setAlgodClient(algod);

    // Set indexer
    const indexer = new algosdk.Indexer(
      INDX_CONFIG[network].token,
      INDX_CONFIG[network].host,
      INDX_CONFIG[network].port
    );
    setIndexerClient(indexer);
    setUserAccount("");
  }, [network])

  return (
    <div>
      <DAppHeader network={network} setNetwork={setNetwork} algodClient={algodClient} />
      <Row justify="center" align="middle" className="dapp-panel-row">
        <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="dapp-panel">
          <TweenOne animation={{ y: '-5rem' }}>
            <DAppCard
              indexerClient={indexerClient}
              userAccount={userAccount}
              setUserAccount={setUserAccount}
            />
          </TweenOne>
        </Col>
      </Row>
    </div>
  )
}
