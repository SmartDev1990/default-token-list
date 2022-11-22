const { version } = require("../package.json");

const brise = require("../assets/tokens/brise.json");

module.exports = function buildList() {
  const parsed = version.split(".");
  return {
    name: "TowerSwap Menu",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI:
      "https://raw.githubusercontent.com/smartdev1990/default-token-list/master/assets/logox200.png",
    keywords: ["riceswap", "default"],
    tokens: [
      ...brise,
    ]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };
};
