const zeroAddress = "0x0000000000000000000000000000000000000000";

var addr = {};

var rpcURLs = {};
rpcURLs.goerli = "eth-goerli.alchemyapi.io/v2/n_mDCfTpJ8I959arPP7PwiOptjubLm57";
rpcURLs.mumbai = "polygon-mumbai.g.alchemy.com/v2/Ptsa6JdQQUtTbRGM1Elvw_ed3cTszLoj";
rpcURLs.optigoerli = "opt-goerli.g.alchemy.com/v2/jb4AhFhyR0X_ChVX5J1f0oWQ6GvJqLK0";

const nftPortAPI = "https://api.nftport.xyz/v0/accounts/";
const onrampAPI = "https://us-central1-slash-translate.cloudfunctions.net/onrampUpdateMeta";

var chain = "goerli";
//var chain = "optigoerli";
var web3, rocket, dropper;
var accounts = [];
var provider, ethersSigner, aave, usdc, dai;
var avatars = [];
var noNFTAvatars = [
    "https://onramp.quest/images/avatars/glasses.png",
    "https://onramp.quest/images/avatars/crazy.png",
    "https://onramp.quest/images/avatars/eyeroll.png"
];
var tokenId;

var rocketAddresses = {
    "1735356532": "0xC2Bd00E6Ba411efd034dcD5Fd8DF6377feFaE702",
    "420": "0xC2Bd00E6Ba411efd034dcD5Fd8DF6377feFaE702",
    "1735353714": "0x42a47396CEb4D61f59c2BA60D5549bb313751B91",
    "5": "0x42a47396CEb4D61f59c2BA60D5549bb313751B91",
    "80001": "0xC2Bd00E6Ba411efd034dcD5Fd8DF6377feFaE702"
};

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

function setupChain() {
    var rpcURL = rpcURLs[chain];
    if (chain == "goerli") {
        addr.WETH = "";
        addr.rocket = "0x42a47396CEb4D61f59c2BA60D5549bb313751B91";
        addr.FUEL = "0xD75bA886DC86c37FBFf26415AE41246873B8b9bc";
        addr.FUELx = "0xE3B89a65eDF515b76690348c26CA5fC5e01AFace";
        addr.connext = "0xD9e8b18Db316d7736A3d0386C59CA3332810df3B";
        addr.router = "0x570faC55A96bDEA6DE85632e4b2c7Fde4efFAD55";
        addr.airdrop = "0xd4C332759c151a6c115931B6Dd7134fE064A06AE";
        addr.test = "0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1";
        addr.SuperHost = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9";
        addr.cfa = "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8";
        addr.pool = "0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6";
        addr.USDC = "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43"; // Aave Test USDC
        addr.aUSDC = "0x1Ee669290939f8a8864497Af3BC83728715265FF"; // Aave Supply USDC
        addr.DAI = "0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464"; // Aave Test DAI
        addr.aDAI = "0x310839bE20Fc6a8A89f33A59C7D5fC651365068f"; // Aave Supply DAI
        addr.dDAI = "0xEa5A7CB3BDF6b2A8541bd50aFF270453F1505A72"; // Aave Debt DAI
    }
    if (chain == "mumbai") {
        addr.WETH = "";
        addr.rocket = "0xC2Bd00E6Ba411efd034dcD5Fd8DF6377feFaE702";
        // TODO: aave addresses
        addr.connext = zeroAddress;
        addr.router = zeroAddress;
        addr.test = zeroAddress;
    }
    if (chain == "optigoerli") {
        addr.WETH = "";
        addr.rocket = "0xC2Bd00E6Ba411efd034dcD5Fd8DF6377feFaE702";
        addr.connext = "0xA04f29c24CCf3AF30D4164F608A56Dc495B2c976";
        addr.router = "0xF0Efb28f638A5262DdA8E8C4556eac4F0B749A22";
        addr.test = "0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF";
    }
    const prov = {"url": "https://"+rpcURL};
    provider = new ethers.providers.JsonRpcProvider(prov);
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    var wssProvider = new ethers.providers.WebSocketProvider(
        "wss://" + rpcURL
    );
    rocket = new ethers.Contract(
        addr.rocket,
        rocketABI,
        wssProvider
    );
    if (chain == "goerli") {
        dropper = new ethers.Contract(
            addr.airdrop,
            airdropABI,
            wssProvider
        );
        aave = new ethers.Contract(
            addr.pool,
            poolABI,
            wssProvider
        );
        usdc = new ethers.Contract(
            addr.USDC,
            tokenABI,
            wssProvider
        );
        dai = new ethers.Contract(
            addr.DAI,
            tokenABI,
            wssProvider
        );
    }
    web3 = AlchemyWeb3.createAlchemyWeb3("wss://"+rpcURL);
}
setupChain();

provider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
        console.log(newNetwork, oldNetwork);
        //setupChain();
    }
});

const tokens = {};
tokens.FUEL = {
    "address": addr.FUEL,
    "symbol": "FUEL",
    "decimals": 18,
    "image": "https://onramp.quest/images/FUEL.png"
}
tokens.FUELx = {
    "address": addr.FUELx,
    "symbol": "FUELx",
    "decimals": 18,
    "image": "https://onramp.quest/images/FUELx.png"
}

async function addToken(symbol) {
    var token = tokens[symbol];
    console.log(token);
    const tokenAddress = token.address;
    const tokenSymbol = token.symbol;
    const tokenDecimals = token.decimals;
    var tokenImage = token.image;
    //console.log("tokenImage", tokenImage);

    try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                    address: tokenAddress, // The address that the token is at.
                    symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                    decimals: tokenDecimals, // The number of decimals in the token
                    image: tokenImage, // A string url of the token logo
                },
            },
        });

        if (wasAdded) {
            console.log('Thanks for your interest!');
        } else {
            console.log('Your loss!');
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

async function getAvatars(nftChain, continuation) {
    const response = await fetch(nftPortAPI + accounts[0] + `?chain=${nftChain}&page_size=50&continuation=${continuation}&include=default&exclude=erc1155`, { 
        method: 'get', 
        headers: new Headers({
            'Authorization': '5ba19522-1beb-4733-af95-49879ac408cc', 
            'Content-Type': 'application/json'
        })
    });
    var result = await response.json();
    console.log( result );
    if (result.response == 'OK') {
        if ("continuation" in result) {
            continuation = result.continuation;
        } else {
            continuation = "";
        }
        for (let i = 0; i < result.nfts.length; i++) {
            var nft = result.nfts[i];
            var add = false;
            if ("file_url" in nft) {
                if (nft.file_url) {
                    add = true;
                }
            }
            if (add) {
                var img = nft.file_url;
                if ( img.startsWith('ipfs://') ) {
                    img = ipfsToHttp(nft.file_url);
                }
                avatars.push(img);
            }
        }
        if (continuation) {
            await getAvatars(nftChain, continuation);
        }
        return 1;
    }
}



async function getNFTImage(url, level) {
    var background, foreground;
    if ( level == 1) {
        foreground = { src: `images/levels/${level}.png`, x: 0, y: 0 };
        var w = 173;
        var h = 173;
        var nftURL = url;
        //nftURL = 'https://img.seadn.io/files/a4a26c85eee22e24551483b21d53f092.png?fit=max&w=160';
        const nft = new Image(100, 100);
        nft.crossOrigin = 'Anonymous';
        nft.src = 'https://api.codetabs.com/v1/proxy/?quest=' + nftURL;
        await nft.decode();

        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.height = h;
        canvas.width = w;
        ctx.drawImage(nft, 0, 0, w, h);
        var uri = canvas.toDataURL('image/jpg'),
            base64 = uri.replace(/^data:image\/jpg;base64,/, "");
        background = { src: uri, x: 295, y: 44 };
    } else {
        background = url;
        foreground = `images/levels/${level}.png`;
    }

    return mergeImages(
        [
            background,
            foreground
        ],
        {
            crossOrigin: "Anonymous"
        }
        )
    .then(async function(b64) {
        //document.querySelector('img').src = b64; 
        const fetchImage = await fetch(b64);
        //console.log(fetchImage);
        const blob = await fetchImage.blob();
        //console.log(blob);
        const file = new File([blob], "mergedrocket.png", { type: "image/png" });
        //console.log(file);
        const response = await fetch('https://api.nft.storage/upload', { 
            method: 'post', 
            headers: new Headers({
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU0NkZiYmNhOEIzZDIwMDAzZTA2ZjMzZmRBN0E0NzUxMGExRUY5OTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODYxMDE4NzkwNiwibmFtZSI6InNwcm91dCBpbWFnZXMifQ.Y1lFAHCaStzfxyRB72iyWIyuPuU-7EoYgNcLwiBHu-8', 
                'Content-Type': 'application/json'
            }), 
            body: file
        });
        var result = await response.json();
        //console.log( result );
        if (result.ok) {
            //var metaImage = "https://" + result.value.cid + ".ipfs.dweb.link/";
            var metaImage = ipfsToHttp(result.value.cid);
            return metaImage;
        }
    });
}

async function merge() {
    var ipfsUrl = await getNFTImage("https://api.degendogs.club/images/0.png", 1);
    console.log(ipfsUrl);
    document.querySelector('img').src = ipfsUrl;
}

async function connect(){
    if (window.ethereum) {
        //console.log("window.ethereum true");
        await provider.send("eth_requestAccounts", []);
        ethersSigner = provider.getSigner();
        accounts[0] = await ethersSigner.getAddress();
        //console.log("Account:", await ethersSigner.getAddress()); 
        console.log(accounts);
        $("#connect").hide();
        $("fieldset.current").find("p").text("Mission completed. Hit Next to continue.");
        await getAvatars("ethereum", "");
        await getAvatars("polygon", "");
        console.log(avatars);
        displayAvatars();
    } else {
        // The user doesn't have Metamask installed.
        console.log("window.ethereum false");
    } 
}

async function displayAvatars() {
    if ( avatars.length == 0 ) {
        avatars = noNFTAvatars;
    }
    for (let i = avatars.length; i > (avatars.length - 12); i--) {
        $("#avatars").append(`<li><a href="#"><img src="${avatars[i]}" /></a></li>`);
    }
    $("#avatars li a img").bind("error", function(){
            $(this).remove();
    });
    $("#avatars li a").click(async function(){
        var $chosen = $(this);
        var url = $(this).find("img").attr("src");
        console.log("chosen avatar: " + url);
        $("#avatars li a").not($chosen).each(function(){
            $(this).parent().remove();
        });
        var rocketURL = await getNFTImage(url, 1);
        console.log(rocketURL);
        $(".rocket").attr("src", rocketURL);
    });
}

async function updateMetadata(tokenId, nftImage, level, chain) {
    var metaJSON = {
        "name": "onRamp Rocket #" + tokenId,
        "description": "Complete onRamp missions to evolve your rocket at https://onramp.quest",
        "external_url": "https://onramp.quest", 
        "image": nftImage,
        "seller_fee_basis_points": 500,
        "fee_recipient": accounts[0],
        "attributes": [
            {
                "trait_type": "Level", 
                "value": level,
                "max_value": 12
            }, 
        ] 
    };
    const blob = new Blob([JSON.stringify(metaJSON)], { type: 'application/json' });
    const file = new File([ blob ], 'metadata.json');
    const res = await fetch('https://api.nft.storage/upload', { 
        method: 'post', 
        headers: new Headers({
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU0NkZiYmNhOEIzZDIwMDAzZTA2ZjMzZmRBN0E0NzUxMGExRUY5OTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODYxMDE3NzQxNSwibmFtZSI6InNwcm91dCBtZXRhZGF0YSJ9.6YwPqstbUyRfNiGwEaYccfGZZYGmXOSuAuLzLduwdRM', 
            'Content-Type': 'application/json'
        }), 
        body: file
    });
    result = await res.json();
    console.log( result );
    if (result.ok) {
        var tokenURI = ipfsToHttp(result.value.cid);
        if (chain == null) {
            return tokenURI;
        } else {
            tokenURI = encodeURIComponent(tokenURI);
            const response = await fetch(onrampAPI + `?chain=${chain}&id=${tokenId}&uri=${tokenURI}`);
            var result = await response.json();
            console.log(result);
        }
    }
}

async function mint() {
    var tx = await rocket.connect(ethersSigner).selfMint(accounts[0]);
    console.log(tx);
    let mintFilter = rocket.filters.Transfer(zeroAddress, accounts[0]);
    rocket.once(mintFilter, async (from, to, id, event) => { 
        tokenId = id;
        console.log('tokenId:' + tokenId);
        var nftImage = $("img.rocket").attr("src");
        var metaJSON = {
            "name": "onRamp Rocket #" + tokenId,
            "description": "Complete onRamp missions to evolve your rocket at https://onramp.quest",
            "external_url": "https://onramp.quest", 
            "image": nftImage,
            "seller_fee_basis_points": 500,
            "fee_recipient": accounts[0],
            "attributes": [
                {
                    "trait_type": "Level", 
                    "value": 4,
                    "max_value": 12
                }, 
            ] 
        };
        const blob = new Blob([JSON.stringify(metaJSON)], { type: 'application/json' });
        const file = new File([ blob ], 'metadata.json');
        const res = await fetch('https://api.nft.storage/upload', { 
            method: 'post', 
            headers: new Headers({
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU0NkZiYmNhOEIzZDIwMDAzZTA2ZjMzZmRBN0E0NzUxMGExRUY5OTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODYxMDE3NzQxNSwibmFtZSI6InNwcm91dCBtZXRhZGF0YSJ9.6YwPqstbUyRfNiGwEaYccfGZZYGmXOSuAuLzLduwdRM', 
                'Content-Type': 'application/json'
            }), 
            body: file
        });
        result = await res.json();
        console.log( result );
        if (result.ok) {
            var tokenURI = ipfsToHttp(result.value.cid);
            tokenURI = encodeURIComponent(tokenURI);
            const response = await fetch(onrampAPI + `?chain=0&id=${tokenId}&uri=${tokenURI}`);
            var result = await response.json();
            console.log(result);
            $("fieldset.current").find("div.actions").remove();
            $("fieldset.current").find("p").html(`Mission completed. Your Rocket NFT has been minted. <a target="_blank" href="https://testnets.opensea.io/assets/goerli/${addr.rocket}/${tokenId}">View it on OpenSea</a>. Click Next to continue.`);
        }
    });
    await tx.wait();
}

async function airdrop() {
    var tx = await dropper.connect(ethersSigner).claim();
    console.log(tx);
    let claimedFilter = dropper.filters.Claimed(accounts[0]);
    dropper.once(claimedFilter, async (to, amount, event) => { 
        console.log('amount:' + amount);
        $("fieldset.current").find("div.actions").remove();
        $("fieldset.current").find("p").html(`Mission completed. You have claimed <a href="#" class="add-token" title="Add FUEL to Metamask" data-symbol="FUEL">FUEL</a> and <a href="#"  title="Add FUELx to Metamask" class="add-token" data-symbol="FUELx">FUELx</a> tokens. Click Next to continue.`);
    });
    await tx.wait();
}

async function stream() {
    var BN = web3.utils.BN;
    var gas = web3.utils.toHex(new BN('2000000000')); // 2 Gwei;
    const cfa = new web3.eth.Contract(cfaABI, addr.cfa);
    const host = new web3.eth.Contract(hostABI, addr.SuperHost);
    const nonce = await web3.eth.getTransactionCount(accounts[0], 'latest');
    const flowRate = "1000000000000000000"; // 1 FUELx
    const cfaPacked = cfa.methods.createFlow(addr.FUELx, addr.airdrop, flowRate, "0x").encodeABI();
    const tx = {
        'from': accounts[0],
        'to': addr.SuperHost,
        'gasPrice': gas,
        'nonce': "" + nonce,
        'data': host.methods.callAgreement(addr.cfa, cfaPacked, "0x").encodeABI()
    };
    console.log(tx);
    const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
    });
    //console.log(txHash);
    let transactionReceipt = null
    while (transactionReceipt == null) { 
        transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
        await sleep(500)
    }
    // update metadata with SF sticker
    var imageURL = await getNFTImage( $(".rocket").attr("src"), "superfluid");
    $(".rocket").attr("src", imageURL);
    await updateMetadata(tokenId, imageURL, 6, 0);
    $("fieldset.current").find("div.actions").remove();
    $("fieldset.current").find("p").html(`Mission completed. FUEL is now streaming in real-time to your Rocket. Click Next to continue.`);
}

async function launch(source, destination, level, sticker) {
    var nftImage = await getNFTImage( $(".rocket").attr("src"), sticker);
    var uri = await updateMetadata(tokenId, nftImage, level, null);
    var tx = await rocket.connect(ethersSigner).bridgeDepart(source, destination, rocketAddresses[destination], tokenId, uri, true);
    console.log(tx);
    let launchFilter = rocket.filters.Transfer(accounts[0], zeroAddress);
    return rocket.once(launchFilter, async (from, to, id, event) => { 
        // launched!
        $(".rocket").attr("src", nftImage);
        return;
    });
}

async function switchChain(chainId) {
    await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(chainId) }],
    });
    if (chainId == 80001) {
        chain = "mumbai";
    }
    if (chainId == 420) {
        chain = "optigoerli";
    }
    if (chainId == 5) {
        chain = "goerli";
    }
    setupChain();
    $("fieldset.current").find("div.actions").remove();
    $("fieldset.current").find("p").html(`Waiting for your Rocket to land. Please stand by...`);
    let landedFilter = rocket.filters.Landed();
    rocket.on(landedFilter, async ( eventChainId, contractAddress, id, owner, uri, event) => { 
        console.log("Landed event", tokenId, id, event);
        if ( (parseInt(tokenId) == parseInt(id)) && (parseInt(eventChainId) == parseInt(chainId)) ) {
            $("fieldset.current").find("p").html(`Mission completed. Your Rocket has landed. Click Next to continue.`);
            rocket.removeAllListeners();
        }
    });
}

async function approve() {
    var amount = "25000000"; // 25 USD (6 decimals for USDC)
    var tx = await usdc.connect(ethersSigner).approve(addr.pool, amount);
    console.log(tx);
    let approvalFilter = usdc.filters.Approval(accounts[0], addr.pool);
    usdc.on(approvalFilter, async (from, to, id, event) => { 
        $("fieldset.current").find("p").html(`Approved!. Now Deposit your USDC.`);
        $("fieldset.current").find("div.actions").find("a#approve").addClass("later").text("Approve");
        $("fieldset.current").find("div.actions").find("a#supply").removeClass("later");
    });
    await tx.wait();
}

async function supply() {
    var amount = "25000000"; // 25 USD (6 decimals for USDC)
    var tx = await aave.connect(ethersSigner).supply(addr.USDC, amount, accounts[0], 0);
    console.log(tx);
    let supplyFilter = aave.filters.Supply(addr.USDC, null, accounts[0]);
    aave.on(supplyFilter, async (reserve, user, onBehalfOf, amount, referralCode, event) => { 
        $("fieldset.current").find("p").html(`Supplied!. BONUS: Now <em>borrow</em> 10 DAI stablecoin.`);
        $("fieldset.current").find("div.actions").find("a#approve").parent().remove();
        $("fieldset.current").find("div.actions").find("a#supply").parent().remove();
        $("fieldset.current").find("div.actions").find("a#borrow").parent().show();
    });
    await tx.wait();
}

async function borrow() {
    var amount = "10000000000000000001"; // 10 DAI (18 decimals for DAI)
    var tx = await aave.connect(ethersSigner).borrow(addr.DAI, amount, 2, 0, accounts[0], { gasLimit: 350000 });
    console.log(tx);
    let borrowFilter = aave.filters.Borrow(addr.DAI, null, accounts[0]);
    aave.on(borrowFilter, async (reserve, user, onBehalfOf, amount, interestRateMode, borrowRate, referralCode, event) => { 
        // update metadata with Aave sticker
        var imageURL = await getNFTImage( $(".rocket").attr("src"), "aave");
        $(".rocket").attr("src", imageURL);
        await updateMetadata(tokenId, imageURL, 10, 0);
        $("fieldset.current").find("p").html(`Borrowed!. Notice how you didn't hav to apply for the loan? Click Next to continue.`);
        $("fieldset.current").find("div.actions").remove();
    });
    await tx.wait();
}

function ipfsToHttp(ipfs) {
    var http = "";
    var cid = ipfs.replace("ipfs://", "");
    //http = "https://" + cid + ".ipfs.dweb.link";
    //http = "https://ipfs.io/ipfs/" + cid;
    http = "https://nftstorage.link/ipfs/" + cid;
    return http;
  }

$( document ).ready(function() {

    $("#connect").click(function(){
        connect();
        return false;
    });

    $("#mint").click(function(){
        $(this).text("Minting...");
        mint();
        return false;
    });

    $("#airdrop").click(function(){
        $(this).text("Claiming...");
        airdrop();
        return false;
    });

    $("p").on("click", ".add-token", async function() {
        const symbol = $(this).data("symbol");
        addToken(symbol);
        return false;
    });

    $("#stream").click(function(){
        $(this).text("Fueling...");
        stream();
        return false;
    });

    $(".launch").click(async function(){
        $(this).text("Launching...");
        var level = $(this).data("level");
        var sticker = $(this).data("sticker");
        var source = $(this).data("source");
        var destination = $(this).data("destination");
        await launch(source, destination, level, sticker);
        // TODO: update message
        console.log("launched");
        $("fieldset.current").find("div.actions").find("a.launch").parent().remove();
        $("fieldset.current").find("div.actions").find("a.switch").parent().show();
        $("fieldset.current").find("p").html(`Mission completed. Your Rocket is now enroute to Optimisim. Time to switch networks.`);
        return false;
    });

    $(".switch").click(async function(){
        var chainId = $(this).data("chain");
        await switchChain(chainId);
        return false;
    });

    $("#approve").click(async function(){
        $(this).text("Approving...");
        await approve();
    });

    $("#supply").click(async function(){
        $(this).text("Depositing...");
        await supply();
    });

    $("#borrow").click(async function(){
        $(this).text("Borrowing...");
        await borrow();
    });


});