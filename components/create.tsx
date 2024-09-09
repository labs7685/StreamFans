"use client";
import { isValidHandle, useCreateProfile } from "@lens-protocol/react-web";
import { FormEvent, useEffect, useState } from "react";
import React from "react";
import toast from "react-hot-toast";

export default function Create() {
  const [handle, setHandle] = useState<string | null>(null);
  const { execute: create, error, isPending } = useCreateProfile();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!handle) return;

    if (!isValidHandle(handle)) {
      toast.error("Invalid handle!");
      return;
    }
    await create({ handle });
  };

  useEffect(() => {
    error && toast.error(error.message);
  }, [error])

  console.log(handle, isPending);

  return (
    <div className="flex w-ful mt-20 items-center text-white">
      <form onSubmit={onSubmit}>
        <input
          minLength={5}
          maxLength={31}
          required
          value={handle || ""}
          type="text"
          disabled={isPending}
          onChange={(e) => {
            setHandle(e.target.value);
          }}
          placeholder="Choose a username"
          className="px-6 py-4 rounded-sm text-black mr-4"
        />

        <button
          className="bg-white text-black px-14 py-4 rounded-full"
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
}
