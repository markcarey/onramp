var chain = "goerli";

async function main() {
    // Grab the contract factory 
    const Contract = await ethers.getContractFactory("Assert");
 
    // Start deployment, returning a promise that resolves to a contract object
    const myContract = await Contract.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", myContract.address);
    console.log(`npx hardhat verify --network ${chain} ${myContract.address}`);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });