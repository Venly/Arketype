window.onload = function() {
    const btnVerify = document.getElementById("btnVerify");

    function getWalletAddress(pk) {
        try {
            return new ethers.Wallet(pk).address;
        } catch (e) {
            console.log(e);
            return "invalid";
        }

    }

    btnVerify.addEventListener("click", function() {

        let privateKey = document.getElementById("private-key").value;
        document.getElementById("zeroX").innerHTML = privateKey.startsWith('0x');
        if (privateKey.startsWith("0x")) privateKey = privateKey.slice(2);
        document.getElementById("pkLength").innerHTML = privateKey.length;
        document.getElementById("pkLength").innerHTML = privateKey.length;
        document.getElementById("hexCheck").innerHTML = ethers.utils.isHexString(`0x${privateKey}`, 32);
        document.getElementById("walletAddress").innerHTML = getWalletAddress(privateKey);
    });
};
