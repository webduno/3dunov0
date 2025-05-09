console.log("Hello, world!");
import { TransactionExpiredBlockheightExceededError } from '@solana/web3.js';
import 'dotenv/config'
import { createV1, TokenStandard} from "@metaplex-foundation/mpl-token-metadata";
import { fromWeb3JsPublicKey, fromWeb3JsKeypair} from '@metaplex-foundation/umi-web3js-adapters';
console.log(process.env.TEST);
import { loadWalletKey, ourMetadata, SPL_TOKEN_2022_PROGRAM_ID } from './helpers.js';
import * as web3 from "@solana/web3.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, none, percentAmount, signerIdentity } from "@metaplex-foundation/umi";

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms));}

async function initializeToken(shouldExecute = false) {
    const myKeypair = loadWalletKey(process.env.KEYPAIR_FILE || '');
    const mint = new web3.PublicKey(process.env.TOKEN_ADDRESS || '');
    console.log("mint");
    console.log(mint);
    
    const umi = createUmi(process.env.UMI_RPC_ENDPOINT || '');
    const connection = new web3.Connection(process.env.UMI_RPC_ENDPOINT || '');
  
    // Check and print wallet balance
    const balance = await connection.getBalance(myKeypair.publicKey);
    console.log(`Wallet address: ${myKeypair.publicKey.toString()}`);
    console.log(`Current balance: ${balance} lamports (${balance / 1e9} SOL)`);
    const requiredBalance = 15115600; // Minimum required balance from error message
    console.log(`Required balance: ${requiredBalance} lamports (${requiredBalance / 1e9} SOL)`);
    
    if (balance < requiredBalance) {
        console.error(`Insufficient SOL balance. Current balance: ${balance} lamports, Required: ${requiredBalance} lamports`);
        console.error(`Please add at least ${(requiredBalance - balance) / 1e9} SOL to your wallet`);
        return;
    }

    if (!shouldExecute) {
        console.log("\nTransaction details:");
        console.log("Token Standard: Fungible");
        console.log("Is Mutable: true");
        console.log("Primary Sale Happened: true");
        console.log("\nTo execute the transaction, run the script with 'confirm' parameter");
        return;
    }

    console.log("\nExecuting transaction...");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
    umi.use(signerIdentity(signer, true));
    
    const onChainData = {...ourMetadata,
      sellerFeeBasisPoints: percentAmount(0,2),creators: none(),
      collection: none(),uses: none(),
    }
    const accounts = {
        mint: fromWeb3JsPublicKey(mint),splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
    }
    const data = {...onChainData,
        isMutable: true,discriminator: 0,
        tokenStandard: TokenStandard.Fungible,collectionDetails: none(),
        ruleSet: none(),createV1Discriminator: 0,
        primarySaleHappened: true,decimals: none(),
        printSupply: none(),
    }
    const retryDelay = 5000
    const maxRetries = 3
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const txid = await createV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(`Transaction successful! Signature: ${txid}`);
        return;
      } catch (error) {
        console.log(`Attempt ${attempt}/${maxRetries} failed`);
        if (error instanceof TransactionExpiredBlockheightExceededError) {
          console.log("Transaction expired, retrying...");
          await sleep(retryDelay);
        } else {
          console.error("Transaction failed:", error.message);
          if (error.transactionLogs) {
            console.error("Transaction logs:", error.transactionLogs);
          }
          throw error;
        }
      }
    }
    console.error("All retry attempts failed");
}
  
console.log("Initializing token...");
const shouldExecute = process.argv.includes('confirm');
initializeToken(shouldExecute);
  