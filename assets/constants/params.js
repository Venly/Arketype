export const defaultParams = {
"eth.call": 
`{
  "from": "",
  "to": "",
  "gas": null,
  "gasPrice": null,
  "value": 3140000000000000,
  "data": null,
  "nonce": null
}`,

"eth.estimateGas": 
`{
  "from": "",
  "to": "",
  "gas": null,
  "gasPrice": null,
  "value": 3140000000000000,
  "data": null
}`,

"eth.getBalance": 
`"address",
"latest"`,

"eth.getBlock": 
`"latest",
false`,

"eth.getBlockTransactionCount": 
`"latest"`,

"eth.getBlockUncleCount": 
`"latest"`,

"eth.getCode": 
`"address",
"latest"`,

"eth.getFeeHistory": 
`"",
"",
[]`,

"eth.getPastLogs": 
`{
  "fromBlock": "latest",
  "toBlock": "latest",
  "address": null,
  "topics": null
}`,

"eth.getProof": 
`"address",
[],
"latest"`,

"eth.getStorageAt": 
`"address",
0,
"latest"`,

"eth.getTransaction": 
`"transactionHash"`,

"eth.getTransactionCount":
`"address",
"latest"`,

"eth.getTransactionFromBlock": 
`"latest",
0`,

"eth.getTransactionReceipt": 
`"hash",
""`,

"eth.getUncle": 
`"latest",
0,
false`,

"eth.sendSignedTransaction": 
`"transactionData"`,

"eth.sendTransaction": 
`{
  "from": "",
  "to": "",
  "gas": null,
  "gasPrice": null,
  "value": 3140000000000000,
  "data": null,
  "nonce": null
}`,

"eth.sign": 
`"data",
"address"`,

"eth.signTransaction": 
`{
  "from": "",
  "to": "",
  "gas": null,
  "gasPrice": null,
  "value": 3140000000000000,
  "data": null,
  "nonce": null
}`,

"currentProvider.request": 
`{
  "method": "wallet_switchEthereumChain",
  "params": [
    {
      "chainId": "0x13881"
    }
  ]
}`,

}