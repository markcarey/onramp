# 🚀 onRamp Quest

onRamp Quest is an education game that sends participants on missions to learn about Ethereum. The goal is to provide an easy on-ramp, combined with a fun way to learn about NFTs, DeFi, DAOs, and more.

The demo project provides a framework for stepping the user through 12 *missions*, evolving a dynamic NFT as they progress. *A production version would include video/text tutorial content for each each mission*. While each mission can be completed without leaving the onRamp interface, user are encouraged to visit related protocol dapps to view the results of their efforts on those sites.

# The Missions

onRamp includes 12 missions spanning wallet creation, NFT minting, airdrop claiming, token streaming, DeFi, DAO governance, and more.

## Mission 1 - Install Metamask
The first mission is to install Metamask and connect. Users that already have Metamask can just connect. For the demo, the user should connect to Goerli Testnet.

## Mission 2 - Fund Your Wallet
The user can now fund their wallet with a credit, a true *onramp*. For the demo, credit card payment is simulated, but the idea is that user pays a fee for the course/game, and upon payment validation, native tokens are sent to the user's wallet on Goerli, Optimism Goerli, and Mumbai and 25 USDC sent to them on Goerli. (In a future production version, these would be mainnets). A course fee could also part of this, the difference between the payment price and token dispersals (TBD). NOTE: for the demo, tokens will only be dispersed if you know the *secret* CCV value -- please contact me (@mthacks) if you want demo this aspect! If the user does not need to fund their wallet, they can hit Next to skip.

## Mission 3 - Choose Avatar
The user will choose an avatar to ride on their Rocket for the subsequent missions. If the connected wallet holds NFTs on Ethereum and/or Polygon, those will be shown as options to be used for avatars. This is powered by the NFTPort API. If no NFTs are found, some default avatar images are presented. The chosen avatar is then merged with the Rocket image.

## Mission 4 - Mint Rocket NFT
The user will now submit their first transaction, minting a Rocket NFT with the newly merged image. The metadata and image for the NFT is stored on IPFS via the nft.storage API. Both metadata and the image will be updated dynamically as missions are completed. Upon completion, the user can now view the Goerli NFT on OpenSea.

## Mission 5 - Claim an Airdrop of FUEL
The Rocket needs FUEL! Holders of Rocket NFTs are eligible for an airdrop of FUEL tokens. When they claim the airdrop, the Airdropper contract validates that they hold a Rocket, and sends them both FUEL and FUELx tokens (the latter will be used in the next mission). Links enable them to add these new tokens to Metamask.

## Mission 6: Stream tokens to FUEL up
This mission is to fuel up their rocket by using the Superfluid protocol to stream FUELx (a Superfluid-enabled version of FUEL) to their Rocket. (Behind the scenes, the stream is actually going back to the Airdropper contract, refilling it for subsequent users) The user can then (optionally) view their stream on the Superfluid Dashboard. Their Rocket now has a Superfluid sticker, and NFT metadata is updated accordingly.

## Mission 7: Travel to L2 Optimism Chain
Powered by the Connext protocol, the user launches their Rocket towards the Optimism Layer2 (Optimism Goerli for the demo). They are then prompted to switch/add the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has an Optimism sticker, and NFT metadata is updated accordingly.

## Mission 8: Travel to Polygon Chain
The user now launches their Rocket towards the Polygon (Mumbai for the demo) side-chain. They are then prompted to switch/add the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has a Polygon sticker, and NFT metadata is updated accordingly.

## Mission 9: Travel Home
The user now launches their Rocket towards home on Ethereum (Goerli for the demo). They are then prompted to switch to the destination network via Metamask. When the Rocket has landed on the new chain, they can view it on Opensea. Their Rocket now has a Ethereum sticker, and NFT metadata is updated accordingly.

## Mission 10: Do some DeFi
This mission is do some DeFi using the Aave V3 protocol. Rather than sending them to the Aave dapp, they remain in the onRamp UI and are prompted to Approve and then Supply (deposit) 25 USDC -- which they received in Mission #2 -- and then to borrow 10 DAI against that collateral. After completion, they can (optionally) view their Aave dashboard to see the deposits and loans. Their Rocket now has a Aave sticker, and NFT metadata is updated accordingly.

## Mission 11: Contribute to a DAO
Users learn that their FUEL tokens can be used to participate in the onRamp DAO. They perform 3 steps: delegate FUEL voting rights to themselves, submit a proposal to grant them more FUEL, and then vote on that proposal. After completing, they can optionally view their proposal in the Tally UI (note: Tally can take several minutes to index, and may show a 404 error in the meantime).

## Mission 12: Use an optimistic Oracle
In the final mission, users are asked to perform an off-chain action: to share their onRamp experience publicly on social media. They then learn how an on-chain optimistic oracle (powered by UMA) can be used to validate off-chain actions and data. They submit an assertion to the UMA-powered oracle that they have performed the action. Then ensues a challenge period during which others can refute their assertion (60 seconds for the demo). If there are no challengers, they can Confirm their assertion and earn a badge of completion with is added to their NFT image and metadata.

![Mission 12 Completed](https://onramp.quest/images/example.png)

# How it Works
onRamp Quest is a decentralizied application that can be found at https://onramp.quest, hosted on Skynet decentralized storage (https://04047muedf04avad7gsjpabrifbstbpdtmg1mb1lto0e3thbo7404og.skynetfree.net/). User can compete all 12 missions without leaving the onRamp dapp UI, and interface with various protocols and contracts via javascript functions and Metamask.

### Contracts
Three contract were written for onRamp Quest, written in Solidity, and deployed using Hardhat:

1. `Rocket.sol` - This is a cross-chain NFT contract that supports bridging to other networks via the Connext protocol, and also through a centralized/trusted bridge custom-built for onRamp. This contract was deployed to 3 chains: Goerli, Optimism Goerli, and Mumbai and supports bridging among these. When a user *launches* their Rocket towards a new chain by calling the `bridgeDepart` function, the NFT is burned on the current chain, and will then minted at the destination chain, using the same `tokenId` but with evolved metadata and image to reflect the newly completed mission. Bridging via Connext includes options for both authenticated bridging (slow) and non-authenticated (fast) for demo/testing purposes. Non-Connext bridging is always authenticated via OpenZeppelin `AccessControl` roles. The NFT contract supports updating of the metadata `tokenURI` by trusted addresses. The metadata and image gets updated in the contract when user complete various missions, earning stickers and badges along the way.

2. `Airdropper.sol` - Used in Mission 5, this contract powers simple airdrops of 1 or 2 ERC20 tokens to current holders of a specific NFT collection. The deployed contract drops 86400 `FUEL` and 86400 `FUELx` to holders of onRamp Rockets. While the contract as written is well-suited to the current educational purposes of onRamp, enhancements could make it into a more general purpose contract, including support for multiple NFT collections, 1-n ERC20 tokens, enforcing one drop per tokenId, etc.

3. `Assert.sol` - Used in Mission 12, this is an *optimistic assertion oracle*, powered by the UMA protocol. The contract enables someone to make any assertion that they claim to be true, and submit it on-chain. The assertion is then optimistically assumed to be true unless challenged during the challenge period. After the challenge period passes, the user can confirm on chain that the oracle has deemed the assertion to be true. Using the UMA protocol, the `makeAssertion` function calls both `requestPrice` and `proposePrice`on the UMA oracle contract, thus making the assertion and claiming it is true, respectively. One way to look at this is asking a question and then immediately submitting your own answer to that question and waiting to see if anyone disagrees. In Mission 12, the user is asked to share their onRamp experience on social media and then assert to the oracle that they have done so, along with some means for others to verify this. In this way, we are using an optimistic oracle to incentivize off-chain actions.

Five additional contracts were deployed for use as part of onRamp Quest, using the web-based DAO creation tool DAOit (https://daoit.xyz). The relevant contracts include a voting-enabled ERC20 token (`FUEL`), a Superfluid-upgraded version of that token (`FUELx`), an OpenZeppelin Governor, and OpenZeppelin Timelock (Treasury). Tokens deployed using these contracts were then sent to the `Airdropper` contract described above, which airdrops them to onRamp users in Mission 5. The tokens are then used in Mission 6 to stream tokens back the the `Airdropper` contract by interacting directly with the Superfluid protocol. Later, in Mission 11, onRamp users interact with these deployed contracts for completing DAO governance actions. *While I am the creator of the DAOit tool, it was used for onRamp as a 3rd-party tool/library and the source code for these contracts is not part of this repo and does NOT form part of the hackathon submission to ETHOnline2022.*

### Dapp
The onRamp dapp is comprised of HTML, CSS, and Javascript that interacts with contracts mentioned above, as well as other contracts deployed by protocols from Superfluid and Aave. The dapp primarily uses `ethersJS` and Metamask to interact with these contracts and to switch between Goerli, Optimism Goerli, and Mumbai networks. Rather than send users to Aave and Superfluid dapps, onRamp keeps things simple for users, and interacts directly with those protocols behind the scenes. Users only have to connect their wallet once, to onRamp, and can then mint NFTs, claim airdrops, stream tokens, do multi-chain bridging, supply and borrow tokens, conduct DAO governance, and interact with an oracle ... all from the same dapp interface.

The Dapp uses the **NFTPort** API to retrieve lists of NFTs owned by the connected wallet on Ethereum and/or Polygon. If found, these are displayed to the user in Mission 3 as options for their avatar. (Note that the API is used directlym rather than an SDK)

Rocket NFT Metadata JSON and images, which change as users complete missions, are stored on IPFS using the `nft.storage` HTTP API. (*Note that the SDK is not used, but rather the HTTP API is called directly*).

The dapp also interfaces with some onRamp server-based APIs for various functions, discussed in more detail below.

The HTML and CSS for the Dapp were modified from the ![Colorlib Wizard 18](https://colorlib.com/wp/template/colorlib-wizard-18/) template set, used in accordance with a *CC by 3.0* Creative Commons license.

## Server Functions
Hosted on Google Firebase, onRamp uses 3 serverless functions.

1. `updateMeta` - this API function will update the metadata `tokenURI` on the Rocket NFT contract to reflect mission progress, increasing their "level" and updating the image to include mission-specific stickers and badges. The API supports these updates against each of the 3 Rocket contracts deployed to Goerli, Optimism Goerli, and Mumbai. The `setTokenURI` function of the `Rocket.sol` requires the sender to have the `METADATA_ROLE`. Since users do not have this role and are not entitled to update their own metadata, this is performed on the server-side by a bot (address) that is trusted and has been given this role. After updating the metadata on the NFT contract, this function will also call the OpenSea API to encourage OpenSea to refresh the metadata for the NFT.

2. `payment` - for the demo, this API function doesn't actually handle payment but rather simulates the receipt and validation of a credit card payment that is intended to fund the user's wallet and potentially collect fees. The concept here is that you pay a fee for a "course" or "game", and one of the benefits you receive in return is a certain amount of native (gas) tokens on Goerli, Optimism Goerli, and Mumbai, plus 25 USDC on Goerli to get them started with DeFi. For the purposes of the demo, only the CCV field is submitted to this API endpoint, along with the address of the connected wallet. And even then, it will ONLY disperse tokens if the user submits the *secret* CCV value (because I don't have an unlimited number of gas tokens to disperse!). if you really want to test this aspect -- and especially if you are a hackathon judge -- send me a message (@mthacks) and I will share the secret code. When the secret code is supplied, it sends 0.2 ETH on Goerli, 0.2 KOR on Optimisim Goerli, 0.2 MATIC on Mumbai, and 25 (test)USDC on Goerli. Future enhancements to this function might include adding the user to an allow-list for minting Rocket NFTs.

3. `cron` - Running every few minutes, this function acts as a trusted bridge relayer for onRamp Rocket contracts on multiple chains: Goerli, Optimism Goerli, and Mumbai. It checks the event logs for `Launched` events from the Rocket NFTs contracts on each chain, and when found, it takes values from the event and uses them to mint the token at the destination chain/contract, calling the `bridgeArrive` function on the `Rocket.sol` contract. Only addresses with the `MINTER_ROLE` role can call this function, and the server-based trusted bot has this role.

# Next Steps
- source text and/or video-based tutorial content for the topics covered in each mission
- research and test credit-card based payment (including any legal considerations in various jurisdictions)
- add enforcement/validation checks in multiple places to ensure missions are being completed before earning leveling-up
- ponder the question: is this a business or a public good? 🤔

# Links
App: https://onramp.quest
Twitter: https://twitter.com/onrampquest