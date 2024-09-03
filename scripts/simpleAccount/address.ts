import { ethers } from "ethers";
import { Presets } from "userop";
// @ts-ignore
import config from "../../config.json";

export default async function main() {
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    new ethers.Wallet(config.signingKey),
    config.rpcUrl,
    {
      entryPoint:config.entryPoint,
      factory: config.simpleAccountFactory,
    }
  );
  const address = simpleAccount.getSender();

  console.log(`SimpleAccount address: ${address}`);
}
