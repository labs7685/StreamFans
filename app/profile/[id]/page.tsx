/* eslint-disable @next/next/no-img-element */
"use client";
import { usePathname } from "next/navigation";
import {
    useProfile,
    usePublications,
    useFollow,
    useActiveProfile,
    Profile,
    ProfileOwnedByMe,
    NotFoundError,
    useUnfollow,
    MetadataOutput,
} from "@lens-protocol/react-web";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { formatPicture } from "../../../utils";
import { toast } from "react-hot-toast";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import web3modal from "web3modal";
import {
    MetadataV2,
    NftOwnership,
    ProfileOwnership,
    PublicationMainFocus,
    ContractType,
    ScalarOperator,
    LensGatedSDK,
    LensEnvironment,
    EncryptedMetadata,
} from "@lens-protocol/sdk-gated";

import { mintToken } from "../../../mint";
import { getSigner } from "@/api";

export default function ProfilePage() {
    const { data: wallet } = useActiveProfile();
    const { isConnected } = useAccount();

    const pathName = usePathname();
    const handle = pathName?.split("/")[2];

    let { data: profile, loading } = useProfile({ handle });

    if (loading) return <p className="p-14">Loading ...</p>;

    return (
        <div>
            <div className="p-20">
                {wallet && profile && (
                    <FollowComponent
                        isConnected={isConnected}
                        profile={profile}
                        wallet={wallet}
                    />
                )}
                <div className="mt-6">
                    {profile && profile.picture?.__typename === "MediaSet" && (
                        <img
                            width="200"
                            height="200"
                            alt={profile.handle}
                            className="rounded-xl"
                            src={formatPicture(profile.picture)}
                        />
                    )}
                    <h1 className="text-3xl my-3">{profile?.handle}</h1>
                    <h3 className="text-xl mb-4">{profile?.bio}</h3>
                    {profile && <Publications profile={profile} />}
                </div>
            </div>
        </div>
    );
}

function FollowComponent({
    wallet,
    profile,
    isConnected,
}: {
    isConnected: boolean;
    profile: Profile;
    wallet: ProfileOwnedByMe;
}) {
    const { execute: follow } = useFollow({
        followee: profile,
        follower: wallet,
    });

    const { execute: unFollow } = useUnfollow({
        followee: profile,
        follower: wallet,
    });

    // -----

    const superTokenAddress = `0x96B82B65ACF7072eFEb00502F45757F254c2a0D4`;
    const [superToken, setSuperToken] = useState<SuperToken>();

    useEffect(() => {
        sfInitialize();
    }, []);

    async function getEthersProvider() {
        const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY;
        const provider = new ethers.providers.JsonRpcProvider(
            `https://polygon-mumbai.infura.io/v3/${infuraKey}`
        );
        return provider;
    }

    async function sfInitialize() {
        const modal = new web3modal({
            network: "mumbai",
            cacheProvider: true,
        });

        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        // const provider = await getEthersProvider();
        const xsf = await Framework.create({
            chainId: 80001,
            provider,
        });
        const sT = await xsf.loadSuperToken(superTokenAddress);
        setSuperToken(sT);

        console.log("ready");
        return sT;
    }

    // const senderAddress = wallet.ownedBy;
    const senderAddress = `0x48e6a467852Fa29710AaaCDB275F85db4Fa420eB`;
    const recipientAddress = profile.ownedBy;
    const flowRate = `385802469135802`;

    async function startFlow(xReceiverAddress: string, xFlowRate: string) {
        if (senderAddress.toUpperCase() == xReceiverAddress.toUpperCase())
            return;
        console.log(senderAddress, xReceiverAddress, xFlowRate);

        const xSuperToken = await sfInitialize();

        const modal = new web3modal({
            network: "mumbai",
            cacheProvider: true,
        });
        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        console.log("singer is", signer);

        const createFlowOperation = xSuperToken.createFlow({
            sender: senderAddress,
            receiver: xReceiverAddress,
            flowRate: xFlowRate,
        });

        console.log("flow operation created, ", createFlowOperation);

        const txnResponse = await createFlowOperation.exec(signer);
        const txnReceipt = await txnResponse.wait();
        console.log("started");
        console.log(
            `https://app.superfluid.finance/dashboard/${xReceiverAddress}`
        );
    }

    async function stopFlow(xReceiverAddress: string) {
        if (senderAddress?.toUpperCase() == xReceiverAddress?.toUpperCase())
            return;

        const modal = new web3modal({
            network: "mumbai",
            cacheProvider: true,
        });
        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const flowOp = superToken?.deleteFlow({
            sender: senderAddress,
            receiver: xReceiverAddress,
        });

        const txnResponse = await flowOp?.exec(signer);
        const txnReceipt = await txnResponse?.wait();
        console.log("stopped");
    }

    async function getFlowInfo(xReceiverAddress: string) {
        const provider = await getEthersProvider();
        if (senderAddress == xReceiverAddress) return;

        const flowInfo = await superToken?.getFlow({
            sender: senderAddress,
            receiver: xReceiverAddress,
            providerOrSigner: provider,
        });
        console.log("flowInfo", flowInfo);
    }

    // -----

    async function followUser() {
        try {
            //start stream
            // await startFlow(recipientAddress, flowRate);
            await follow();
        } catch (e) {}
    }
    async function unfollowUser() {
        try {
            //stop stream
            //   await stopFlow(recipientAddress);
            await unFollow();
        } catch (e) {}
    }

    function handelClick() {
        if (profile.isFollowedByMe) {
            unfollowUser();
        } else {
            toast.promise(followUser(), {
                loading: "Following...",
                success: <b>Followed successfullt!</b>,
                error: <b>Could not follow.</b>,
            });
        }
    }

    async function handelSubscribe() {
        startFlow(recipientAddress, flowRate).then(() => {
        mintToken(profile.handle).then(() => {
            toast.success("Successlly subscribed");
        }).catch((e) => {
            toast.error("Failed to subscribe because of error "+ e.message);
            stopFlow(recipientAddress);
        })
        });
    }

    console.log(wallet, profile, isConnected);
    return (
        <>
            {isConnected && (
                <button
                    className="bg-white text-black px-14 py-4 rounded-full"
                    onClick={handelClick}
                >
                    {profile.isFollowedByMe ? "UnFollow" : "Follow"}{" "}
                    {profile.handle}
                </button>
            )}

            {isConnected && profile.isFollowedByMe && (
                <button
                    className="bg-white text-black px-14 py-4 rounded-full ml-10"
                    onClick={handelSubscribe}
                >
                    Subscribe {profile.handle}
                </button>
            )}
        </>
    );
}

function Publications({ profile }: { profile: Profile }) {
    const [sdk, setSdk] = useState<LensGatedSDK>();

    async function getSdk() {
        const modal = new web3modal({
            network: "mumbai",
            cacheProvider: true,
        });

        const connection = await modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const sdk = await LensGatedSDK.create({
            provider: provider,
            signer: signer,
            env: LensEnvironment.Mumbai,
        });
        setSdk(sdk);
    }

    useEffect(() => {
        if (!sdk) {
            getSdk();
        }
    }, [sdk]);

    async function decryptPublication(encryptedMetadata: MetadataOutput) {
        if (!sdk) return;
        try {
            const { error, decrypted } = await sdk.gated.decryptMetadata(
                encryptedMetadata
            );
            return { error, decrypted };
        } catch (e) {
            console.log(e);
        }
    }

    let { data: publications } = usePublications({
        profileId: profile.id,
        limit: 20,
    });
    publications = publications?.map((publication) => {
        if (publication.__typename === "Mirror") {
            return publication.mirrorOf;
        } else {
            return publication;
        }
    });

    console.log("publication", publications);

    return (
        <>
            {publications?.map((pub: any, index: number) => (
                <ShowPublication
                    decryptPublication={decryptPublication}
                    key={index}
                    pub={pub}
                />
            ))}
        </>
    );
}

function ShowPublication({
    pub,
    decryptPublication,
}: {
    pub: any;
    decryptPublication: any;
}) {
    const [metadata, setMetadata] = useState(pub.metadata);

    async function decrypt() {
        const { error, decrypted } = await decryptPublication(pub.metadata);
        if (error) {
            toast.error(error.message);
            return;
        }
        console.log("desx", decrypted);
        setMetadata(decrypted);
    }

    useEffect(() => {
        if (pub.__typename === "Post" && pub.isGated) {
            decrypt();
        }
    }, [pub]);

    return (
        <div className="py-4 bg-zinc-900 rounded mb-3 px-4">
            <p>{metadata.content}</p>
            {metadata?.media[0]?.original &&
                ["image/jpeg", "image/png"].includes(
                    metadata?.media[0]?.original.mimeType
                ) && (
                    <img
                        width="400"
                        height="400"
                        className="rounded-xl mt-6 mb-2"
                        src={formatPicture(metadata.media[0])}
                    />
                )}
        </div>
    );
}
