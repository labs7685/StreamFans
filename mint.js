import { address, abiFactory } from "./config";

import web3modal from "web3modal";
import { ethers } from "ethers";

async function getContract() {
    const modal = new web3modal();
    const connection = await modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(address, abiFactory, signer);
    return contract;
}

export async function mintToken(username) {
    const contract = await getContract();
    const tx = await contract.mintCall(username)
}