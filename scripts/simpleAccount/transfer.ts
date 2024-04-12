import { V06 } from "userop";
import { Hex, createPublicClient, createWalletClient, http } from "viem";
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
  const account = new V06.Account.Instance({
    ...V06.Account.Common.SimpleAccount.base(ethClient, walletClient),
  });

  console.log("account", account.getSender());
  //  const paymasterMiddleware = opts.withPM
  //    ? Presets.Middleware.verifyingPaymaster(
  //        config.paymaster.rpcUrl,
  //        config.paymaster.context
  //      )
  //    : undefined;
  //  const simpleAccount = await Presets.Builder.SimpleAccount.init(
  //    new ethers.Wallet(config.signingKey),
  //    config.rpcUrl,
  //    { paymasterMiddleware, overrideBundlerRpc: opts.overrideBundlerRpc }
  //  );
  //  const client = await Client.init(config.rpcUrl, {
  //    overrideBundlerRpc: opts.overrideBundlerRpc,
  //  });
  //
  //  const target = ethers.utils.getAddress(t);
  //  const value = ethers.utils.parseEther(amt);
  //  const res = await client.sendUserOperation(
  //    simpleAccount.execute(target, value, "0x"),
  //    {
  //      dryRun: opts.dryRun,
  //      onBuild: (op) => console.log("Signed UserOperation:", op),
  //    }
  //  );
  //  console.log(`UserOpHash: ${res.userOpHash}`);
  //
  //  console.log("Waiting for transaction...");
  //  const ev = await res.wait();
  //  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}
