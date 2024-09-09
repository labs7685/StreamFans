// utils.ts
export function formatPicture(picture: any) {
  if (picture.__typename === "MediaSet") {
    if (picture.original.url.startsWith("ipfs://")) {
      let result = picture.original.url.substring(
        7,
        picture.original.url.length
      );
      return `http://lens.infura-ipfs.io/ipfs/${result}`;
    } else if (picture.original.url.startsWith("ar://")) {
      let result = picture.original.url.substring(
        4,
        picture.original.url.length
      );
      return `http://arweave.net/${result}`;
    } else {
      return picture.original.url;
    }
  } else {
    return picture;
  }
}

import { Web3Storage } from "web3.storage";

const formInput = {
  name: "test",
  venue: "test",
  date: "test",
  cover: "",
  price: "10",
  supply: "10",
};

function getAccessToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkyMjkyQjQ5YzFjN2ExMzhERWQxQzQ3NGNlNmEyNmM1NURFNWQ0REQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjUyMzg2MDc1NDEsIm5hbWUiOiJNZXRhRmkifQ.cwyjEIx8vXtTnn8Y3vctroo_rooHV4ww_2xKY-MT0rs";
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

const uploadToIPFS = async (files: File[]) => {
  const client = makeStorageClient();
  const cid = await client.put(files);
  return cid;
};

export const getURLfromIPFS = async(data: string) => {
  const files = [new File([data], "data.json")];
  const metaCID = await uploadToIPFS(files);
  const url = `https://ipfs.io/ipfs/${metaCID}/data.json`;
  console.log(url);
  return url;
}


export const imageUploadToIpfs = async(image: File) => {
  const files = [image];
  const metaCID = await uploadToIPFS(files);
  const url = `https://ipfs.io/ipfs/${metaCID}/${image.name}`;
  console.log(url);
  return url;
}