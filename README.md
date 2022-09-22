# 🚀 onRamp Quest

onRamp Quest is an education game that sends particants on missions to learn about Ethereum. 

The demo project provides a framework for stepping the user through 12 missions, evolving a dynamic NFT as they progress. *A production version would include video/text tutorial content for each each mission*. While each mission can be completed without leaving the onRamp interface, user are encouraged to visit related protocol dapps to view the results of their efforts on those sites.

# The Missions

onRamp includes 12 missions spanning wallet creation, NFT minting, airdrop claiming, token streaming, DeFi, DAO governance, and more.

## Mission 1 - Install Metamask
The first mission is to istall Metamask and connect. Users that already have Metmask can just connect. For the demo, the user should connect to Goerli Testnet.

## Mission 2 - Fund Your Wallet
The user can now fund their wallet with a credit, a true *onramp*. For the demo, credit card payment is simulated, but the idea is that user pays a fee for the course/game, and upon payment validation, native tokens are sent to the user's wallet on Goerli, Optimisim Goerli, and Mumbai and 25 USDC sent to them on Goerli. (In a future production version, these would be mainnets). A course fee could also part of this, the difference between the payment price and token dispersals (TBD). NOTE: for the demo, tokens will only be dispersed if you know the *secret* CCV value -- please contact me (@mthacks) if you want demo this aspect! If the user does not need to fund their wallet, they can hit Next to skip.

## Mission 3 - Choose Avatar
The user will choose and avatar to ride on their Rocket for the subsequent missions. If the connected wallet holds NFTs on Etheruem and/or Polygon, those will be shown as options to be used for avatars. This is powered by the NFTPort API. If no NFTs are found, some default avatar images are presented. The chosen avatar is then merged with the Rocket image.

## Mission 4 - Mint Rocket NFT
The user will now submit their first transaction, minting a Rocket NFT with the newly merged image. The metadata and image for the NFT is stored on IPFS via the nft.storage API. Both metadata and the image will be updated dynamically as missions are completed. Upon completion, the user can now view the Goerli NFT on OpenSea.

## Mission 5 - Claim an Airdrop of FUEL
The Rocket needs FUEL! Holders of Rocket NFTs are eligble for an airdrop of FUEL tokens. When they claim the airdrop, the Airdropper contract validates that they hold a Rocket, and sends them both FUEL and FUELx tokens (the latter will be used in the next mission). Links enable them to add these new tokens to Metamask.

## Mission 6: Stream tokens to FUEL up
This mission is to fuel up their rocket by using the Superfluid protocol to stream FUELx (a Superfluid-enabled version of FUEL) to their Rocket. (Behind the scenes, the stream is actually going back to the Airdropper contract, refilling it for subsequent users) The user can then (optionally) view their stream on the Superfluid Dashboard. Their Rocket now has a Superfluid sticker, and NFT metadata updated accordingly.

## Mission 7: Travel to L2 Optimism Chain
Powered by the Connext protocol, the user launches their Rocket towards the Optimism Layer2 (Optimism Goerli for the demo). They are then prompted to switch/add the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has a Optimism sticker, and NFT metadata updated accordingly.

## Mission 8: Travel to Polygon Chain
The user now launches their Rocket towards the Polygon (Mumbai for the demo) side-chain. They are then prompted to switch/add the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has a Polygon sticker, and NFT metadata updated accordingly.

## Mission 9: Travel Home
The user now launches their Rocket towards home on Etheruem (Goerli for the demo). They are then prompted to switch to the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has a Ethereum sticker, and NFT metadata updated accordingly.

## Mission 10: Do some DeFi
This mission is do some DeFi using the Aave V3 protocol. Rather than sending them to the Aave dapp, they remain in the onRamp UI and are prompted to Approve and then Supply (deposit) 25 USDC -- which they received in Mission #2 -- and then to borrow 10 DAI against that collateral. After completion, they can (optionally) view their Aave dashboard to see the deposits and loans. Their Rocket now has a Aave sticker, and NFT metadata updated accordingly.

## Mission 11: Contribute to a DAO
Users learn that their FUEL tokens can be used to particpate in the onRamp DAO. They perform 3 steps: delegate FUEL voting rights to themselves, submit a proposal to grant them more FUEL, and then vote on that proposal. After completing, they can optionally view their proposal in the Tally UI (note: Tally can take several minutes to index, and may show a 404 error in the meantime).

## Mission 12: Use an optimistic Oracle
In the final mission, users are asked to perform an off-chain action: to share their onRamp experience publicly on social media. They then learn how an on-chain optimistic oracle (powered by UMA) can be used to validate off-chain actions and data. They submit an assertion to the UMA-powered oracle that they have performed the action. Then ensues a challenge period duing which others can refute their assertion (60 seconds for the demo). If there are no challengers, they can Confirm their assertion and earn a badge of completion with is added to their NFT image and metadata.

![Mission 12 Completed](https://onramp.quest/images/example.png)

# How it Works
onRamp Quest is a decentralizied application that can be found at https://onramp.quest, hosted on Skynet decentralized storage (https://04047muedf04avad7gsjpabrifbstbpdtmg1mb1lto0e3thbo7404og.skynetfree.net/). User can compete all 12 missions without leaving the onRamp dapp UI, and interface with various protocols and contracts via javascript functions and Metamask.

### Contracts
Three contract were written for onRamp Quest, written in Solidity, and deployed using Hardhat:

1. `Rocket.sol` - This is a cross-chain NFT contract that supports bridging to other networks via the Connext protocol, and also through a centralized/trusted bridge custom-built for onRamp. This contract was deployed to 3 chanins: Goerli, Optimism Goerli, and Mumbai and supports bridging among these. When a user *launches* their Rocket towards a new chain, the NFT is burned on the current chain, and then minted at the destination chain, using the same `tokenId` but with evolved metadata and image to reflect the newly completed mission. Bridging via Connext includes options for both authenticated bridging (slow) and non-authenitcated (fast) for demo/testing purposes. Non-Connext bridging is always authenticated via OpenZeppelin `AccessControl` roles. The NFT contract supports updating of the metadata `tokenURI` by trusted addresses. The metadata and image gets updated in the contract when user complete various missions, earning stickers and badges along the way.

2. `Airdropper.sol` - Used in Mission 5, this contract powers simple airdrops of 1 or 2 ERC20 tokens to current holders of a specific NFT collection. The deployed contract drops 86400 `FUEL` and 86400 `FUELx` to holders of onRamp Rockets. While the contract as written is well-suited to the current educational purposes of onRamp, enhancements could make it into a more general purpose contract, including support for multiple NFT collections, 1-n ERC20 tokens, enforcing one drop per tokenId, etc.

3. `Assert.sol` - Used in Mission 12, this is an *optimistic assertion oracle*, powered by the UMA protocol. The contract enables someone to make any assertion that they claim to be true, and submit it on-chain. The assertion is then optimistically assumed to be true unlesses challenged during the challenge period. After the challenge period passes, the user can confirm on chain that the oracle has deemed the assertion to be true. Using the UMA protocol, the `makeAssertion` function calls both `requestPrice` and `proposePrice`on the UMA oracle contract, thus making the assertion and claiming it is true, respectively. One way to look at this is asking a question and then immediately submitting your own answer to that question and waiting to see if anyone disagrees. In Mission 12, the user is asked to share their onRamp experience on social media and then assert to the oracle that they have done so, along with some means for others to verify this. In this way, we are using an optimistic oracle to incentivize off-chain actions.

Five additional contracts were deployed for use as part of onRamp Quest, using the web-based DAO creation tool DAOit (https://daoit.xyz). The relevant contract include a voting-enabled ERC20 token (`FUEL`), a Superfluid-upgraded version of that token (`FUELx`), an OpenZeppelin Governor, and OpenZeppelin Timelock (Treasury). Tokens deployed using these contracts were then sent to the `Airdropper` contract described above, which airdrops them to onRamp users in Mission 5. The tokens are then used in Mission 6 to stream tokens back the the `Airdropper` contract by interacting directly with the Superfluid protocol. Later, in Mission 11, onRamp users interact with these deployed contracts for completing DAO governance actions. **While I am the creator of the DAOit tool, it was used for onRamp as a 3rd-party tool/library and the source code for these contracts is not part of this repo and does NOT form part of the hackathon submission to ETHOnline.**

### Dapp
The onRamp dapp is compromised of HTML, CSS, and Javascript that interacts with contracts mentioned above, as well as other contracts deployed by various protocols from Superfluid, Connext, Aave, and UMA. The dapp primarily uses `ethersJS` and Metamask to interact with these contracts and to switch between Goerli, Optimism Goerli, and Mumbai networks. Rather than send users to Aave and Superfluid dapps, onRamp keeps things simple for users, and interacts directly with those protocols behind the scenes. Users only have to connect their wallet once, to onRamp, and can then mint NFTs, claim aidrops, stream tokens, do multi-chain bridging, supply and borrow tokens, conduct DAO governance, and interact with an oracle ... all from the same dapp interface.

The Dapp uses the **NFTPort** API to retrieve lists of NFTs owned by the connected wallet on Etheruem and/or Polygon. If found, these are displayed to the user in Mission 3 as options for thewir avatar.

The dapp also interfaces with some onRamp server-based APIs for various functions, discussed in more detail below.

## Server Functions
Hosted on Google Firebase, onRamp uses 3 serverless functions.

# Links
App: https://onramp.quest
Twitter: https://twitter.com/onrampquest