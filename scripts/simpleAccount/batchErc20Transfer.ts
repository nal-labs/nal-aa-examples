import { V06 } from "userop";
import {
  Hex,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  getAddress,
  getContract,
  http,
  parseUnits,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import config from "../../config.json";
import { CLIOpts, ERC20_ABI } from "../../src";
// This example requires several layers of calls:
//  ┕> sender.executeBatch
//    ┕> token.transfer (recipient 1)
//    ⋮
//    ┕> token.transfer (recipient N)
export default async function main(
  tkn: string,
  t: Array<string>,
  amt: string,
  opts: CLIOpts
) {
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
  const token = getAddress(tkn);
  const contract = getContract({
    address: token,
    abi: ERC20_ABI,
    client: {
      public: ethClient,
      wallet: walletClient,
    },
  });
  const [symbol, decimals] = await Promise.all([
    contract.read.symbol(),
    contract.read.decimals(),
  ]);

  const amount = parseUnits(amt, decimals);

  let dest: Array<Address> = [];
  let data: Array<Address> = [];
  t.map((addr) => addr.trim()).forEach((addr) => {
    dest = [...dest, contract.address];
    data = [
      ...data,
      encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [getAddress(addr), amount],
      }),
    ];
  });
  console.log(
    `Batch transferring ${amt} ${symbol} to ${dest.length} recipients...`
  );
  const batchTransfer = await account
    .encodeCallData("executeBatch", [dest, data])
    .sendUserOperation();
  console.log("Waiting for transaction...");
  const receipt = await batchTransfer.wait();
  if (receipt) {
    console.log(`Userop hash: ${receipt.userOpHash}`);
    console.log(`Transaction hash: ${receipt.receipt.transactionHash}`);
  }
  //
  //  const res = await client.sendUserOperation(
  //    simpleAccount.executeBatch(dest, data),
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
