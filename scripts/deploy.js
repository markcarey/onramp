const zeroAddress = "0x0000000000000000000000000000000000000000";

var addr = {};
//var chain = "goerli";
//var chain = "optimism-goerli";
var chain = "mumbai";

if (chain == "goerli") {
    addr.connext = "0xD9e8b18Db316d7736A3d0386C59CA3332810df3B";
    addr.router = "0x570faC55A96bDEA6DE85632e4b2c7Fde4efFAD55";
    addr.test = "0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1";
}
if (chain == "mumbai") {
    addr.connext = zeroAddress;
    addr.router = zeroAddress;
    addr.test = zeroAddress;
}
if (chain == "optimism-goerli") {
    addr.connext = "0xA04f29c24CCf3AF30D4164F608A56Dc495B2c976";
    addr.router = "0xF0Efb28f638A5262DdA8E8C4556eac4F0B749A22";
    addr.test = "0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF";
}


async function main() {
    // Grab the contract factory 
    const MyNFT = await ethers.getContractFactory("Rocket");
 
    // Start deployment, returning a promise that resolves to a contract object
    const myNFT = await MyNFT.deploy(addr.connext, addr.router, addr.test); // Instance of the contract 
    console.log("Contract deployed to address:", myNFT.address);
    console.log(`npx hardhat verify --network ${chain} ${myNFT.address} ${addr.connext} "${addr.router}" ${addr.test}`);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });