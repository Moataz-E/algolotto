import React, { useEffect, useState } from 'react';
import algosdk from 'algosdk';
import { Row, Col, Card, Button, Select, Tooltip, Image } from 'antd';
import MyAlgoConnect from '@randlabs/myalgo-connect';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./admin_panel.css";


function AdminButtons() {

  function deploy_testnet(e) {
    console.log(e)
  }

  return (
    <Button
      className="user-interaction-button"
      shape="round"
      size="large"
      block
      onClick={deploy_testnet}
    >
      Deploy to Testet
    </Button>)
}


export default function AdminPanel() {

  return (
    <div>
      <Row justify="center" align="middle" className="dapp-panel-row">
        <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="dapp-panel">
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