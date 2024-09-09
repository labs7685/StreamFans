"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// import Login from "./Login";
// import Logo from "../assets/images/logo.png"
import { usePathname } from "next/navigation";
import { LoginButton, WhenLoggedInWithProfile } from "./auth";

export default function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const routerPathName = usePathname();

  const isActive = (pathname: String) => {
    return routerPathName === pathname;
  };

  //   const controlNavbar = () => {
  //     if (typeof window !== 'undefined') {
  //       if (window.scrollY > lastScrollY && window.scrollY > 100) {
  //         setShow(false);
  //       } else {
  //         setShow(true);
  //       }
  //       setLastScrollY(window.scrollY);
  //     }
  //   };

  //   useEffect(() => {
  //     if (typeof window !== 'undefined') {
  //       window.addEventListener('scroll', controlNavbar);

  //       return () => {
  //         window.removeEventListener('scroll', controlNavbar);
  //       };
  //     }
  //   }, [lastScrollY]);

  return (
    <nav className="bg-white dark:bg-black fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 px-20">
        <Link href="/" className="flex items-center">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8 mr-3"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            StreamFans
          </span>
        </Link>
        <div className="flex md:order-2">
          <LoginButton />
          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                href="/"
                className={
                  "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 " + (isActive("/") ? " md:text-blue-700 md:p-0 md:dark:text-blue-500": "")
                }
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/manage"
                className={
                  "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 " + (isActive("/manage") ? " md:text-blue-700 md:p-0 md:dark:text-blue-500": "")
                }
              >
                Create
              </Link>
            </li>
            <li>
              <Link
                href="/post"
                className={
                  "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 " + (isActive("/post") ? " md:text-blue-700 md:p-0 md:dark:text-blue-500": "")
                }
              >
                Post
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  return (
    <header
      className={`${
        !show ? "-top-32" : "top-0"
      } transition-all ease-in-out duration-500 container mx-auto fixed left-0 right-0 z-40 w-full pt-0`}
    >
      <div className="px-5 ">
        <div className="relative flex">
          {/**/}
          <div
            className={`${
              show && lastScrollY > 100 ? "backdrop-blur" : ""
            } flex w-full items-center justify-between rounded-3xl py-4 px-8 lg:p-10`}
          >
            <div className="opacity-0 absolute inset-0 -z-10 rounded-3xl bg-gel-black/50 transition-opacity duration-500" />
            {/* <Link className="router-link-active w-20 router-link-exact-active mt-[-2px] flex transition-all duration-300 hover:opacity-60" href="/"> 
              <Image src={Logo}/>
            </Link> */}
            <nav className="relative z-10 transition-colors duration-300 w-full">
              <ul className="hidden flex-row items-center text-[15px] font-medium lg:flex [&>button]:px-10 justify-between w-full">
                <div className="flex flex-row items-center">
                  <li className={isActive("/") ? "text-blue-500" : ""}>
                    <div className="relative inline-block w-full text-left">
                      <Link
                        className="hover:opacity-75 lg:pl-5 lg:pr-5"
                        href="/"
                      >
                        Home
                      </Link>
                    </div>
                  </li>
                  <li className={isActive("/post") ? "text-blue-500" : ""}>
                    <div className="relative inline-block w-full text-left">
                      <Link
                        className="hover:opacity-75 lg:pl-5 lg:pr-5"
                        href="/post"
                      >
                        Post
                      </Link>
                    </div>
                  </li>
                </div>
                {/* <li className={isActive('/store') ? "text-blue-500" : ''}> 
                  <div className="relative inline-block w-full text-left">
                    <Link
                      className="hover:opacity-75 lg:pl-5 lg:pr-5"
                      href="/store"
                    >
                      Store
                    </Link>
                  </div>
                <li className={isActive('/meetings') ? "text-blue-500" : ''}>
                  <div className="relative inline-block w-full text-left">
                    <Link
                      className="hover:opacity-75 lg:pl-5 lg:pr-5"
                      href="/meetings"
                    >
                      Meetings
                    </Link>
                  </div>
                </li> */}
                <div className="flex flex-row items-center">
                  <li
                    className={isActive("/communities") ? "text-blue-500" : ""}
                  >
                    <div className="relative inline-block w-full text-left">
                      <Link
                        className="hover:opacity-75 lg:pl-5 lg:pr-5"
                        href="/manage"
                      >
                        Manage
                      </Link>
                    </div>
                  </li>
                  <WhenLoggedInWithProfile>
                    {({ profile }) => (
                      <li>
                        <div className="relative inline-block w-full text-left">
                          <div className="hover:opacity-75 lg:pl-5 lg:pr-5">{`@${profile.handle}`}</div>
                        </div>
                      </li>
                    )}
                  </WhenLoggedInWithProfile>

                  <li>
                    <div className="relative inline-block w-full text-left">
                      <div className="hover:opacity-75 lg:pl-5 lg:pr-5">
                        <LoginButton />
                      </div>
                    </div>
                  </li>
                </div>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
