import { CLIOpts } from "../../src";

// @ts-ignore

export default async function main(
  tkn: string,
  s: string,
  amt: string,
  opts: CLIOpts
) {
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
  //  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  //  const token = ethers.utils.getAddress(tkn);
  //  const spender = ethers.utils.getAddress(s);
  //  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  //  const [symbol, decimals] = await Promise.all([
  //    erc20.symbol(),
  //    erc20.decimals(),
  //  ]);
  //  const amount = ethers.utils.parseUnits(amt, decimals);
  //  console.log(`Approving ${amt} ${symbol}...`);
  //
  //  const res = await client.sendUserOperation(
  //    simpleAccount.execute(
  //      erc20.address,
  //      0,
  //      erc20.interface.encodeFunctionData("approve", [spender, amount])
  //    ),
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
