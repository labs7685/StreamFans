import {
  useActiveProfile,
  useWalletLogin,
  useWalletLogout,
} from "@lens-protocol/react-web";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WhenLoggedInWithProfile } from "./WhenLoggedInWithProfile";
import { WhenLoggedOut } from "./WhenLoggedOut";
import { Dropdown, Avatar } from "flowbite-react";
import Link from "next/link";
import { formatPicture } from "@/utils";
import { getAddress } from "@/functions";

export function LoginButton() {
  const {
    execute: login,
    error: loginError,
    isPending: isLoginPending,
  } = useWalletLogin();
  const { execute: logout, isPending: isLogoutPending } = useWalletLogout();

  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { data: profile, error, loading: profileLoading } = useActiveProfile();

  const handle = profile?.handle;

  useEffect(() => {
    if (handle) {
      getAddress(handle).then((address) => {
        console.log("is contract deplotyed: ", address);
      });
    }
  }, [handle]);

  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });

  const onLoginClick = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    const { connector } = await connectAsync();

    if (connector instanceof InjectedConnector) {
      const signer = await connector.getSigner();
      await login(signer);
    }
  };

  const onLogoutClick = async () => {
    await logout();
    await disconnectAsync();
  };

  useEffect(() => {
    if (loginError) toast.error(loginError.message);
  }, [loginError]);

  return (
    <>
      <WhenLoggedInWithProfile>
        {({ profile }) => {
          let avatarUrl;

          if (!profile.picture) {
            avatarUrl =
              "https://api.dicebear.com/6.x/identicon/svg?backgroundType=gradientLinear,solid&seed=" +
              profile.handle;
          } else if (profile.picture?.__typename === "MediaSet") {
            avatarUrl = formatPicture(profile.picture);
          }

          return (
            <div className="flex items-center md:order-2">
              <Dropdown
                inline
                label={<Avatar alt="User settings" img={avatarUrl} rounded />}
              >
                <Dropdown.Header>
                  {profile.name ? (
                    <span className="block text-sm">Bonnie Green</span>
                  ) : null}

                  <span className="block truncate text-sm font-medium">
                    @{profile.handle}
                  </span>
                </Dropdown.Header>
                <Dropdown.Item>
                  <Link href="/manage">Dashboard</Link>
                </Dropdown.Item>
                {/* <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Item>Earnings</Dropdown.Item> */}
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogoutClick}>Sign out</Dropdown.Item>
              </Dropdown>
            </div>
          );
        }}
      </WhenLoggedInWithProfile>

      <WhenLoggedOut>
        <button
          onClick={onLoginClick}
          disabled={isLoginPending}
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Login
        </button>
      </WhenLoggedOut>
    </>
  );
}

