/* global AlgoSigner */
import { Button, Container, CssBaseline, Typography, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import { useCallback, useState } from 'react';
import { CHAIN_NAME } from '../algosigner.config';

const spacing = "10px";

const ExampleAlgoSigner = ({ title, buttonText, buttonAction }) => {
  const [result, setResult] = useState("");

  const check = useCallback(async () => {
    const r = await buttonAction();
    setResult(r);
  }, [buttonAction]);

  return (
    <div className="algoSigner">
      <Typography variant="h5">{title}</Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={check}
        style={{
          margin: "5px 0px 5px 0px",
        }}
      >
        {buttonText}
      </Button>

      <Typography>
        <code>{result}</code>
      </Typography>
    </div>
  );
};

const Connect = () => {
  const action = useCallback(async () => {
    try {
      const response = await AlgoSigner.connect({
        ledger: CHAIN_NAME,
      });
      return JSON.stringify(response, null, 2);
    } catch (e) {
      return JSON.stringify(e.message, null, 12);
    }
  }, []);

  return (
    <ExampleAlgoSigner
      title="Connect with Algosigner"
      buttonText="Connect"
      buttonAction={action}
    />
  );
};

const GetAccounts = () => {
  const action = useCallback(async () => {
    try {
      const accts = await AlgoSigner.accounts({
        ledger: CHAIN_NAME,
      });
      return JSON.stringify(accts, null, 2);
    } catch (e) {
      return JSON.stringify(e.message, null, 12);
    }
  }, []);

  return (
    <ExampleAlgoSigner
      title="Get Accounts"
      buttonText="Get Accounts"
      buttonAction={action}
    />
  );
};

export default function Signer() {
  return (
    <Container>
      <CssBaseline />
      <Connect />
      <GetAccounts />
    </Container>
  );
}

ExampleAlgoSigner.propTypes = {
  title: PropTypes.string,
  buttonText: PropTypes.string,
  buttonAction: PropTypes.func,
};

ExampleAlgoSigner.defaultProps = {
  title: "",
  buttonText: "",
  buttonAction: null,
};
