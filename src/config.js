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
    id: 101851233,
    address: "VLPVPT4L4P7VYVUROGLECOFW6VKIHRCTLKD5NWA736KA4XXND5HGMAM7QQ"
  },
  "localhost": {
    id: 1,
    address: "WCS6TVPJRBSARHLN2326LRU5BYVJZUKI2VJ53CAWKYYHDE455ZGKANWMGM"
  }
}

const PRIMARY_COLOR = "#b1277c"
const SECONDARY_COLOR = "54424b"

module.exports = {
  INDX_CONFIG,
  ALGOD_CONFIG,
  NETWORKS,
  APP_CONFIG,
  PRIMARY_COLOR,
  SECONDARY_COLOR
}
