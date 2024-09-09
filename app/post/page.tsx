"use client";
import { getURLfromIPFS } from "@/utils";
import React, { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import {
  MetadataV2,
  NftOwnership,
  ProfileOwnership,
  PublicationMainFocus,
  ContractType,
  ScalarOperator,
  LensGatedSDK,
  LensEnvironment,
} from "@lens-protocol/sdk-gated";
import {
  signCreatePostTypedData,
  lensHub,
  splitSignature,
  client,
  challenge,
  authenticate,
} from "../../api";
import { ethers, providers } from "ethers";
import web3modal from "web3modal";
import {
  ContentFocus,
  ImageType,
  ProfileOwnedByMe,
  useActiveProfile,
  useActiveWallet,
  useCreatePost,
} from "@lens-protocol/react-web";
import FileUpload from "@/components/fileUpload";
import Loader from "@/components/Loader";
import { v4 as uuidv4 } from "uuid";
import { WebBundlr } from "@bundlr-network/client";
import { getAddress } from "@/functions";
import { toast } from "react-hot-toast";

async function getToken() {
  try {
    /* first request the challenge from the API server */
    const account = await window.ethereum.send("eth_requestAccounts");
    const address = account.result[0];

    const challengeInfo = await client.query({
      query: challenge,
      variables: { address },
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const signature = await signer.signMessage(
      challengeInfo.data.challenge.text
    );

    const authData = await client.mutate({
      mutation: authenticate,
      variables: {
        address,
        signature,
      },
    });

    const {
      data: { authenticate: authTokens },
    } = authData;
    return authTokens.accessToken;
  } catch (err) {
    console.log("Error signing in: ", err);
  }
}
type ImageState = {
  file: File | null;
  previewURL: string | null;
  loading: boolean;
};


// {
//   "version": "2.0.0",
//   "metadata_id": "d9dca93e-56d4-4fc2-9ff6-c45a60453a03",
//   "content": "it's a text post",
//   "external_url": "https://lenster.xyz/u/akashbiswas.test",

//   "name": "Post by @akashbiswas.test",
//   "mainContentFocus": "TEXT_ONLY",
//   "attributes": [
//      {
//         "traitType": "type",
//         "displayType": "string",
//         "value": "text_only"
//      }
//   ],
//   "media": [],
//   "locale": "en-US",
//   "appId": "Lenster"
// }

// async function uploadJson(data: unknown) {
//   try {
//     console.log("data to upload: " + data);
//     const json = JSON.stringify(data);
//     console.log("data in json: " + json);

//     const url = await getURLfromIPFS(json);
//     return url;
//   } catch (err) {
//     console.log(err);
//     return "";
//   }
// }

/* Client */
// useCreatePost hook

// Upload function
async function uploadJson(data: unknown) {
  try {
    console.log("uploading: ", data);
    await window.ethereum.enable();
    const provider = new providers.Web3Provider(window.ethereum);
    const bundlr = new WebBundlr(
      "https://node2.bundlr.network",
      "matic",
      provider
    );
    await bundlr.ready();
    const tx = await bundlr.upload(JSON.stringify(data), {
      tags: [{ name: "Content-Type", value: "application/json" }],
    });
    const url = `https://arweave.net/${tx.id}`;

    console.log("url: ", url);
    return url;
  } catch (err) {
    console.log({ err });
    return "";
  }
}

export default function Page() {
  const { data: wallet, loading: walletLoading } = useActiveWallet();
  const { data: profile, error, loading: profileLoading } = useActiveProfile();

  // const {
  //   execute: createPost,
  //   error: postError,
  //   isPending,
  // } = useCreatePost({ publisher: profile, upload: uploadJson });

  if (profileLoading) return <Loader />;
  if (!profile) return <Loader />;

  return (
    <div className="py-20 px-20 max-w-screen-xl mx-auto">
      <div className="mt-20 text-white">
        <Composer publisher={profile} />
      </div>
    </div>
  );
}

function Composer({ publisher }: { publisher: ProfileOwnedByMe }) {
  const {
    execute: create,
    error,
    isPending,
  } = useCreatePost({ publisher, upload: uploadJson });

  const [image, setImage] = useState<ImageState>({
    file: null,
    previewURL: null,
    loading: false,
  });

  const [postInput, setPostInput] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!publisher) return;
    event.preventDefault();
    createGatedPost(publisher, postInput, image);
    // console.log(post);
    // if (image.previewURL !== null) {
    //   await create({
    //     content: postInput,
    //     contentFocus: ContentFocus.IMAGE,
    //     locale: "en",
    //     media: [
    //       {
    //         url: image.previewURL,
    //         mimeType: ImageType.JPEG,
    //       },
    //     ],
    //   });
    // } else {
    //   await create({
    //     content: postInput,
    //     contentFocus: ContentFocus.TEXT_ONLY,
    //     locale: "en",
    //   });
    // }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
          <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x dark:divide-gray-600">
            <div className="flex items-center space-x-1 sm:pr-4">
              <FileUpload setImage={setImage} />
            </div>
          </div>
          <button
            type="button"
            data-tooltip-target="tooltip-fullscreen"
            className="p-2 text-gray-500 rounded cursor-pointer sm:ml-auto hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Full screen</span>
          </button>
          <div
            id="tooltip-fullscreen"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Show full screen
            <div className="tooltip-arrow" data-popper-arrow="" />
          </div>
        </div>
        <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
          <label htmlFor="editor" className="sr-only">
            Publish post
          </label>
          <textarea
            id="editor"
            rows={6}
            className="block py-1 ring-0 outline-0 w-full px-0 text-md text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
            placeholder="Write an article..."
            required
            onChange={(e) => {
              setPostInput(e.target.value);
            }}
            value={postInput}
          />
        </div>
      </div>

      {image.previewURL !== null ? (
        <figure className="max-w-lg">
          <img
            className="h-auto max-w-full rounded-lg"
            src={image.previewURL}
            alt="image description"
          />
          <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
            {image.file?.name}
          </figcaption>
        </figure>
      ) : null}

      <button
        type="submit"
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
      >
        Publish post
      </button>
    </form>
  );
}

const createGatedPost = async (
  profile: ProfileOwnedByMe,
  postInput: string,
  image: ImageState
): Promise<void> => {
  if (!window.ethereum) return;

  const profileId = profile.id;
  const contractAddress = await getAddress(profile.handle);

  const nftAccessCondition: NftOwnership = {
    contractAddress: contractAddress,
    chainID: 80001,
    contractType: ContractType.Erc721,
  };

  const modal = new web3modal({
    network: "mumbai",
    cacheProvider: true,
  });

  const connection = await modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  let metadata: MetadataV2;

  // let metadata: MetadataV2 = {
  //   version: "2.0.0",
  //   metadata_id: uuidv4(),
  //   content: "This is a gated post",
  //   name: "name",
  //   description: "description",
  //   attributes: [],
  //   //   appId: "app_id",
  //   mainContentFocus: PublicationMainFocus.TextOnly,
  //   locale: "en",
  // };

  console.log("image from inside is", image)

  if (image.previewURL === null) {
    metadata = {
      version: "2.0.0",
      metadata_id: uuidv4(),
      content: postInput,
      name: "Post by " + profile.handle,
      description: "description",
      attributes: [],
      mainContentFocus: PublicationMainFocus.TextOnly,
      locale: "en",
    };
  } else {
    metadata = {
      version: "2.0.0",
      metadata_id: uuidv4(),
      content: postInput,
      name: "Post by " + profile.handle,
      description: "description",
      attributes: [],
      image: image.previewURL,
      mainContentFocus: PublicationMainFocus.Image,
      locale: "en",
      imageMimeType: ImageType.JPEG,
      media: [
        {
          item: image.previewURL,
          cover: image.previewURL,
          type:  ImageType.JPEG,
        },
      ],
    };
  }

  const sdk = await LensGatedSDK.create({
    provider: provider,
    signer: signer,
    env: LensEnvironment.Mumbai,
  });

  const { contentURI, encryptedMetadata } = await sdk.gated.encryptMetadata(
    metadata,
    profileId,
    {
      nft: nftAccessCondition,
    },
    uploadJson
  );

  if (!encryptedMetadata) {
    toast.error("No encrypted metadata");
    return;
  }

  let gated = {
    encryptedSymmetricKey:
      encryptedMetadata.encryptionParams.providerSpecificParams.encryptionKey,
    nft: nftAccessCondition,
  };

  /* configure the final post data containing the content URI and the gated configuration */
  const createPostRequest = {
    profileId,
    contentURI: contentURI,
    collectModule: {
      freeCollectModule: { followerOnly: true },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
    gated,
  };
  const token = await getToken();

  if (!token) return;

  window.localStorage.setItem("lens-access-token", token);

  console.log(token);
  try {
    const signedResult = await signCreatePostTypedData(
      createPostRequest,
      token
    );
    const typedData = signedResult.result.typedData;
    const { v, r, s } = splitSignature(signedResult.signature);
    const tx = await lensHub.postWithSig({
      profileId: typedData.value.profileId,
      contentURI: typedData.value.contentURI,
      collectModule: typedData.value.collectModule,
      collectModuleInitData: typedData.value.collectModuleInitData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleInitData: typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });
    console.log("successfully created post: tx hash", tx.hash);
  } catch (err) {
    console.log("error posting publication: ", err);
  }
};
