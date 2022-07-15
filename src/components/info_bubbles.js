import TweenOne from 'rc-tween-one'
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
    description: 'A new winner every week. Draws end a week after the previous draw concludes.',
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
    <Col key={i.toString()} span={4} md={6} xs={16}>
      <TweenOne animation={{ y: -20 }}>
        <Card className="banner-card" title={card.title} bordered={true} style={{ textAlign: 'center' }}>
          {card.img}
          <div className="banner-card-body">
            <span className="description text-secondary">{card.description}</span>
          </div>
        </Card>
      </TweenOne>
    </Col >
  ));

  return (
    <Row justify="center" align="middle" className="info-bubbles">
      {children}
    </Row>
  );
}
