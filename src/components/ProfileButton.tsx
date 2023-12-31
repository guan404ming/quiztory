"use client";

import { useRouter } from "next/navigation";

import { MoreHorizontal } from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import useUserInfo from "@/hooks/useUserInfo";

export default function ProfileButton() {
  const { session } = useUserInfo();
  const router = useRouter();

  return (
    <button
      className="flex items-center gap-2 rounded-full p-3 text-start transition-colors duration-300 hover:bg-gray-200"
      onClick={() => router.push("/?open=true")}
    >
      <UserAvatar />
      <div className="w-40 px-2 max-lg:hidden">
        <p className="truncate text-sm font-bold">
          {session?.user?.name ?? "..."}
        </p>
        <p className="truncate text-sm text-gray-500">{`${session?.user?.email}`}</p>
      </div>
      <MoreHorizontal size={24} className="max-lg:hidden" />
    </button>
  );
}
