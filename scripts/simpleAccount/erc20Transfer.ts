// @ts-ignore
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
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import config from "../../config.json";
import { CLIOpts, ERC20_ABI } from "../../src";

export default async function main(
  tkn: string,
  t: string,
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
  const to = getAddress(t);
  console.log({ token, to });
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

  console.log({ symbol, decimals });
  const amount = parseUnits(amt, decimals);
  console.log(`Transferring ${amt} ${symbol}...`);
  const transferFunc = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  });

  const transfer = await account
    .encodeCallData("execute", [token, BigInt(0), transferFunc])
    .sendUserOperation();

  console.log("Waiting for transaction...");
  const receipt = await transfer.wait();
  if (receipt) {
    console.log(`Userop hash: ${receipt.userOpHash}`);
    console.log(`Transaction hash: ${receipt.receipt.transactionHash}`);
  }
}
