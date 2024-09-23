# Nal-AA System Solution

# Nal-AA System Overview

Nal-AA is a system based on the ERC4337 protocol, featuring AA accounts, gas payment subsidies, and the ability to pay using any ERC20 Token:

1. **AA Account**: Users can create an AA account and designate an account owner to sign transactions. The AA account can hold any on-chain assets, such as ETH, ERC20 tokens, NFTs, and more.
2. **Gas Fee Delegation**: The Nal-AA system provides a seamless gas fee payment service, enabling users to delegate these costs effortlessly. Users who can access the Nal-Paymaster service interface are able to assign their gas fees to the system, simplifying the transaction process and enhancing their blockchain experience.
3. **ERC20 Token Gas Payments**: Any user can use their ERC20 tokens to cover gas fees by pre-authorizing the Paymaster contract address.

<aside>
🔥

"Any ERC20 Token" refers to publicly issued tokens with market value. The first version of Nal-AA supports gas payments with USDT.

</aside>

# Nal-AA System Composition

## SmartContract on Chain

The main components include:

1. **EntryPoint**: The entry point for submitting UserOp transactions.
2. **AccountFactory**: The factory responsible for creating AA accounts.
3. **Paymaster**: Responsible for executing gas payment logic.

In addition, there is a series of library contracts and utility contracts.

## Nal-Bundler Service

Responsible for submitting the user's UserOp on-chain, it requires the configuration of an EOA private key that holds ETH on-chain.

## Nal-Paymaster Service

<aside>
🔥

Note: The Paymaster needs to continuously deposit into the EntryPoint to maintain ongoing service.

</aside>

Responsible for issuing payment information, two payment modes are provided:

1. **Pay-as-you-go (payg) Mode**: The Paymaster covers the gas fees, requiring the Paymaster to deposit in advance into the EntryPoint contract.
2. **ERC20 Mode**: The Paymaster pays the gas fees and then deducts the corresponding amount of ERC20 tokens from the user. The Paymaster needs to stack a deposit in the EntryPoint (not deducted, serves as collateral).

# Nal-AA Service Deployment

The Bundler and Paymaster services of Nal-AA are launched via Docker, requiring Docker to be installed in advance.

## Nal-Bundler Service Deployment

First create `.env` file.

```bash
mkdir -pv /data/nal-bundler
touch /data/nal-bundler/.env
```

Fill `.env` config file：

```bash
ERC4337_BUNDLER_ETH_CLIENT_URL=https://testnet-rpc.nal.network
ERC4337_BUNDLER_PRIVATE_KEY=xxxx
```

- ERC4337_BUNDLER_ETH_CLIENT_URL：RPC URL for chain,
    - testnet：https://testnet-rpc.nal.network
    - mainnet：https://rpc.nal.network
- ERC4337_BUNDLER_PRIVATE_KEY：The private key of the EOA user, which holds ETH on-chain and is responsible for submitting transactions, should be provided without the "0x" prefix；

```bash
# get the image
docker pull registry-intl.cn-hongkong.aliyuncs.com/nal/nal_bundler:latest

# docker run
docker run -d --name nal_bundler \
- v /data/nal-bundler/.env:/app/.env \
- p 4337:4337 \
- -restart always registry-intl.cn-hongkong.aliyuncs.com/nal/nal_bundler:latest

# check the log
docker logs -f  nal_bundler
```

## Nal-Paymaster

### Install dependencies

Please ignore if you have these already.

- Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
# make it validated
source /root/.bashrc

# execute commond : foundryup to finish install
foundryup
```

### paymaster smart contract deployment

1. Get repository and install dependencies

```bash
git clone https://github.com/nal-labs/singleton-paymaster.git
cd singleton-paymaster
git checkout feat/nal
forge install
```

2. Generate paymaster authentication account(Don't need have ETH on chain)

```bash
cast w new

Successfully created new keypair.
Address:     0xFEcd3xxxxxxxxxxxxxxxxxB009BAfFE
Private key: 0x2f703050de7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx280fb82dc98fd3
```

3. Open file `scripts/SinglePmV6.sol` in repository，config paymaster authentication account：

```bash
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/SingletonPaymasterV6.sol";

contract SinglePmV6 is Script {
    function run() external {
        uint256 deployerPrivateKey = 0x480f7c06xxxxxxxxxxxxxxxxc514a1faddb;
        vm.startBroadcast(deployerPrivateKey);

        address[] memory signers = new address[](1);

        signers[0] = 0xBDAxxxxxxxxx1E5;
        SingletonPaymasterV6 singlePmV6 = new SingletonPaymasterV6(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, signers[0], signers);

        vm.stopBroadcast();
    }
}
```

- deployerPrivateKey is the private key in step 2；
- signers[0] is the address in step 2；
- do not need to modify other code；
4. Execute the command below, get paymaster smart contract address：

```bash
forge script scripts/SinglePmV6.s.sol --rpc-url https://testnet-rpc.nal.network

##### 328527624
✅  [Success]Hash: 0x35e814bf7966aa3981bf75324a80c8e75cd3b8e7bd147d62d0cc4dbbb09db00a
Contract Address: 0x0631e63C2dxxxxxxxxx6e938f
Block: 3906023
Paid: 0.00625671052556364 ETH (2085570 gas * 3.000000252 gwei)
```

Contract Address is the new paymaster contract address；

### paymaster service deployment

First create `.env` file.

```bash
mkdir -pv /data/nal-paymaster
touch /data/nal-paymaster/.env
```

Fill `.env` config file：

```bash
ERC4337_PAYMASTER_ETH_CLIENT_URL=https://testnet-rpc.nal.network
ERC4337_PAYMASTER_SIGNING_KEY=xxxxx
ERC4337_PAYMASTER_ENTRYPOINT_TO_PAYMASTERS="0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789=0x0631e63C2dD6640a9D17a3498031CD42Dc6e938f"
```

- ERC4337_PAYMASTER_ETH_CLIENT_URL：RPC URL for chain,
    - testnet：https://testnet-rpc.nal.network
    - mainnet：https://rpc.nal.network
- ERC4337_PAYMASTER_SIGNING_KEY：The private key responsible for signing and authenticating Paymaster data should be provided without the "0x" prefix；
- ERC4337_PAYMASTER_ENTRYPOINT_TO_PAYMASTERS：The on-chain EntryPoint and Paymaster contract addresses are as follows: the EntryPoint contract address is fixed at **0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789**, while the Paymaster contract address will be the address of the newly deployed Paymaster contract.

```bash
# get image
docker pull registry-intl.cn-hongkong.aliyuncs.com/nal/nal_paymaster:latest

# docker run
docker run -d --name nal_paymaster \
-v /data/nal-paymaster/.env:/app/.env \
-p 4337:4337 \
--restart always registry-intl.cn-hongkong.aliyuncs.com/nal/nal_paymaster:latest

# check the log
docker logs -f  nal_paymaster
```

# Nal-AA Operations

To provide payment delegation services, it is necessary to deposit and stake funds into the Paymaster contract within the EntryPoint contract. Use any on-chain account with ETH to execute the following operations:

- deposit

**The deposited amount for gas will be continuously consumed, so it is essential to replenish it in a timely manner; otherwise, payment services may fail.**

```bash
# Commond
cast send --private-key <your private key> <paymaster contract addr> "deposit()" --value <depositValue> --rpc-url https://testnet-rpc.nal.network 
# eg.
cast send --private-key 0x48xxxxxxddb 0x0631e63C2dD6640a9D17a3498031CD42Dc6e938f "deposit()" --value 0.1ether --rpc-url https://testnet-rpc.nal.network 
```

- stake

The staked amount serves as collateral and will not be consumed; it can be withdrawn later.

```bash
# Commond
cast send --private-key <your private key> <paymaster contract addr> "addStake(uint32)" 1  --value <depositValue> --rpc-url https://testnet-rpc.nal.network
# eg.
cast send --private-key 0x48xxxxxxddb 0x0631e63C2dD6640a9D17a3498031CD42Dc6e938f "addStake(uint32)" 1  --value 0.1ether --rpc-url https://testnet-rpc.nal.network
```

# Nal-AA Call

Currently, **userop.js** is used as the client to call the SDK for Nal-AA.

- For the API documentation of userop.js, visit: [https://docs.stackup.sh/docs/useropjs-legacy-v03](https://docs.stackup.sh/docs/useropjs-legacy-v03).
- The **nal-aa-examples** repository contains example code using userop.js and can be downloaded from GitHub. The provided examples include:
    - Creating an AA account.
    - Transferring funds using the AA account.
    - Executing transfers through the Paymaster payment service.
    - Using your own ERC20 token (USDT) as gas.

The following sections will explain how to use nal-aa-examples.

<aside>
🔥

Nal Browser has supported UserOp search：[ops in browser](https://testnet-scan.nal.network/ops)

</aside>

## Download

```bash
git clone https://github.com/nal-labs/nal-aa-examples.git
cd nal-aa-examples
git checkout feat/nal
```

## Install dependencies

```bash
yarn install
```

## Add Configuration

## Generate configuration file

```bash
yarn run init
```

## Configuration description

eg.

```bash
{
  "rpcUrl": "https://testnet-rpc.nal.network",
  "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "simpleAccountFactory": "0x9406Cc6185a346906296840746125a0E44976454",
  "signingKey": "use your own private key as AA owner",
  "paymaster": {
    "rpcUrl": "https://x.x.x.x/paymaster/",
    "context": {"type":"erc20", "token":"0xe4F926348D533d2B20857bD4D96bA92A4cEB9c15"}
  }
}
```

description：

- rpcUrl：RPC URL for chain，use the configuration provided in the example without modification；
- entryPoint：The entry point for submitting userOp, use the configuration provided in the example without modification；
- simpleAccountFactory：The AA account creation factory, use the configuration provided in the example without modification；
- signingKey：The private key for the AA account owner；
- paymaster：Configuration related to payment services.
    - rpcUrl：The URL for the payment service；
    - context：JSON；
        - type：two options, 1:payg，2:erc20
        - token：Leave blank for payg; for erc20, provide the USDT contract address;


## Generate AA

```bash
yarn run simpleAccount address
```

## Make a transfer from AA

### ETH

```bash
yarn run simpleAccount transfer --to 0xBDA54E9DFcD5xxxxxxxx99E3c37938f291E5 --amount 0.001 -b https://x.x.x.x/bundler/
```

### ERC20

```bash
yarn run simpleAccount erc20Transfer -tkn 0xe4F926348D533d2B20857bD4D96bA92A4cEB9c15 -t 0xBDA54E9DFcD5xxxxxxxx99E3c37938f291E5 -amt 10 -b  https://x.x.x.x/bundler/
```

## Make a transfer from AA with paymaster

### ETH

```bash
yarn run simpleAccount transfer --to 0xBDA54E9DFcD5xxxxxxxx99E3c37938f291E5 --amount 0.001 -b https://x.x.x.x/bundler/ -pm
```

### ERC20

```bash
yarn run simpleAccount erc20Transfer -tkn 0xe4F926348D533d2B20857bD4D96bA92A4cEB9c15 -t 0xBDA54E9DFcD5xxxxxxxx99E3c37938f291E5 -amt 10 -b  https://x.x.x.x/bundler/ -pm
```

## Use ERC20Token(USDT) for Gas

Use ERC20Token(USDT) hold by AA for Gas

1. First give a approvement.

```bash
yarn run simpleAccount erc20Approve -tkn 0xe4F926348D533d2B20857bD4D96bA92A4cEB9c15 -s 0x0631e63C2dD6xxxxxxx2Dc6e938f -amt 10000 -b https://x.x.x.x/bundler/ -pm
```

2. Modify paymaster field in configuration.

```bash
"paymaster": {
    "rpcUrl": "https://x.x.x.x/paymaster/",
    "context": {"type":"erc20", "token":"0xe4F926348D533d2B20857bD4D96bA92A4cEB9c15"}
}
```

3. Make tranfer.

```bash
yarn run simpleAccount transfer --to 0xBDA54E9DFcD5xxxxxxxx99E3c37938f291E5 --amount 0.001 -b https://x.x.x.x/bundler/ -pm
```