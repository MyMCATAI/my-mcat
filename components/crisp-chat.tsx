"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("39f27504-caee-4b12-908c-49472326ef32");
  }, []);

  return null;
};