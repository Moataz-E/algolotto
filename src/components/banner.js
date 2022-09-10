import React from 'react';
import { Typography, Image, Row, Col } from 'antd';

import Texty from 'rc-texty';
import 'rc-texty/assets/index.css';
import TweenOne from 'rc-tween-one';


import "./banner.css"


const { Title } = Typography;


function BannerAnimatedContent() {

  const geInterval = (e) => {
    switch (e.index) {
      case 0:
        return 0;
      case 1:
        return 150;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return 150 + 450 + (e.index - 2) * 10;
      default:
        return 150 + 450 + (e.index - 6) * 150;
    }
  }
  const getEnter = (e) => {
    const t = {
      opacity: 0,
      scale: 0.8,
      y: '-100%',
    };
    if (e.index >= 2 && e.index <= 6) {
      return { ...t, y: '-30%', duration: 150 };
    }
    return t;
  }

  const getSplit = (e) => {
    const t = e.split(' ');
    const c = [];
    t.forEach((str, i) => {
      c.push((
        <span key={`${str}-${i}`}>
          {str}
        </span>
      ));
      if (i < t.length - 1) {
        c.push(<span key={` -${i}`}> </span>);
      }
    });
    return c;
  }

  return (
    <div className="combined">
      <div className="combined-shape">
        <div className="shape-left">
          <TweenOne
            animation={[
              { x: 158, type: 'from', ease: 'easeInOutQuint', duration: 600 },
              { x: -158, ease: 'easeInOutQuart', duration: 450, delay: -150 },
            ]}
          />
        </div>
        <div className="shape-right">
          <TweenOne
            animation={[
              { x: -158, type: 'from', ease: 'easeInOutQuint', duration: 600 },
              { x: 158, ease: 'easeInOutQuart', duration: 450, delay: -150 },
            ]}
          />
        </div>
      </div>
      <Title>
        <Texty
          className="banner-title"
          type="mask-top"
          delay={200}
          enter={getEnter}
          interval={geInterval}
          component={TweenOne}
          componentProps={{
            animation: [
              { x: 130, type: 'set' },
              { x: 100, delay: 500, duration: 450 },
              {
                ease: 'easeOutQuart',
                duration: 300,
                x: 0,
              },
              {
                letterSpacing: 0,
                delay: -300,
                scale: 0.9,
                ease: 'easeInOutQuint',
                duration: 800,
              },
              { scale: 1, width: '100%', delay: -300, duration: 1000, ease: 'easeInOutQuint' },
            ],
          }}
        >
          Algolotto
        </Texty>
      </Title>
      <TweenOne
        className="banner-bar"
        animation={{ delay: 2000, width: 0, x: 158, type: 'from', ease: 'easeInOutExpo' }}
      />
      <Title level={3}>
        <Texty
          className="banner-subtext"
          type="bottom"
          split={getSplit}
          delay={1500}
          interval={30}
        >
          Win Big and Grow Algorand!
        </Texty>
      </Title>
    </div>
  );
}

function CircleAnimation() {

  function duplicateElements(array, times) {
    return array.reduce((res, current) => {
      return res.concat(Array(times).fill(current));
    }, []);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }


  const getCircles = () => {
    let keyFrames = duplicateElements(["x1", "x2", "y1", "y2"], 5);
    shuffleArray(keyFrames);

    return [...keyFrames].map((v, i) => (
      <div key={i} className={`circle-container c${i}`} style={{ animation: "5s linear 0s infinite normal none running z" }}>
        <div className={`circle i${i}`} style={{ animation: `7.5s linear ${i / 10}s infinite normal none running ${v}` }}>
        </div>
      </div >
    ))
  }

  return (
    <div className="circles" style={{ width: "100%", minHeight: "100%" }}>
      {getCircles()}
    </div>
  )
}

export default function Banner() {
  return (
    <Row justify="center" align="middle" className="banner">
      <Col>
        <TweenOne animation={{ y: 20 }}>
          <BannerAnimatedContent />
          <CircleAnimation />
        </TweenOne>
      </Col>
    </Row >
  )
}