/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as coupons from "../coupons.js";
import type * as files from "../files.js";
import type * as generated_api from "../generated/api.js";
import type * as generated_server from "../generated/server.js";
import type * as orders from "../orders.js";
<<<<<<< HEAD
import type * as packs from "../packs.js";
=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
import type * as products from "../products.js";
import type * as shipping from "../shipping.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  coupons: typeof coupons;
  files: typeof files;
  "generated/api": typeof generated_api;
  "generated/server": typeof generated_server;
  orders: typeof orders;
<<<<<<< HEAD
  packs: typeof packs;
=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
  products: typeof products;
  shipping: typeof shipping;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
