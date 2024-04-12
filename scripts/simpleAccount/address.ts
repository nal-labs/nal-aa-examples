import { Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// @ts-ignore
import { V06 } from "userop";
import config from "../../config.json";

export default async function main() {
  const ethClient = createPublicClient({
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account: privateKeyToAccount(config.signingKey as Hex),
    transport: http(config.rpcUrl),
  });
  const account = new V06.Account.Instance({
    ...V06.Account.Common.SimpleAccount.base(ethClient, walletClient),
  });

  const address = await account.getSender();

  console.log(`SimpleAccount address: ${address}`);
}
