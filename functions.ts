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

export async function hasDeployed(username: string) {
    const contract = await getContract();
    const data = await contract.hasDeployed(username);
    return data;
}

export async function getAddress(username:string) {
    const contract = await getContract();
    const hasDeployedValue = await hasDeployed(username);

    if (hasDeployedValue) {
        const address = await contract.userToContract(username);
        return address;
    }

    const deployContractAddress = await contract.deploy(username);
    return deployContractAddress;
}
