import { ethers, Contract } from './ethers.js';

import {Token}            from '../abi/Token.js';
import {Token2}            from '../abi/Token2.js';
import {Pet}            from '../abi/Pet.js';
import {Chat}            from '../abi/Chat.js';
import {Roulette}         from '../abi/Roulette.js';
import {ZooIslands}         from '../abi/ZooIslands.js';

import {CONSTANTS}        from './constants.js';


// ERROR HANDLING
function catchError(error)
{
  if (error === undefined) return alert("Undefined Error")
  console.log(typeof error)
  console.log(Object.keys(error))
  console.log(error)
  switch(error.code.toString()) {
    case "4001": break;
    case "-32603":
      if (error.data === undefined)
      {
        if (error.message.indexOf("The method does not exist") === -1)
        {
            alert("Can't connect to network, try again in a few seconds")
        } else {
          if (error.message.indexOf("the tx doesn't have the correct nonce") === -1)
          {
            alert(parseError(error.message))
          } else {
            alert("The account doesn't have the correct nonce.\n"+
                  "Go to Wallet > Settings > Advanced > Reset Account (tx history)\n"+
                  "and then refresh.")
          }
        } 
      } else {
        console.log("error.data", error.data)
        if (error.message.indexOf("MetaMask is having trouble connecting to the network") !== -1) {
          alert("MetaMask is having trouble connecting to the network.\n"+
                "Please want a moment, and then refresh.")
        } else {
          alert(parseError(error.data.message))
        }
      }
    break;
    case "CALL_EXCEPTION":  alert("Invalid Network"); break;
    default:                alert(error.message); break;
  }
}
function parseError(errorString)
{
  if (errorString === undefined) return ""
  let splitError = errorString.split(": ")
  if (splitError.length > 1) {
    if (splitError[0] == "execution reverted") {
      return CONSTANTS.revertedList[splitError[1]]
    }
  }

  return errorString
}

// CONTRACT INITIALIZATION
async function getContractData()
{
    return new Promise(async (resolve, reject) => {
      if(window.ethereum)
      {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const rouletteContract = new Contract(
          CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].rouletteAddress,
          Roulette.abi,
          signer
        );
        const tokenContract = new Contract(
          CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].tokenAddress,
          Token.abi,
          signer
        );
        const petContract = new Contract(
          CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].petAddress,
          Pet.abi,
          signer
        );
        const zooIslandsContract = new Contract(
          CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].zooIslandsAddress,
          ZooIslands.abi,
          signer
        );
        const chatContract = new Contract(
          CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].chatAddress,
          Chat.abi,
          signer
        );
        resolve({token: tokenContract, roulette: rouletteContract, pet: petContract, chat: chatContract, zooIslands: zooIslandsContract});
      } else {
        resolve({});
      }
    });
}
async function getAccountData(tokenContract, rouletteContract)
{
    return new Promise(async (resolve, reject) => {
      if(window.ethereum)
      {
        try {

          // console.log("provider")
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          // console.log("signerAddress")
          const signerAddress = await signer.getAddress();
          
          // console.log("masterAddress")
          let masterAddress = await rouletteContract.masterAddress().then()
          .catch(() => {console.log("getAccountData roulette.masterAddress catch")})

          if (!masterAddress)
          {
            // invalid network
            resolve({account: undefined});
            return
          }
          // if (masterAddress) {}
          // console.log("balanceOf")
          let balanceOf = await tokenContract.balanceOf(signerAddress)
          
          // console.log("allowance")
          let allowance = await tokenContract.allowance(signerAddress, CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].rouletteAddress)
          // console.log("registeredFunds")
          let registeredFunds = await rouletteContract.registeredFunds(signerAddress)
          let accountData = {
            masterAddress: masterAddress,
            signer,
            address: signerAddress,
            isMaster: masterAddress === signerAddress,
            balanceOf: (balanceOf),
            balance: ethers.utils.formatEther(balanceOf),
            allowance: ethers.utils.formatEther(allowance),
            funds: ethers.utils.formatEther(registeredFunds),
          }

          resolve({account: accountData});

        } catch (e) {
          console.log("TRY AND CATCHED", e)
          resolve({});
        }
      } else {
        resolve({});
      }
    });
}
async function addNetworkToMetamask(chainArguments)
{
  console.log(chainArguments)
  window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [chainArguments]
  });
}
async function addTokenToMetamask()
{
    const tokenAddress = CONSTANTS.chainInfo[CONSTANTS.defaultNetwork].tokenAddress;
    const tokenSymbol = 'TREAT';
    const tokenDecimals = 18;
    const tokenImage = 'https://i.imgur.com/AAytbAt.png';
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
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
}
function getDate(dateTimestamp, format = "medium")
{
  let date = new Date(dateTimestamp*1000)
  switch (format)
  {
    case "unix":
      return parseInt(date.getTime() / 1000)
    case "small":
      return date.getHours()+
              ":"+date.getMinutes()+
              " - "+
              date.getDate()+
              "/"+(date.getMonth()+1)
              ;
    break;
    case "medium":
      return date.getDate()+
              "/"+(date.getMonth()+1)+
              "/"+date.getFullYear()+
              " "+date.getHours()+
              ":"+date.getMinutes()+
              ":"+date.getSeconds();
    break;
    case "large":
    break;
  }
}
function shortAddress(address)
{
  return address.substr(0,5)+"..."+address.substr(address.length-3,address.length)
}
function prettyNumber(x)
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function prettyNumberReduced(x)
{
    let deno = "";
    let y = 0;
    if (parseFloat(x) < 1000)
    {
      y = x
    }
    if (parseFloat(x) >= 1000)
    {
      y = parseInt(x/10)
      y = y/100
      deno = "K"
    }
    if (parseFloat(x) >= 1000000)
    {
      y = parseInt(y/10)
      y = y/100
      deno = "M"
    }
    if (parseFloat(x) >= 1000000000)
    {
      y = parseInt(y/10)
      y = y/100
      deno = "B"
    }
    if (parseFloat(x) >= 1000000000000)
    {
      y = parseInt(y/10)
      y = y/100
      deno = "T"
    }
    return y.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + deno;
}
function parseGameRound(gameRound)
{
  return {
      petTokenId: 0,
      lastResult: gameRound.lastResult,
      wonAmount: ethers.utils.formatEther(gameRound.wonAmount),
      highestBetAmount: ethers.utils.formatEther(gameRound.highestBetAmount),
      lockedFunds: ethers.utils.formatEther(gameRound.lockedFunds),
      masterLockedFunds: ethers.utils.formatEther(gameRound.masterLockedFunds),
      redeemed: gameRound.redeemed,
      masterRandomHash: gameRound.masterRandomHash,
      isMasterRandomHashSet: gameRound.masterRandomHash !== "0x0000000000000000000000000000000000000000000000000000000000000000",
      initHashTimestampRaw: gameRound.initHashTimestamp,
      initHashTimestamp: parseFloat(ethers.utils.formatEther(gameRound.initHashTimestamp))*(10**18),
      finishHashTimestamp: (parseFloat(ethers.utils.formatEther(gameRound.initHashTimestamp))*(10**18))+3600,
  }
}

export const HELPERS = {
  prettyNumber,
  prettyNumberReduced,
  getContractData,
  getAccountData,
  addTokenToMetamask,
  addNetworkToMetamask,
  getDate,
  parseGameRound,
  shortAddress,
  catchError,
  parseError
};
