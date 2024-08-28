import {ethers} from "./ethers-5.2.js";
import {abi, contractAddress} from "./constants.js";

const connectButton=document.getElementById("connectButton");
const fundButton=document.getElementById("fundButton");
const balanceButton=document.getElementById("balanceButton");
const withdrawButton=document.getElementById("withdrawButton");

withdrawButton.onclick=checkOwner;
connectButton.onclick=connect;
fundButton.onclick=fund;
balanceButton.onclick=getBalance;
console.log(ethers);

async function connect(){
    if(typeof window.ethereum != "undefined"){
        await window.ethereum.request({method: "eth_requestAccounts"});
        console.log("connected");
        document.getElementById("connectButton").innerHTML="Connected";
    }
    else{
        console.log("No metamask!");
        document.getElementById("connectButton").innerHTML="Please install metamask";
    }
}

async function getBalance(){
    if(typeof window.ethereum != "undefined"){
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        const balance=await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
        document.getElementById("balance").textContent=`Current Balance : ${ethers.utils.formatEther(balance)} ETH`
    }
}

async function fund(){
    const ethAmount=document.getElementById("ethAmount").value;
    console.log('Funding with '+ethAmount);
    if(typeof window.ethereum !== "undefined"){
        //provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with
        // ABI & Address
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        const signer=provider.getSigner();//signer is the account that we have connected
        const contract=new ethers.Contract(contractAddress, abi, signer);
        try{
            const transactionResponse=await contract.fund({value: ethers.utils.parseEther(ethAmount)});
            await listenForTransactionMine(transactionResponse,provider);
            console.log("Done!");
        }
        catch(error){
            console.log(error);
        }
    }
}
function listenForTransactionMine(transactionResponse, provider){
    console.log("Mining "+transactionResponse.hash+" ....");
    //listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt)=>{
            console.log('Completed with '+transactionReceipt.confirmations+" confirmations");
            resolve();
        });
    })
}

async function withdraw(){
    if(typeof window.ethereum!="undefined"){
        const withdrawAmount=document.getElementById("ethWithdraw").value;
        if(withdrawAmount==""|| withdrawAmount==null){
            console.log("Withdrawing with all the balance ...");
            const provider=new ethers.providers.Web3Provider(window.ethereum);
            const signer=provider.getSigner();
            const contract=new ethers.Contract(contractAddress,abi,signer);
            try{
              const transactionResponse=await contract.withdraw();
              await listenForTransactionMine(transactionResponse, provider);
              console.log("Done!");
            }
            catch (error) {
              console.log(error);
            }
        }
        else{
            WithdrawA();
        } 
    }
}

async function WithdrawA(){
    if(typeof window.ethereum!="undefined"){
        console.log("Withdrawing .......");
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        const signer=provider.getSigner();
        const contract=new ethers.Contract(contractAddress,abi,signer);
        const withdrawAmount=document.getElementById("ethWithdraw").value;
        try{
            const transactionResponse=await contract.WithdrawA(ethers.utils.parseEther(withdrawAmount));
            await listenForTransactionMine(transactionResponse,provider);
            console.log("Done!");
        }
        catch(error){
            console.log(error);
        }
    }

}

async function checkOwner(){
    if(typeof window.ethereum!="undefined"){
        console.log("checking owner ....");
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        const signer=provider.getSigner();
        const contract=new ethers.Contract(contractAddress,abi,signer);
        try{
            console.log("......");
            const ownerAddress=await contract.getOwner();
            console.log("Owner Address : "+ownerAddress);
            const signerAddress=await signer.getAddress();
            console.log("Signer Address : "+signerAddress);
            if(ownerAddress==signerAddress){
                console.log("You are the Owner");
                withdraw();
            }
            else{
                alert("You are not the Owner");
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

