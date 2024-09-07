import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

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
  user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

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

// export const getFiles = query({
//  args: {
//   orgId: v.string(),
//  },
//  async handler(ctx, args) {
//   const identity = await ctx.auth.getUserIdentity();
//   if (!identity) {
//    return [];
//   }
//   const hasAccess = await hasAccessToOrg(
//    ctx,
//    identity.tokenIdentifier,
//    args.orgId
//   );
//   if (!hasAccess) {
//    return [];
//   }
//   return ctx.db
//    .query("files")
//    .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
//    .collect();
//  },
// });

export const getFiles = query({
 args: {
  orgId: v.string(),
  query: v.optional(v.string()),
  favorite: v.optional(v.boolean()),
 },
 async handler(ctx, args) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
   return [];
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
   const user = await getUser(ctx, identity.tokenIdentifier);
   const favorites = await ctx.db
    .query("fevorites")
    .withIndex("by_userId_orgId_fileId", (q) =>
     q.eq("userId", user._id).eq("orgId", args.orgId)
    )
    .collect();
   files = files.filter((file) => favorites.some((f) => f.fileId === file._id));
  }

  const filesWithUrl = await Promise.all(
   files.map(async (file) => ({
    ...file,
    url: await ctx.storage.getUrl(file.fileId),
   }))
  );

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
  await ctx.db.delete(args.fileId);
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
