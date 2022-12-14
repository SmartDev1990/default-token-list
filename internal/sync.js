const XLSX = require("xlsx");

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();

const { ChainId } = require("@smartdev1990/core-sdk1");

const fs = require("fs");

const { resolve } = require("path");

const NAME = {
  [ChainId.VELAS]: "velas",
  [ChainId.VELAS_TESTNET]: "velas-testnet",
};

(async () => {
  try {
    const book = XLSX.utils.book_new();

    for (const key of Object.keys(ChainId)) {
      const path = resolve(__dirname, `../tokens/${NAME[key]}.json`);

      if (!fs.existsSync(path)) {
        continue;
      }

      const tokens = require(path);

      // Grab file file names of the cronaswap/icons repo at the token path
      // we can use this to see if our default list is missing icons
      const { data } = await octokit.rest.repos.getContent({
        owner: "smartdev1990",
        repo: "icons",
        path: "token",
      });

      const icons = data.map((data) => data.name.replace(".jpg", ""));

      const json = [];

      for (const token of tokens) {
        const listIcon = icons.find(
          (icon) => icon === token.symbol.toLowerCase()
        );

        // TODO: Check Figma and get icon if available
        const figmaIcon = undefined;

        const icon = listIcon || figmaIcon;

        if ((!token.logoURI && !icon) || !icon) {
          json.push({
            network: NAME[key],
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            logoURI: token?.logoURI || "",
          });
          console.log("Add to list to send to chester");
          continue;
        }

        // Check if logoURI has correct path
        if (!token.logoURI.includes("smartdev1990/icons")) {
          // TODO: Automate this part...
          const logoURI = `https://raw.githubusercontent.com/smartdev1990/icons/master/token/${icon}.jpg`;

          console.log(`Update Logo URI for ${token.symbol} with ${logoURI}`);
        } else {
          console.log(`Logo URI for ${token.symbol} is correct`);
        }
      }

      const sheet = XLSX.utils.json_to_sheet(json);

      XLSX.utils.book_append_sheet(book, sheet, NAME[key]);
    }

    XLSX.writeFile(book, resolve(__dirname, `../generated/missing-icons.xlsx`));
  } catch (error) {
    console.error(error);
  }
})();
