import {
    Connection,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    PublicKey,
  } from "@solana/web3.js";
  import "dotenv/config"
  import { getKeypairFromEnvironment } from "@solana-developers/helpers";
  
  const userInputKey = process.argv[2] || null;
  
  if (!userInputKey) {
    console.log(`Please provide a public key to send to`);
    process.exit(1);
  }
  
  const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
  console.log(`user public key: ${userInputKey}`);
  const toPubkey = new PublicKey(userInputKey);
  
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  console.log(
    `✅ Loaded our own keypair, the destination public key, and connected to Solana`
  );

  const transaction = new Transaction()

  const LAMPORTS_TO_SEND = 5000

  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: senderKeypair.publicKey,
    toPubkey,
    lamports: LAMPORTS_TO_SEND,
  })

  transaction.add(sendSolInstruction)

  const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair])

  console.log(`Done! Sent ${LAMPORTS_TO_SEND} lamports to ${toPubkey.toBase58()}. `)
  console.log(`Transaction signature: ${signature}`)