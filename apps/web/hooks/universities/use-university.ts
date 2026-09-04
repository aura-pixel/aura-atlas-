"use client";

import { useEffect, useState } from "react";

import { get } from "@/lib/api";

import type { University } from "@/types/university";

export function useUniversities() {

  const [universities, setUniversities] =
    useState<University[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function load() {

      const data =
        await get<University[]>(
          "/universities",
        );

      setUniversities(data);

      setLoading(false);

    }

    load();

  }, []);

  return {
    universities,
    loading,
  };

}