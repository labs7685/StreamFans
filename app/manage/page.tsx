"use client";
import Create from "@/components/create";
import { isValidHandle, useCreateProfile } from "@lens-protocol/react-web";
import { FormEvent, useEffect, useState } from "react";
import React from "react";
import toast from "react-hot-toast";


export default function Manage() {
  return (
    <div className="p-20">
        <Create />
    </div>
  );
}
