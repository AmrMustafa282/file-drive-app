import { ConvexError, v } from "convex/values";
import {
 internalMutation,
 mutation,
 MutationCtx,
 query,
 QueryCtx,
} from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";

export const generateUploadUrl = mutation(async (ctx) => {
 const identity = await ctx.auth.getUserIdentity();
 if (!identity) {
  throw new ConvexError("you must be logged in to upload a file");
 }
 return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(
 ctx: QueryCtx | MutationCtx,
 tokenIdentifier: string,
 orgId: string
) {
 const user = await getUser(ctx, tokenIdentifier);
 const hasAccess =
  user.orgIds.some((item) => item.orgId === orgId) ||
  user.tokenIdentifier.includes(orgId);

 return hasAccess;
}

export const createFile = mutation({
 args: {
  name: v.string(),
  fileId: v.id("_storage"),
  type: fileTypes,
  orgId: v.string(),
 },
 async handler(ctx, args) {
  //  console.log(identity);
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   throw new ConvexError("you must be logged in to upload a file");
  }
  const hasAccess = await hasAccessToOrg(
   ctx,
   identity.tokenIdentifier,
   args.orgId
  );

  if (!hasAccess) {
   throw new ConvexError("you must be a member of the organization");
  }

  await ctx.db.insert("files", {
   name: args.name,
   type: args.type,
   fileId: args.fileId,
   orgId: args.orgId,
  });
 },
});

export const getFiles = query({
 args: {
  orgId: v.string(),
  query: v.optional(v.string()),
  favorite: v.optional(v.boolean()),
  deletedOnly: v.optional(v.boolean()),
 },
 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   return [];
  }
  const user = await getUser(ctx, identity.tokenIdentifier);
  if (!user) {
   throw new ConvexError("user not found ");
  }
  const hasAccess = await hasAccessToOrg(
   ctx,
   identity.tokenIdentifier,
   args.orgId
  );
  if (!hasAccess) {
   return [];
  }

  let files = await ctx.db
   .query("files")
   .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
   .collect();

  const query = args.query;
  if (query) {
   files = files.filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase())
   );
  }

  if (args.favorite) {
   const favorites = await ctx.db
    .query("fevorites")
    .withIndex("by_userId_orgId_fileId", (q) =>
     q.eq("userId", user._id).eq("orgId", args.orgId)
    )
    .collect();
   files = files.filter((file) => favorites.some((f) => f.fileId === file._id));
  }
  if (args.deletedOnly) {
   files = files.filter((file) => file.shouldDelete);
  } else {
   files = files.filter((file) => !file.shouldDelete);
  }

  const filesWithUrl = await Promise.all(
   files.map(async (file) => ({
    ...file,
    url: await ctx.storage.getUrl(file.fileId),
   }))
  );

  // console.log("one", filesWithUrl[0]);
  // console.log("two", files[0]);

  return filesWithUrl;
 },
});

export const deleteFile = mutation({
 args: {
  fileId: v.id("files"),
 },

 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   throw new ConvexError("you must be logged in to upload a file");
  }

  const user = await getUser(ctx, identity.tokenIdentifier);
  if (!user) {
   throw new ConvexError("user not found");
  }
  const file = await ctx.db.get(args.fileId);
  if (!file) {
   throw new ConvexError("file not found");
  }

  const hasAccess = await hasAccessToOrg(
   ctx,
   identity.tokenIdentifier,
   file.orgId
  );

  if (!hasAccess) {
   throw new ConvexError("you must be a member of the organization");
  }

  // this only work on orgs !!!!!
  const isAdmin =
   user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin" ||
   file.orgId === identity.subject;
  // console.log("user", user);
  // console.log("identity", identity);
  // console.log("orgids", user.orgIds);
  // console.log("file", file);
  if (!isAdmin) {
   throw new ConvexError("you must be an admin to delete a file");
  }
  await ctx.db.patch(args.fileId, {
   shouldDelete: true,
   updatedAt: Date.now(),
  });
 },
});
export const restoreFile = mutation({
 args: {
  fileId: v.id("files"),
 },

 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   throw new ConvexError("you must be logged in to upload a file");
  }

  const user = await getUser(ctx, identity.tokenIdentifier);
  if (!user) {
   throw new ConvexError("user not found");
  }
  const file = await ctx.db.get(args.fileId);
  if (!file) {
   throw new ConvexError("file not found");
  }

  const hasAccess = await hasAccessToOrg(
   ctx,
   identity.tokenIdentifier,
   file.orgId
  );

  if (!hasAccess) {
   throw new ConvexError("you must be a member of the organization");
  }

  // this only work on orgs !!!!!
  const isAdmin =
   user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin" ||
   file.orgId === identity.subject;
  if (!isAdmin) {
   throw new ConvexError("you must be an admin to delete a file");
  }
  await ctx.db.patch(args.fileId, { shouldDelete: false });
 },
});

export const deleteAllFiles = internalMutation({
 async handler(ctx) {
  // const tenMinsAgo = Date.now() - 10 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let files = await ctx.db
   .query("files")
   .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
   .filter((q) => q.lte(q.field("updatedAt"), thirtyDaysAgo))
   .collect();

  console.log(files);

  await Promise.all(
   files.map(async (file) => {
    await ctx.storage.delete(file.fileId);
    return await ctx.db.delete(file._id);
   })
  );
 },
});

export const toggleFavorite = mutation({
 args: {
  fileId: v.id("files"),
 },

 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   throw new ConvexError("you must be logged in to upload a file");
  }

  const file = await ctx.db.get(args.fileId);
  if (!file) {
   throw new ConvexError("file not found");
  }

  const hasAccess = await hasAccessToOrg(
   ctx,
   identity.tokenIdentifier,
   file.orgId
  );

  if (!hasAccess) {
   throw new ConvexError("you must be a member of the organization");
  }

  const user = await getUser(ctx, identity.tokenIdentifier);
  if (!user) {
   throw new ConvexError("user not found");
  }

  const favorite = await ctx.db
   .query("fevorites")
   .withIndex("by_userId_orgId_fileId", (q) =>
    q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
   )
   .first();
  if (!favorite) {
   await ctx.db.insert("fevorites", {
    fileId: file._id,
    orgId: file.orgId,
    userId: user._id,
   });
   return {
    message: "File added to favorites",
   };
  } else {
   await ctx.db.delete(favorite._id);
   return {
    message: "File removed from favorites",
   };
  }
 },
});
export const getAllFavorites = query({
 args: {
  orgId: v.string(),
 },

 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   throw new ConvexError("you must be logged in to upload a file");
  }

  // const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier);

  // if (!hasAccess) {
  //  return [];
  // }

  const user = await getUser(ctx, identity.tokenIdentifier);
  if (!user) {
   throw new ConvexError("user not found");
  }

  const favorites = await ctx.db
   .query("fevorites")
   .withIndex("by_userId_orgId_fileId", (q) =>
    q.eq("userId", user._id).eq("orgId", args.orgId)
   )
   .collect();
  return favorites;
 },
});
