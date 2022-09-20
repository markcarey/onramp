const zeroAddress = "0x0000000000000000000000000000000000000000";

var addr = {};
var chain = "goerli";
var factor = "86400000000000000000000"; // 1 FUEL per second for 24 hours, in wei

if (chain == "goerli") {
    addr.nft = "0x42a47396CEb4D61f59c2BA60D5549bb313751B91";
    addr.token1 = "0xD75bA886DC86c37FBFf26415AE41246873B8b9bc";
    addr.token2 = "0xE3B89a65eDF515b76690348c26CA5fC5e01AFace";
}

async function main() {
    // Grab the contract factory 
    const Contract = await ethers.getContractFactory("Airdropper");
 
    // Start deployment, returning a promise that resolves to a contract object
    const myContract = await Contract.deploy(addr.nft, factor, addr.token1, addr.token2); // Instance of the contract 
    console.log("Contract deployed to address:", myContract.address);
    console.log(`npx hardhat verify --network ${chain} ${myContract.address} ${addr.nft} ${factor} ${addr.token1} ${addr.token2}`);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });