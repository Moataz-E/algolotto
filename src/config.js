// Indexer Config
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
      "X-API-Key": "Xhkn7v7h972hj7Egx3fGr9RFbfXeGuoD6wSLKDyG",
    },
  },
  "localhost": {
    host: "http://localhost",
    port: 4001,
    token: { "X-Algo-API-Token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
  }
}

module.exports = {
  INDX_CONFIG
}