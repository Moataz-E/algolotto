import React, { useEffect, useState } from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button, Input, Tooltip, Image } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import { ALGOD_CONFIG, APP_CONFIG } from "../config";

import "./admin_panel.css";

const { TextArea } = Input;

const NETWORK = "testnet";

const myalgoSettings = {
  shouldSelectOneAccount: true,
  openManager: false
};
const myAlgoConnect = new MyAlgoConnect();

async function compileProgram(client, TealSource) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(TealSource);
  let compileResponse = await client.compile(programBytes).do();
  let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  return compiledBytes;
}

const algodClient = new algosdk.Algodv2(
  ALGOD_CONFIG[NETWORK].token,
  ALGOD_CONFIG[NETWORK].host,
  ALGOD_CONFIG[NETWORK].port
)

function AdminButtons() {
  const [approval, setApproval] = useState("");
  const [clear, setClear] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [winner, setWinner] = useState("");

  const connect = async (e) => {
    e.preventDefault()
    const accounts = await myAlgoConnect.connect(myalgoSettings);
    setUserAccount(accounts[0].address);
  };

  async function deploy_testnet(e) {
    const localInts = 16;
    const localBytes = 0;
    const globalInts = 6;
    const globalBytes = 2;

    const approvalProgramBinary = await compileProgram(algodClient, approval.target.textContent);
    const clearProgramBinary = await compileProgram(algodClient, clear.target.textContent);

    let params = await algodClient.getTransactionParams().do();
    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    console.log("Deploying Application. . . . ");

    let txn = algosdk.makeApplicationCreateTxn(userAccount, params, onComplete,
      approvalProgramBinary, clearProgramBinary,
      localInts, localBytes, globalInts, globalBytes);
    let txId = txn.txID().toString();

    // Sign the transaction
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const result = await algodClient.sendRawTransaction(signedTxn.blob).do();
  }

  async function update_testnet(e) {
    const localInts = 16;
    const localBytes = 0;
    const globalInts = 6;
    const globalBytes = 2;

    const approvalProgramBinary = await compileProgram(algodClient, approval.target.textContent);
    const clearProgramBinary = await compileProgram(algodClient, clear.target.textContent);

    let params = await algodClient.getTransactionParams().do();
    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    console.log("Deploying Application. . . . ");

    let txn = algosdk.makeApplicationUpdateTxn(userAccount, params, 100328257,
      approvalProgramBinary, clearProgramBinary);
    let txId = txn.txID().toString();

    // Sign the transaction
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const result = await algodClient.sendRawTransaction(signedTxn.blob).do();
    console.log(result);
  }

  async function triggerDraw(e) {
    const params = await algodClient.getTransactionParams().do();
    // Purchase Ticket Transaction
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      suggestedParams: {
        ...params,
      },
      from: userAccount,
      appIndex: APP_CONFIG[NETWORK].id,
      appArgs: [new Uint8Array(Buffer.from("draw"))]
    });
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const result = await algodClient.sendRawTransaction(signedTxn.blob).do();
    console.log(result);
  }

  async function dispenseReward(e) {
    const params = await algodClient.getTransactionParams().do();
    // Purchase Ticket Transaction
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      suggestedParams: {
        ...params, fee: 3000, flatFee: true
      },
      from: userAccount,
      appIndex: APP_CONFIG[NETWORK].id,
      appArgs: [
        new Uint8Array(Buffer.from("dispense_and_restart")),
        algosdk.decodeAddress(winner.target.textContent).publicKey
      ],
      accounts: [winner.target.textContent]
    });
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const result = await algodClient.sendRawTransaction(signedTxn.blob).do();
  }

  return (
    <div>
      <Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={connect}
      >
        Connect
      </Button>
      <strong>Approval:</strong>
      <TextArea rows={3} onChange={setApproval} />
      <strong>Clean:</strong>
      <TextArea rows={3} onChange={setClear} />
      <Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={deploy_testnet}
      >
        Deploy to Testet
      </Button>
      <Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={update_testnet}
      >
        Update on Testnet
      </Button>
      <Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={triggerDraw}
      >
        Trigger Draw
      </Button>
      <strong>Winner Address:</strong>
      <TextArea rows={1} onChange={setWinner} />
      <Button
        className="user-interaction-button"
        shape="round"
        size="large"
        block
        onClick={dispenseReward}
      >
        Dispense Reward
      </Button>
    </div>
  )
}


export default function AdminPanel() {

  return (
    <div>
      <Row justify="center" align="middle" className="dapp-panel-row">
        <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="admin-panel">
          <TweenOne animation={{ y: '-5rem' }}>
            <Card className="panel-card" title="Admin" bordered={true} style={{ textAlign: 'left' }}>
              <div className="banner-card-body">
                <AdminButtons />
              </div>
            </Card>
          </TweenOne>
        </Col>
      </Row>
    </div>
  )
};