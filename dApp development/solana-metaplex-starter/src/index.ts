import { initializeKeypair } from "./initializeKeypair"
import { Connection, clusterApiUrl, PublicKey, Signer } from "@solana/web3.js"
import {
  Metaplex,
  keypairIdentity,

  toMetaplexFile,
  NftWithToken,
  Nft,
  irysStorage,
} from "@metaplex-foundation/js"
import * as fs from "fs"

interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}

interface CollectionNftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
  isCollection: boolean
  collectionAuthority: Signer
}

// example data for a new NFT
const nftData = {
  name: "Name",
  symbol: "SYMBOL",
  description: "Description",
  sellerFeeBasisPoints: 0,
  imageFile: "solana.png",
}

// example data for updating an existing NFT
const updateNftData = {
  name: "Update",
  symbol: "UPDATE",
  description: "Update Description",
  sellerFeeBasisPoints: 100,
  imageFile: "success.png",
}

async function uploadMetadata(metaplex: Metaplex, nftData: NftData):Promise<string> {
  const buffer = fs.readFileSync("src/"+nftData.imageFile)

  const file = toMetaplexFile(buffer, nftData.imageFile)
 
  const imageUri = await metaplex.storage().upload(file)
  console.log("imageUri:", imageUri)

  const {uri} = await metaplex.nfts().uploadMetadata({
    name:nftData.name,
    symbol:nftData.symbol,  
    description: nftData.description,
    image: imageUri,
  })

  console.log("metadata uri:", uri);
  return uri;

}

async function createNft(metaplex:Metaplex, uri:string, nftData: NftData, mintAddress:string):Promise<Nft> {
  const {nft} = await metaplex.nfts().create({
    name: nftData.name,
    symbol: nftData.symbol,
    uri: uri,
    sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
    collection: new PublicKey(mintAddress),
  },{
    commitment:"finalized"
  })


  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  await metaplex.nfts().verifyCollection({  
    mintAddress: nft.mint.address,
    collectionMintAddress: new PublicKey(mintAddress),
    isSizedCollection: true,
  })

  return nft;

  
}

// helper function update NFT
async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: PublicKey,
) {
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" },
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  console.log(
    `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`,
  );
}

async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData
): Promise<Nft> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  )

  console.log(
    `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )

  return nft
}


async function main() {
  // create a new connection to the cluster's API
  const connection = new Connection(clusterApiUrl("devnet"))

  // initialize a keypair for the user
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  const metaplex= Metaplex.make(connection)
                .use(keypairIdentity(user))
                .use(irysStorage({
                  address: "https://devnet.irys.xyz",
                  providerUrl: "https://api.devnet.solana.com",
                  timeout: 60000,
                }))
                ;
                
    // const updatedUri = await uploadMetadata(metaplex, updateNftData)

  // create an NFT using the helper function and the URI from the metadata
  // await updateNftUri(metaplex, updatedUri, new PublicKey("GZjpA3qdNja8qY3XpkTrtg7ab1uDAZSnANJY5GWxAFsW"))
  
  
  const collectionNftData = {
    name: "TestCollectionNFT",
    symbol: "TEST",
    description: "Test Description Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
  }
  
  const collectionUri = await uploadMetadata(metaplex, collectionNftData)
  
  // create a collection NFT using the helper function and the URI from the metadata
  const collectionNft = await createCollectionNft(
    metaplex,
    collectionUri,
    collectionNftData
  )
  const nft = await createNft(metaplex, "https://arweave.net/ZFmax_B6l-9ZbhQOofQv1q6W4sEP-zccjN0CplduXuE", nftData,collectionNft.address.toString())
console.log(nft.address.toString()  )
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
