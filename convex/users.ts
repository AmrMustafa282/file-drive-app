import { ConvexError, v } from "convex/values";
import {
 internalMutation,
 MutationCtx,
 query,
 QueryCtx,
} from "./_generated/server";
import { roles } from "./schema";

export async function getUser(
 ctx: QueryCtx | MutationCtx,
 tokenIdentifier: string
) {
 const user = await ctx.db
  .query("users")
  .withIndex("by_tokenIdentifier", (q) =>
   q.eq("tokenIdentifier", tokenIdentifier)
  )
  .first();

 if (!user) {
  throw new ConvexError("user not found");
 }
 return user;
}

export const createUser = internalMutation({
 args: {
  tokenIdentifier: v.string(),
  name: v.string(),
  image: v.string(),
 },
 async handler(ctx, args) {
  await ctx.db.insert("users", {
   tokenIdentifier: args.tokenIdentifier,
   orgIds: [],
   name: args.name,
   image: args.image,
  });
 },
});
export const updateUser = internalMutation({
 args: {
  tokenIdentifier: v.string(),
  name: v.string(),
  image: v.string(),
 },
 async handler(ctx, args) {
  const user = await getUser(ctx, args.tokenIdentifier);

  await ctx.db.patch(user._id, {
   name: args.name,
   image: args.image,
  });
 },
});

export const getUserProfile = query({
 args: { userId: v.id("users") },
 async handler(ctx, args) {
  const user = await ctx.db.get(args.userId);
  return {
   name: user?.name,
   image: user?.image,
  };
 },
});

export const addOrgIdToUser = internalMutation({
 args: {
  tokenIdentifier: v.string(),
  orgId: v.string(),
  role: roles,
 },

 async handler(ctx, args) {
  const user = await getUser(ctx, args.tokenIdentifier);

  await ctx.db.patch(user._id, {
   orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
  });
 },
});

export const updateRoleInOrgForUser = internalMutation({
 args: {
  tokenIdentifier: v.string(),
  orgId: v.string(),
  role: roles,
 },

 async handler(ctx, args) {
  const user = await getUser(ctx, args.tokenIdentifier);

  const org = user.orgIds.find((item) => item.orgId === args.orgId);
  if (!org) {
   throw new ConvexError("user is not a member of the organization");
  }
  org.role = args.role;
  await ctx.db.patch(user._id, {
   orgIds: user.orgIds,
  });
 },
});
