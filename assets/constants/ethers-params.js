export const defaultParams = {
"provider.getBalance": 
`"address",
"latest"`,

"provider.getCode": 
`"address",
"latest"`,

"provider.getStorageAt": 
`"address",
0,
"latest"`,

"provider.getTransactionCount":
`"address",
"latest"`,

"provider.getBlock": 
`"latest"`,

"provider.getBlockWithTransactions": 
`"latest"`,

"provider.getAvatar": 
`"ricmoo.eth"`,

"provider.getResolver": 
`"ricmoo.eth"`,

"provider.lookupAddress": 
`"address"`,

"provider.resolveName": 
`"ricmoo.eth"`,

"provider.getLogs": 
`"filter"`,

"provider.call": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null,
  "nonce": null
}`,

"provider.estimateGas": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null
}`,

"provider.getTransaction": 
`"hash"`,

"provider.getTransactionReceipt": 
`"hash"`,

"provider.sendTransaction": 
`"signedTx"`,

"provider.waitForTransaction": 
`"hash",
1`,

"signer.getTransactionCount": 
`"latest"`,

"signer.call": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null,
  "nonce": null
}`,

"signer.estimateGas": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null
}`,

"signer.resolveName": 
`"ricmoo.eth"`,

"signer.signMessage": 
`"message"`,

"signer.signTransaction": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null,
  "nonce": null
}`,

"signer.sendTransaction": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null,
  "nonce": null
}`,

"signer.checkTransaction": 
`{
  "from": "",
  "to": "",
  "gasLimit": null,
  "gasPrice": null,
  "value": 10000000000000,
  "data": null,
  "nonce": null
}`,

"provider.provider.request": 
`{
  "method": "wallet_switchEthereumChain",
  "params": [
    {
      "chainId": "0x13881"
    }
  ]
}`,

}