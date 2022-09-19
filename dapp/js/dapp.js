const zeroAddress = "0x0000000000000000000000000000000000000000";

var addr = {};

var rpcURLs = {};
rpcURLs.goerli = "eth-goerli.alchemyapi.io/v2/n_mDCfTpJ8I959arPP7PwiOptjubLm57";
rpcURLs.mumbai = "polygon-mumbai.g.alchemy.com/v2/Ptsa6JdQQUtTbRGM1Elvw_ed3cTszLoj";
rpcURLs.optigoerli = "opt-goerli.g.alchemy.com/v2/jb4AhFhyR0X_ChVX5J1f0oWQ6GvJqLK0";

const nftPortAPI = "https://api.nftport.xyz/v0/accounts/";

var chain = "goerli";
//var chain = "optigoerli";
var rocket;

function setupChain() {
    var rpcURL = rpcURLs[chain];
    if (chain == "goerli") {
        addr.WETH = "";
        addr.rocket = "";
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
    var provider = new ethers.providers.JsonRpcProvider(prov);
    var wssProvider = new ethers.providers.WebSocketProvider(
        "wss://" + rpcURL
    );
    rocket = new ethers.Contract(
        addr.rocket,
        rocketABI,
        wssProvider
    );
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
            var metaImage = "https://" + result.value.cid + ".ipfs.dweb.link/";
            //document.querySelector('img').src = metaImage;
            return metaImage;
        }
    });
}

async function merge() {
    var ipfsUrl = await getNFTImage("https://api.degendogs.club/images/0.png", 1);
    console.log(ipfsUrl);
    document.querySelector('img').src = ipfsUrl;
}

merge();