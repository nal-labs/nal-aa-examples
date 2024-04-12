import { V06 } from "userop";
import {
  Hex,
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CLIOpts } from "../../src";
// @ts-ignore
import config from "../../config.json";

export default async function main(t: string, amt: string, opts: CLIOpts) {
  const ethClient = createPublicClient({
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account: privateKeyToAccount(config.signingKey as Hex),
    transport: http(config.rpcUrl),
  });

  const paymaster = opts.withPM
    ? V06.Account.Hooks.RequestPaymaster.withCommon({
      variant: "stackupV1",
      parameters: {
        rpcUrl: config.paymaster.rpcUrl,
        type: config.paymaster.context.type as any,
      },
    })
    : undefined;

  const account = new V06.Account.Instance({
    ...V06.Account.Common.SimpleAccount.base(ethClient, walletClient),
    requestPaymaster: paymaster,
  });

  const target = getAddress(t);
  const value = parseEther(amt);
  const send = await account
    .encodeCallData("execute", [target, value, "0x"])
    .sendUserOperation();

  console.log("Waiting for transaction...");
  const receipt = await send.wait();
  if (receipt) {
    console.log(`Userop hash: ${receipt.userOpHash}`);
    console.log(`Transaction hash: ${receipt.receipt.transactionHash}`);
  }
}
