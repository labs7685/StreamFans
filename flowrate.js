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

async function hasFlowrate(username) {
    const contract = await getContract();
    const tx = await contract.hasFlowrate(username)
}

async function setFlowrate(username, flowrate) {
    const contract = await getContract();
    const tx = await contract.setFlowrate(username)
}