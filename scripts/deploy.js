const zeroAddress = "0x0000000000000000000000000000000000000000";

var addr = {};
var chain = "mumbai";

if (chain == "goerli") {
    addr.connext = "0xB4C1340434920d70aD774309C75f9a4B679d801e";
    addr.router = "0xD25575eD38fa0F168c9Ba4E61d887B6b3433F350";
}
if (chain == "mumbai") {
    addr.connext = zeroAddress;
    addr.router = zeroAddress;
}


async function main() {
    // Grab the contract factory 
    const MyNFT = await ethers.getContractFactory("Rocket");
 
    // Start deployment, returning a promise that resolves to a contract object
    const myNFT = await MyNFT.deploy(addr.connext, addr.router); // Instance of the contract 
    console.log("Contract deployed to address:", myNFT.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });