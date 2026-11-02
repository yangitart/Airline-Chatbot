"use client";
import { useEffect } from "react";
import { useUserStore } from "@/src/features/users/ui/store/useUserStore";

export const useCurrentUser = () => {
  const { data: currentUser, getUserMe, isLoading, error } = useUserStore();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      getUserMe();
    }
  }, [currentUser, isLoading, getUserMe]);

  return {
    currentUser,
    isLoading,
    error,
    refetch: getUserMe
  };
};