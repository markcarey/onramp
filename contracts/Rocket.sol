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

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function mint(address _to, uint256 _amnt) external;
}

contract Rocket is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");
    Counters.Counter public _tokenIdCounter;
    bool _origin;

    IConnextHandler public connext;
    IExecutor public executor;
    address public promiseRouter;
    IERC20 public testToken;
    address public originContract; // the address of the source contract
    uint32 public originDomain; // the origin Domain ID

    event Launched(
        uint256 chainId, 
        address contractAddress, 
        uint256 tokenId, 
        address owner,
        string uri 
    );
    event Landed(
        uint256 chainId, 
        address contractAddress, 
        uint256 tokenId, 
        address owner,
        string uri 
    );
    event BridgeConfirmed(
        bytes32 transferId, 
        bool success, 
        uint32 originDomain, 
        uint32 destinationDomain, 
        uint256 tokenId
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
        address _promiseRouter,
        address _testToken
    ) ERC721("Rocket", "ONRAMP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(METADATA_ROLE, msg.sender);
        if (address(_connext) != address(0)) {
            connext = _connext;
            promiseRouter = _promiseRouter;
            executor = _connext.executor();
            _grantRole(MINTER_ROLE, address(executor));
            testToken = IERC20(_testToken);
            testToken.mint(address(this), 1000 ether);
            testToken.approve(address(connext), 2**256 - 1);
        }
    }

    function setOrigin() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _origin = true;
    }
    function setOriginContract(address _contract) public onlyRole(DEFAULT_ADMIN_ROLE) {
        originContract = _contract;
    }
    function setOriginDomain(uint32 _domain) public onlyRole(DEFAULT_ADMIN_ROLE) {
        originDomain = _domain;
    }

    function mint(address to) public {
        require(_origin == true, "public mint only on origin chain");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function exists(uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function bridgeArrive(address to, uint256 tokenId, string memory uri) public onlyRole(MINTER_ROLE) {
        if (msg.sender == address(executor)) {
            require(
                LibCrossDomainProperty.originSender(msg.data) == originContract &&
                LibCrossDomainProperty.origin(msg.data) == originDomain,
                "Expected origin contract on origin domain"
            );
        }
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit Landed(block.chainid, address(this), tokenId, to, uri);
    }

    // @dev the following function is to speed demos - to be removed befofre production deployment
    function bridgeArriveDemo(address to, uint256 tokenId, string memory uri) public {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit Landed(block.chainid, address(this), tokenId, to, uri);
    }

    function bridgeDepart(
        uint32 fromDomain,
        uint32 destinationDomain,
        address destinationContract,
        uint256 tokenId,
        string calldata uri,
        bool express
    ) external payable {
        require(ownerOf(tokenId) == msg.sender, "not your rocket");
        _burn(tokenId);
        if ( destinationDomain == 1735353714 || destinationDomain == 1735356532 ) {
            bytes4 selector = this.bridgeArrive.selector;
            bool forceSlow = true;
            if (express == true) {
                selector = this.bridgeArriveDemo.selector;
                forceSlow = false;
            }
            bytes memory callData = abi.encodeWithSelector(
                        selector,
                        msg.sender,
                        tokenId,
                        uri
            );
            uint256 amount = 0.1 ether;

            CallParams memory callParams = CallParams({
                to: destinationContract,
                callData: callData,
                originDomain: fromDomain,
                destinationDomain: destinationDomain,
                agent: msg.sender, // address allowed to execute transaction on destination side in addition to relayers
                recovery: msg.sender, // fallback address to send funds to if execution fails on destination side
                forceSlow: forceSlow, // this must be true for authenticated calls
                receiveLocal: false, // option to receive the local bridge-flavored asset instead of the adopted asset
                callback: address(this), // this contract implements the callback
                callbackFee: 0, // fee paid to relayers for the callback; no fees on testnet
                relayerFee: 0, // fee paid to relayers for the forward call; no fees on testnet
                destinationMinOut: (amount / 100) * 97 // the minimum amount that the user will accept due to slippage from the StableSwap pool
            });

            XCallArgs memory xcallArgs = XCallArgs({
                params: callParams,
                transactingAsset: address(testToken), 
                transactingAmount: amount, // tiny amount to workaround zerom value issue
                originMinOut: (amount / 100) * 97 // the minimum amount that the user will accept due to slippage from the StableSwap pool
            });

            connext.xcall(xcallArgs);
        } else {
            // emit event for relayer to process
            emit Launched(uint256(destinationDomain), destinationContract, tokenId, msg.sender, uri);
        }
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) public onlyRole(METADATA_ROLE)
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function callback(
        bytes32 transferId,
        bool success,
        bytes memory data
    ) external onlyPromiseRouter {
        (uint32 fromDomain,
        uint32 destinationDomain,
        uint256 tokenId) = abi.decode(data, (uint32, uint32, uint256));
        emit BridgeConfirmed(transferId, success, fromDomain, destinationDomain, tokenId);
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}