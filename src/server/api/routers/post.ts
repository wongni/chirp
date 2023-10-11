import type { User } from "@clerk/nextjs/dist/types/server";
import { clerkClient } from "@clerk/nextjs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUsersForClient = (user: User) => {
  return {
    id: user.id,
    imageUrl: user.imageUrl,
    username: user.username,
  };
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
    });
    const users = (await clerkClient.users.getUserList({
      limit: 100,
      userId: posts.map(post => post.authorId),
    })).map(filterUsersForClient);

    console.log(users);

    return posts.map(post => ({
      post,
      author: users.find(user => user.id === post.authorId),
    }));
  }),
});
