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


# Links
App: https://onramp.quest
Twitter: https://twitter.com/onrampquest