import React from 'react';
import { Row, Col, Card } from 'antd';

import {
  DollarCircleTwoTone,
  LockTwoTone,
  HeartTwoTone
} from '@ant-design/icons';

import "./info_bubbles.css"


const bubbles = [
  {
    img: <DollarCircleTwoTone twoToneColor="#d539b5" className="bubble-image" />,
    href: ``,
    title: 'Weekly Draws',
    description: 'Draw results announced every Sunday at 3:00PM UTC.',
  },
  {
    img: <LockTwoTone twoToneColor="#d539b5" className="bubble-image" />,
    title: 'Secure',
    href: ``,
    description: 'Public verifiable draw results and audited smart contracts.',
  },
  {
    img: <HeartTwoTone twoToneColor="#d539b5" className="bubble-image" />,
    title: 'Altruistic',
    href: ``,
    description: '15% of all ALGO spent on tickets is allocated to the Algolotto Community Fund (ACF) for funding projects in the Algorand ecosystem.',
  },
];

export default function InfoBubbles() {

  const children = bubbles.map((card, i) => (
    <Col className="card-wrapper" key={i.toString()} span={4} md={6} xs={24}>
      <Card className="banner-card" title={card.title} bordered={true} style={{ textAlign: 'center' }}>
        {card.img}
        <div className="banner-card-body">
          <span className="description text-secondary">{card.description}</span>
        </div>
      </Card>
    </Col>
  ));

  return (
    <Row justify="center" align="middle" className="banner">
      {children}
    </Row>
  );
}
