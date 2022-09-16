


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