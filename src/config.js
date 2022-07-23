const NETWORKS = ["localhost", "testnet"];
// const NETWORKS = ["testnet"];

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

const APP_CONFIG = {
  "mainnet": {
    id: "",
    address: ""
  },
  "testnet": {
    id: 100328257,
    address: "ORLFFUY4L4MK2V2SDH7BZJR2PDOPN6CZ3NROM6IE7HO7WAWTB2TIRXQB7Y"
  },
  "localhost": {
    id: 2,
    address: "FHQPLJVRO7FVHYKCA2SGR3I7ZHHKHAQS4AGOAVGGGJQJYTTBVEJUGHN5JQ"
  }
}

module.exports = {
  INDX_CONFIG,
  ALGOD_CONFIG,
  NETWORKS,
  APP_CONFIG
}
