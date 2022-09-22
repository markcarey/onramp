var functions = require('firebase-functions');
var firebase = require('firebase-admin');
var storage = firebase.storage();
const bucket = storage.bucket("onramp");

const fetch = require('node-fetch');

var imageDataURI = require("image-data-uri");
var textToImage = require("text-to-image");
var text2png = require('text2png');
var sigUtil = require("eth-sig-util");

const { ethers } = require("ethers");
const { nextTick } = require('async');

const ROCKET_GOERLI = process.env.ROCKET_GOERLI;
const ROCKET_OPTIGOERLI = process.env.ROCKET_OPTIGOERLI;
const ROCKET_MUMBAI = process.env.ROCKET_MUMBAI;
const API_URL_GOERLI = process.env.API_URL_GOERLI;
const API_URL_MUMBAI = process.env.API_URL_MUMBAI;
const API_URL_OPTIGOERLI = process.env.API_URL_OPTIGOERLI;

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

var providers = [];
providers[0] = new ethers.providers.JsonRpcProvider({"url": API_URL_GOERLI});
providers[1] = new ethers.providers.JsonRpcProvider({"url": API_URL_OPTIGOERLI});
providers[2] = new ethers.providers.JsonRpcProvider({"url": API_URL_MUMBAI});

var rockets = [];
rockets[0] = ROCKET_GOERLI;
rockets[1] = ROCKET_OPTIGOERLI;
rockets[2] = ROCKET_MUMBAI;

const rocketJSON = require(__base + 'onramp/Rocket.json');

var signer, rocket;

const gasOptions = {"maxPriorityFeePerGas": "45000000000", "maxFeePerGas": "45000000016" };

function getContracts(pk, provider, rocketAddress) {
  signer = new ethers.Wallet(pk, provider);
  rocket = new ethers.Contract(
    rocketAddress,
    rocketJSON.abi,
    signer
  );
}

function cors(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    //res.status(204).send('');
  } else {
    // Set CORS headers for the main request
    res.set('Access-Control-Allow-Origin', '*');
  }
  return res;
}


module.exports = {

  "cron": async function(context) {
    console.log('This will be run every 5 minutes!');
    //return false;   // TODO: diabled for now, need to implement lastBlock

    

    var blockRef = firebase.database().ref('onramp/bot');
    var updates = {};
    return blockRef.on('value', async (snapshot) => {
      var bot = snapshot.val();
      var blocks = bot.latestBlocks;
      console.log("db latest", blocks);

      if ( !blocks ) {
        // defaults
        blocks[0] = 7566200; // goerli
        blocks[1] = 29813; // optigoerli
        blocks[2] = 28032406; // mumbai
      }


      for (let i = 0; i < providers.length; i++) {
        var rocketAddress = rockets[i];
        var provider = providers[i];
        var latestBlock = blocks[i];
        getContracts(process.env.ONRAMP_BOT_PK, provider, rocketAddress);
        var start = latestBlock + 1;
        var end = 'latest';
        let departed = rocket.filters.Launched();
        let departedLogs = await rocket.queryFilter(departed, start, end);
        console.log(JSON.stringify(departedLogs));
        if ( departedLogs.length > 0 ) {
          for (let j = 0; j < departedLogs.length; j++) {
            if ( "args" in departedLogs[j] ) {
              var args = departedLogs[j].args;
              var chainId = parseInt(args[0]);
              var destinationContract = args[1];
              var tokenId = parseInt(args[2]);
              var owner = args[3];
              var uri = args[4];
              console.log(chainId, destinationContract, tokenId, owner, uri);
              var destRocket;
              var destProvider;
              if (chainId == 80001) {
                destProvider = providers[2];
              }
              if (chainId == 420) {
                destProvider = providers[1];
              }
              if (chainId == 5) {
                destProvider = providers[0];
              }
              if ( departedLogs[j].blockNumber > blocks[i] ) {
                blocks[i] = departedLogs[j].blockNumber;
              }
              getContracts(process.env.ONRAMP_BOT_PK, destProvider, destinationContract);
              var exists = await rocket.exists(tokenId);
              if ( !exists ) {
                console.log("destinationContract", destinationContract);
                await (await rocket.bridgeArrive(owner, tokenId, uri)).wait();
                const osURL = "https://testnets-api.opensea.io/api/v1/asset/" + destinationContract + "/" + tokenId + "/?force_update=true";
                console.log("osURL", osURL);
                const opensea = fetch(osURL);
                //await opensea.json();
              }
            } else {
              console.log("no args for", departedLogs[j]);
            }
          }
        }
        var latestBlock = parseInt(await provider.getBlockNumber()) - 1;
        blocks[i] = latestBlock;
      }
      
      updates['/onramp/bot/latestBlocks'] = blocks;
      return firebase.database().ref().update(updates);
    });
  }, // cron

  "updateMeta": async function(req,res) {
    res = cors(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }
    var chain = parseInt(req.query.chain);
    if (!chain) {
      chain = 0;
    }
    var tokenId = req.query.id;
    if (tokenId == "undefined") {
      return res.json({"error": "missing token id"});
    }
    var uri = req.query.uri;
    var rocketAddress = rockets[chain];
    var provider = providers[chain];
    console.log(rocketAddress, provider, uri, tokenId);
    getContracts(process.env.ONRAMP_BOT_PK, provider, rocketAddress);
    var exists = await rocket.exists(tokenId);
    if ( !exists ) {
      return res.json({"error": `tokenId ${tokenId} does not exist on chain ${chain}`});
    }
    await (await rocket.setTokenURI(tokenId, uri)).wait();
    fetch("https://testnets-api.opensea.io/api/v1/asset/" + rocketAddress + "/" + tokenId + "/?force_update=true");
    return res.json({"result": "ok"});
  }, // updateMeta


}; // module.exports