import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";
import { Presets } from "userop";

const INIT_CONFIG = {
  rpcUrl: "https://api.stackup.sh/v1/node/API_KEY",
  entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  simpleAccountFactory: "0xD0A7F1867f0656ed97D2A5BA1d371AED06879fcc",
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  secp256r1Key: Presets.Signers.BarzSecp256r1.generatePrivateKey(),
  paymaster: {
    rpcUrl: "https://api.stackup.sh/v1/paymaster/API_KEY",
    context: {},
  },
};
const CONFIG_PATH = path.resolve(__dirname, "../config.json");

async function main() {
  return fs.writeFile(
    CONFIG_PATH,
    prettier.format(JSON.stringify(INIT_CONFIG, null, 2), { parser: "json" })
  );
}

main()
  .then(() => console.log(`Config written to ${CONFIG_PATH}`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
