import { error, fail } from "@sveltejs/kit";

import type { Post } from "$lib/types";

import validateComment from "$lib/server/validation/comment/validateComment";
import queryClient from "$lib/utils/queryClient";

export const actions = {
  async comment({ request, locals, params: { id } }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const commentValidationResult = validateComment(data);

    if (!commentValidationResult.success)
      return fail(400, {
        ...commentValidationResult,
        suppliedValues: { comment: data["comment"] },
      });

    await queryClient(`/posts/${encodeURIComponent(id)}/comments?userId=${locals.user.userId}`, {
      method: "POST",
      body: { comment: commentValidationResult.data.comment },
    });

    return { success: true };
  },
};

export async function load({ params }) {
  const posts = await queryClient<Post[] | null>("/posts/search", {
    searchParams: {
      q: params.id,
      type: "id",
    },
  });

  if (!posts?.[0]) throw error(404, { message: "Not Found" });

  return { post: posts[0] };
}
