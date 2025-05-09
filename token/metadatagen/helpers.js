import { none, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { Keypair } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import fs from "fs";

export const SPL_TOKEN_2022_PROGRAM_ID = publicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const umiRpcEndpoint = process.env.UMI_RPC_ENDPOINT || ''; // https://api.mainnet-beta.solana.com
export const ourMetadata = {
  "name": process.env.METADATA_NAME || 'Test Coin Name',
  "symbol": process.env.METADATA_SYMBOL || 'BTC',
  "uri": process.env.METADATA_URI || 'https://mileisol.com/token22/milei_metadata.json',
};

export function loadWalletKey(keypairFile) {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
  );
}
  
