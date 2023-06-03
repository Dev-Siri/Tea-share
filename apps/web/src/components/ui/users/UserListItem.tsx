import type { MongoDBUser } from "@/types";
import type { FC } from "react";

import { getHandle } from "@/utils/globals";

import Image from "next/image";
import Link from "next/link";

interface Props extends Pick<MongoDBUser, "username" | "image"> {
  loading?: boolean;
}

const UserListItem: FC<Props> = ({ username, image }) => (
  <Link
    href={`/people/${encodeURIComponent(username)}`}
    className="dark:hover:bg-semi-gray flex w-full cursor-pointer items-center p-3 duration-200 hover:bg-gray-200"
  >
    <Image src={image} alt={username} height={44} width={44} className="h-11 rounded-full" />
    <div className="ml-5">
      <p>{username}</p>
      <p className="text-gray-500">{getHandle(username)}</p>
    </div>
  </Link>
);

export default UserListItem;
