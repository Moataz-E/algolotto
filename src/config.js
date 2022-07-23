const NETWORKS = ["localhost", "testnet"];

const INDX_CONFIG = {
  "mainnet": {
    host: "",
    port: "",
    token: {
      "X-API-Key": "",
    },
  },
  "testnet": {
    host: "https://testnet-algorand.api.purestake.io/ps2",
    port: "",
    token: {
      "X-API-Key": "tG0lIkkHzp259H7bXipdh8EFauTxaMj25kOJiDaX",
    },
  },
  "localhost": {
    host: "http://localhost",
    port: 8980,
    token: "",
  }
}

const ALGOD_CONFIG = {
  "mainnet": {
    host: "",
    port: "",
    token: {
      "X-API-Key": "",
    },
  },
  "testnet": {
    host: "https://testnet-algorand.api.purestake.io/ps2",
    port: "",
    token: {
      "X-API-Key": "tG0lIkkHzp259H7bXipdh8EFauTxaMj25kOJiDaX",
    },
  },
  "localhost": {
    host: "http://localhost",
    port: 4001,
    token: { "X-Algo-API-Token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
  }
}

const APP_ID = 2;
const APP_ADDR = "FHQPLJVRO7FVHYKCA2SGR3I7ZHHKHAQS4AGOAVGGGJQJYTTBVEJUGHN5JQ";

module.exports = {
  INDX_CONFIG,
  ALGOD_CONFIG,
  NETWORKS,
  APP_ID,
  APP_ADDR
}
