// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import {IConnextHandler} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnextHandler.sol";
import {CallParams, XCallArgs} from "@connext/nxtp-contracts/contracts/core/connext/libraries/LibConnextStorage.sol";
import {ICallback} from "@connext/nxtp-contracts/contracts/core/promise/interfaces/ICallback.sol";
import {IExecutor} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IExecutor.sol";
import {LibCrossDomainProperty} from "@connext/nxtp-contracts/contracts/core/connext/libraries/LibCrossDomainProperty.sol";

contract Rocket is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");
    Counters.Counter public _tokenIdCounter;
    bool _origin;

    IConnextHandler public connext;
    IExecutor public executor;
    address public promiseRouter;

    event BridgeStarted(
        uint256 chainId, 
        address contractAddress, 
        uint256 tokenId, 
        address owner,
        string uri 
    );

    modifier onlyPromiseRouter () {
        require(
            msg.sender == address(promiseRouter),
            "Expected PromiseRouter"
        );
        _;
    }

    constructor(
        IConnextHandler _connext, 
        address _promiseRouter
    ) ERC721("Rocket", "ONRAMP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(METADATA_ROLE, msg.sender);
        if (address(_connext) != address(0)) {
            connext = _connext;
            promiseRouter = _promiseRouter;
            executor = _connext.executor();
            _grantRole(MINTER_ROLE, address(executor));
        }
    }

    function setOrigin() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _origin = true;
    }

    function selfMint(address to) public {
        require(_origin == true, "public mint only on origin chain");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function bridgeArrive(address to, uint256 tokenId, string memory uri) public onlyRole(MINTER_ROLE) {
        if (msg.sender == address(executor)) {
            // TODO: additional security checks for orig domain + contract
        }
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function bridgeDepart(
        uint32 originDomain,
        uint32 destinationDomain,
        address destinationContract,
        uint256 tokenId,
        string calldata uri
    ) external payable {
        require(ownerOf(tokenId) == msg.sender, "not your rocket");
        _burn(tokenId);
        if ( destinationDomain == 1735353714 || destinationDomain == 1735356532 ) {
            bytes4 selector = bytes4(keccak256("bridgeArrive(address,uint256,string)"));
            bytes memory callData = abi.encodeWithSelector(
                        this.bridgeArrive.selector,
                        address(this),
                        tokenId,
                        uri
            );

            CallParams memory callParams = CallParams({
                to: destinationContract,
                callData: callData,
                originDomain: originDomain,
                destinationDomain: destinationDomain,
                agent: msg.sender, // address allowed to execute transaction on destination side in addition to relayers
                recovery: msg.sender, // fallback address to send funds to if execution fails on destination side
                forceSlow: true, // this must be true for authenticated calls
                receiveLocal: false, // option to receive the local bridge-flavored asset instead of the adopted asset
                callback: address(this), // this contract implements the callback
                callbackFee: 0, // fee paid to relayers for the callback; no fees on testnet
                relayerFee: 0, // fee paid to relayers for the forward call; no fees on testnet
                destinationMinOut: 0 // not sending funds so minimum can be 0
            });

            XCallArgs memory xcallArgs = XCallArgs({
                params: callParams,
                transactingAsset: address(0), // 0 address is the native gas token
                transactingAmount: 0, // not sending funds with this calldata-only xcall
                originMinOut: 0 // not sending funds so minimum can be 0
            });

            connext.xcall(xcallArgs);
        } else {
            // emit event for relayer to process
            emit BridgeStarted(uint256(destinationDomain), destinationContract, tokenId, msg.sender, uri);
        }
    }

    event BridgeConfirmed(bytes32 transferId, bool success, uint32 originDomain, uint32 destinationDomain, uint256 tokenId);

    function callback(
        bytes32 transferId,
        bool success,
        bytes memory data
    ) external onlyPromiseRouter {
        (uint32 originDomain,
        uint32 destinationDomain,
        uint256 tokenId) = abi.decode(data, (uint32, uint32, uint256));
        emit BridgeConfirmed(transferId, success, originDomain, destinationDomain, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) public onlyRole(METADATA_ROLE)
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}