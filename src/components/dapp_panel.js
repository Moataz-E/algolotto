import React, { useEffect, useState } from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button, Select, Tooltip, Image } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./dapp_panel.css";
import { ToCommas } from '../utils';
import { INDX_CONFIG, ALGOD_CONFIG, NETWORKS } from "../config";
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const APP_ID = 1;
const APP_ADDR = "WCS6TVPJRBSARHLN2326LRU5BYVJZUKI2VJ53CAWKYYHDE455ZGKANWMGM";
const BLOCK_REFRESH_MS = 5000;
const STATE_REFRESH_MS = 13000;
const MICROALGOS = Math.pow(10, 6);

const myalgoSettings = {
  shouldSelectOneAccount: true,
  openManager: false
};
const myAlgoConnect = new MyAlgoConnect();

function WalletConnect(props) {
  const { setUserAccount } = props;

  const connect = async (e) => {
    e.preventDefault()
    const accounts = await myAlgoConnect.connect(myalgoSettings);
    setUserAccount(accounts[0].address);
  };

  return (
    <Button
      className="user-interaction-button"
      shape="round"
      size="large"
      block
      onClick={connect}
    >
      Connect
    </Button>)
}

function BuyTicket(props) {
  const {
    userAccount,
    tickets,
    optedIn,
    algodClient,
    setOptedIn,
    setTickets
  } = props;

  const [ticketsQuantity, setTicketsQuantity] = useState(1);
  const [disableBuy, setDisableBuy] = useState(false);

  useEffect(() => {
    if (tickets.length >= 15) {
      setDisableBuy(true);
    }
  }, [tickets])

  async function purchaseTickets() {
    const ticketsCost = ticketsQuantity * MICROALGOS;
    const params = await algodClient.getTransactionParams().do();
    // Purchase Ticket Transaction
    const txn1 = algosdk.makeApplicationNoOpTxnFromObject({
      suggestedParams: {
        ...params,
      },
      from: userAccount,
      appIndex: APP_ID,
      appArgs: [new Uint8Array(Buffer.from("purchase")), algosdk.encodeUint64(ticketsQuantity)]
    });

    // Payment Transaction
    const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: userAccount,
      to: APP_ADDR,
      amount: ticketsCost
    });

    // Combine and send transactions
    const txnsArray = [txn1, txn2];
    const groupID = algosdk.computeGroupID(txnsArray)
    for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;
    let signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map(txn => txn.toByte()));
    signedTxns = signedTxns.map(txn => txn.blob);
    const result = await algodClient.sendRawTransaction(signedTxns).do();
    if (result?.txId) {
      // TODO: find a better way to update user tickets state
      setTickets(tickets.concat(["X"]));
    }
  }

  async function optIn(e) {
    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeApplicationOptInTxnFromObject({
      suggestedParams: {
        ...params,
      },
      from: userAccount,
      appIndex: APP_ID
    });
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const result = await algodClient.sendRawTransaction(signedTxn.blob).do();
    if (result?.txId) {
      setOptedIn(true);
    }
  }

  function ticketSelect() {
    return (
      <Select
        defaultValue={"1"}
        size="large"
        className="ticket-select"
        onSelect={setTicketsQuantity}
        disabled={disableBuy}
      >
        {Array.from({ length: 15 - tickets.length }, (_, i) => i + 1).map(
          (i) => <Option value={i} key={i}>{i}</Option>)
        }
      </Select>
    )
  }

  function buyTickets() {
    return (
      <div>
        {ticketSelect()}
        <Button
          className="user-interaction-button"
          shape="round"
          size="large"
          block
          onClick={purchaseTickets}
          disabled={disableBuy}
        >
          Buy Tickets
        </Button>
      </div>
    )
  }

  function optInButton() {
    return (
      < Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={optIn}
      >
        Opt In
      </Button >
    )
  }

  return (optedIn ? buyTickets() : optInButton())
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
    parseAppState(appDetails.application.params["global-state"]);
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
      <li><strong>Ticket Price: </strong>
        {appState?.ticket_cost / MICROALGOS}
        <Image className="currency-icon" src="/algorand_icon.png" preview={false}></Image>
      </li>
      <li><strong>Draw Date: </strong> {getDrawDate()}</li>
    </ul >
  )
}

function AccountInfo(props) {
  const { userAccount, tickets, userRound, userBalance } = props;

  function printTickets() {
    // TODO: only display tickets if user's current round is equal to app's current round.
    if (tickets && tickets.length > 0) {
      return tickets.join(", ");
    } else {
      return "None";
    }
  }

  return (
    <span>
      <ul className="no-bp">
        <li><strong>Connected Wallet: </strong>{userAccount.slice(0, 4)}... {userAccount.slice(-4)}</li>
        <li><strong>Account Balance: </strong>{
          ToCommas((userBalance / MICROALGOS).toFixed(2))}
          <Image className="currency-icon" src="/algorand_icon.png" preview={false}></Image>
        </li>
        <li>
          <strong>Tickets Round</strong>
          <Tooltip title="Raffle round in which the participant's tickets were bought." className="form-tooltip">
            <QuestionCircleOutlined />
          </Tooltip>:&nbsp;
          {userRound ? userRound : "No Participation"}
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
  const { indexerClient, userAccount, setUserAccount, algodClient } = props;
  const [tickets, setTickets] = useState([]);
  const [userRound, setUserRound] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [optedIn, setOptedIn] = useState(false);

  function isConnected() {
    return (userAccount !== "");
  }

  function getTicketsFromKeyVals(lottoKeyValues) {
    const ticketVars = lottoKeyValues.filter((x) => x.key.length === 4);
    let tickets = ticketVars.filter((x) => x.value.uint !== 0);
    tickets = tickets.map(t => t.value.uint).sort(function (a, b) { return a - b; });
    return tickets;
  }

  function getUserRoundFromKeyVals(lottoKeyValues) {
    const otherVars = lottoKeyValues.filter((x) => x.key.length !== 4);
    const userRound = otherVars.filter(
      (x) => Buffer.from(x.key, "base64").toString("ascii") === "draw_round"
    )
    return userRound?.pop().value.uint;
  }

  function getAppLocalState(accountInfo) {
    const appsLocalState = accountInfo?.account["apps-local-state"];
    if (appsLocalState) {
      const lottoLocalState = appsLocalState.filter((x) => x.id === APP_ID)[0];
      return lottoLocalState["key-value"];
    } else {
      return null;
    }
  }

  async function getUserState() {
    if (userAccount) {
      const accountInfo = await indexerClient.lookupAccountByID(userAccount).do();
      const lottoKeyValues = getAppLocalState(accountInfo);
      setUserBalance(accountInfo.account.amount);
      if (lottoKeyValues) {
        let tickets = getTicketsFromKeyVals(lottoKeyValues);
        const userRound = getUserRoundFromKeyVals(lottoKeyValues);
        setOptedIn(true);
        setTickets(tickets);
        setUserRound(userRound);
      }
    }
  }

  useEffect(() => {
    getUserState();
    const interval = setInterval(() => {
      getUserState();
    }, STATE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [userAccount, optedIn, tickets])

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
            <AccountInfo
              userAccount={userAccount}
              tickets={tickets}
              userRound={userRound}
              userBalance={userBalance}
            />
            <BuyTicket
              userAccount={userAccount}
              tickets={tickets}
              optedIn={optedIn}
              algodClient={algodClient}
              setOptedIn={setOptedIn}
              setTickets={setTickets}
            />
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
              algodClient={algodClient}
            />
          </TweenOne>
        </Col>
      </Row>
    </div>
  )
}
