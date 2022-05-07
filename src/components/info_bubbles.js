import React, { useState } from 'react';
import { Row, Col, Card } from 'antd';


const bubbles = [
  {
    img: `https://gw.alipayobjects.com/zos/rmsportal/eLtHtrKjXfabZfRchvVT.svg`,
    href: `zh-cn/g2/3.x/index.html`,
    title: 'Weekly Draws',
    description: 'Draw results announced every Sunday of the week.',
  },
  {
    img: `https://gw.alipayobjects.com/zos/rmsportal/eLtHtrKjXfabZfRchvVT.svg`,
    title: 'Trustworthy & Secure',
    href: `zh-cn/g6/1.x/index.html`,
    description: 'Verifiable draw results and audited smart contracts.',
  },
  {
    img: `https://gw.alipayobjects.com/zos/rmsportal/eLtHtrKjXfabZfRchvVT.svg`,
    title: 'Altruistic',
    href: `zh-cn/f2/3.x/index.html`,
    description: '15% of all ALGO spent on tickets is allocated to the Algolotto Community Fund (ACF) for funding projects in the Algorand ecosystem.',
  },
];

const pointPos = [
  { x: -90, y: -20 },
  { x: 35, y: -25 },
  { x: -120, y: 125 },
  { x: -100, y: 165 },
  { x: 95, y: -5 },
  { x: 90, y: 160, opacity: 0.2 },
  { x: 110, y: 50 },
];


export default function InfoBubbles() {

  const children = bubbles.map((card, i) => (
    <Col className="card-wrapper" key={i.toString()} span={4} md={6} xs={24}>
      <Card className="banner-card" title={card.title} bordered={true} style={{ textAlign: 'center' }}>
        <img src={card.img} alt="" className="card-img-top" />
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
