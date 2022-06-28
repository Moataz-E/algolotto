import React from 'react';
import { Row, Col, Card } from 'antd';

import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';

import "./dapp_panel.css"


export default function DAppPanel() {
  return (
    <Row justify="center" align="middle" className="dapp-panel-row">
      <Col lg={{ span: 8 }} md={{ span: 10 }} sm={{ span: 12 }} xs={{ span: 15 }} className="dapp-panel">
        <TweenOne animation={{ y: '-5rem' }}>
          <Card className="panel-card" title="Purchase Weekly Lottery" bordered={true} style={{ textAlign: 'center' }}>
            <div className="banner-card-body">
              <span className="description text-secondary">Display current round, draw date, tickets bought and box to purchase additional tickets</span>
            </div>
          </Card>
        </TweenOne>
      </Col>
    </Row>
  )
}
