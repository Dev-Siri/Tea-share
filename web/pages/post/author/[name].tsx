import React, { useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import type { NextPage, GetServerSideProps } from "next";
import type { PostAuthorProps } from "../../../types";

import { fetchUserByQuery, fetchPostByQuery } from "../../../api";

import Sidebar from "../../../components/Sidebar";
const Post = dynamic(() => import("../../../components/Post"));
const Image = dynamic(() => import("next/image"));

const Author: NextPage<PostAuthorProps> = ({ user, posts }) => {
  const { username, image } = user;

  const router = useRouter();
  const { post } = router.query;

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") as string);

    if (!user) router.push(`/posts/author/${localUser?.displayName}`);
  }, []);

  return (
    <section className="flex h-screen dark:bg-black dark:text-white">
      <Sidebar route="post-author-info" isOnPostInfo={{ visible: true, title: "View Post", href: `/post/${post}`, postedBy: username }} />
      <article className="h-full w-[82%] overflow-y-auto">
        <div className="flex flex-col items-center">
          <div className="mt-[50px] flex rounded-md bg-light-gray p-12 dark:bg-dark-gray">
            {user ? (
              <>
                <Image src={image} alt={username} height={130} width={130} className="rounded-full" />
                <div className="ml-8 mr-40">
                  <h1 className="text-3xl font-bold">{username}</h1>
                  <h2 className="text-xl text-gray-500">@{username?.toLowerCase().split(" ").join("-")}</h2>
                  <h3 className="mt-2 text-xl">
                    Posts by {username} ({posts?.length})
                  </h3>
                </div>
              </>
            ) : (
              <h1 className="text-3xl font-bold">Loading user...</h1>
            )}
          </div>
          <aside className="mt-6 grid grid-cols-2">
            {posts?.map(post => (
              <Post key={post._id} post={post} />
            ))}
          </aside>
        </div>
      </article>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps<PostAuthorProps> = async ({ params }) => {
  const { data: posts } = await fetchPostByQuery(`${params?.name}`);
  const { data: user } = await fetchUserByQuery(`${params?.name}`);

  return {
    props: { user, posts },
  };
};

export default Author;
