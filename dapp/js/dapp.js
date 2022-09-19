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
var rocket;
var accounts = [];
var provider, ethersSigner;
var avatars = [];
var noNFTAvatars = [];

function setupChain() {
    var rpcURL = rpcURLs[chain];
    if (chain == "goerli") {
        addr.WETH = "";
        addr.rocket = "0x42a47396CEb4D61f59c2BA60D5549bb313751B91";
        addr.FUEL = "";
        addr.FUELx = "";
        addr.connext = "0xD9e8b18Db316d7736A3d0386C59CA3332810df3B";
        addr.router = "0x570faC55A96bDEA6DE85632e4b2c7Fde4efFAD55";
        addr.test = "0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1";
    }
    if (chain == "mumbai") {
        addr.WETH = "";
        addr.rocket = "";
        // TODO: aave addresses
        addr.connext = zeroAddress;
        addr.router = zeroAddress;
        addr.test = zeroAddress;
    }
    if (chain == "optigoerli") {
        addr.WETH = "";
        addr.rocket = "";
        addr.connext = "0xA04f29c24CCf3AF30D4164F608A56Dc495B2c976";
        addr.router = "0xF0Efb28f638A5262DdA8E8C4556eac4F0B749A22";
        addr.test = "0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF";
    }
    const prov = {"url": "https://"+rpcURL};
    provider = new ethers.providers.JsonRpcProvider(prov);
    provider = new ethers.providers.Web3Provider(window.ethereum);
    var wssProvider = new ethers.providers.WebSocketProvider(
        "wss://" + rpcURL
    );
    rocket = new ethers.Contract(
        addr.rocket,
        rocketABI,
        wssProvider
    );
}
setupChain();

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

    return mergeImages(
        [
            { src: uri, x: 295, y: 44 },
            { src: `images/levels/${level}.png`, x: 0, y: 0 }
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

async function mint() {
    var nftImage = $("img.rocket").attr("src");
    var metaJSON = {
        "name": "onRamp Rocket",
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
    const response = await fetch('https://api.nft.storage/upload', { 
        method: 'post', 
        headers: new Headers({
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU0NkZiYmNhOEIzZDIwMDAzZTA2ZjMzZmRBN0E0NzUxMGExRUY5OTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODYxMDE3NzQxNSwibmFtZSI6InNwcm91dCBtZXRhZGF0YSJ9.6YwPqstbUyRfNiGwEaYccfGZZYGmXOSuAuLzLduwdRM', 
            'Content-Type': 'application/json'
        }), 
        body: file
    });
    var result = await response.json();
    console.log( result );
    if (result.ok) {
        var tokenURI = ipfsToHttp(result.value.cid);
        var tx = await rocket.connect(ethersSigner).selfMint(accounts[0]);
        console.log(tx);
        let mintFilter = rocket.filters.Transfer(zeroAddress, accounts[0]);
        rocket.on(mintFilter, async (from, to, tokenId, event) => { 
            console.log('tokenId:' + tokenId);
            tokenURI = encodeURIComponent(tokenURI);
            const response = await fetch(onrampAPI + `?chain=0&id=${tokenId}&uri=${tokenURI}`);
            var result = await response.json();
            console.log(result);
            $("fieldset.current").find("div.actions").remove();
            $("fieldset.current").find("p").html(`Mission completed. Your Rocket NFT has been minted. <a target="_blank" href="https://testnets.opensea.io/assets/goerli/${addr.rocket}/${tokenId}">View it on OpenSea</a>. Click Next to continue.`);
        });
        await tx.wait();
    }
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
    });

    $("#mint").click(function(){
        $(this).text("Minting...");
        mint();
    });

});