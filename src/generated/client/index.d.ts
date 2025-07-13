
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model TCity
 * 
 */
export type TCity = $Result.DefaultSelection<Prisma.$TCityPayload>
/**
 * Model TEvent
 * 
 */
export type TEvent = $Result.DefaultSelection<Prisma.$TEventPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more TCities
 * const tCities = await prisma.tCity.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more TCities
   * const tCities = await prisma.tCity.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tCity`: Exposes CRUD operations for the **TCity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TCities
    * const tCities = await prisma.tCity.findMany()
    * ```
    */
  get tCity(): Prisma.TCityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tEvent`: Exposes CRUD operations for the **TEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TEvents
    * const tEvents = await prisma.tEvent.findMany()
    * ```
    */
  get tEvent(): Prisma.TEventDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.11.1
   * Query Engine version: f40f79ec31188888a2e33acda0ecc8fd10a853a9
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    TCity: 'TCity',
    TEvent: 'TEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tCity" | "tEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      TCity: {
        payload: Prisma.$TCityPayload<ExtArgs>
        fields: Prisma.TCityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TCityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TCityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          findFirst: {
            args: Prisma.TCityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TCityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          findMany: {
            args: Prisma.TCityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>[]
          }
          create: {
            args: Prisma.TCityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          createMany: {
            args: Prisma.TCityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TCityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>[]
          }
          delete: {
            args: Prisma.TCityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          update: {
            args: Prisma.TCityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          deleteMany: {
            args: Prisma.TCityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TCityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TCityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>[]
          }
          upsert: {
            args: Prisma.TCityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TCityPayload>
          }
          aggregate: {
            args: Prisma.TCityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTCity>
          }
          groupBy: {
            args: Prisma.TCityGroupByArgs<ExtArgs>
            result: $Utils.Optional<TCityGroupByOutputType>[]
          }
          count: {
            args: Prisma.TCityCountArgs<ExtArgs>
            result: $Utils.Optional<TCityCountAggregateOutputType> | number
          }
        }
      }
      TEvent: {
        payload: Prisma.$TEventPayload<ExtArgs>
        fields: Prisma.TEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          findFirst: {
            args: Prisma.TEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          findMany: {
            args: Prisma.TEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>[]
          }
          create: {
            args: Prisma.TEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          createMany: {
            args: Prisma.TEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>[]
          }
          delete: {
            args: Prisma.TEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          update: {
            args: Prisma.TEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          deleteMany: {
            args: Prisma.TEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>[]
          }
          upsert: {
            args: Prisma.TEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TEventPayload>
          }
          aggregate: {
            args: Prisma.TEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTEvent>
          }
          groupBy: {
            args: Prisma.TEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<TEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.TEventCountArgs<ExtArgs>
            result: $Utils.Optional<TEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    tCity?: TCityOmit
    tEvent?: TEventOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TCityCountOutputType
   */

  export type TCityCountOutputType = {
    events: number
  }

  export type TCityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    events?: boolean | TCityCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * TCityCountOutputType without action
   */
  export type TCityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCityCountOutputType
     */
    select?: TCityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TCityCountOutputType without action
   */
  export type TCityCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TEventWhereInput
  }


  /**
   * Models
   */

  /**
   * Model TCity
   */

  export type AggregateTCity = {
    _count: TCityCountAggregateOutputType | null
    _min: TCityMinAggregateOutputType | null
    _max: TCityMaxAggregateOutputType | null
  }

  export type TCityMinAggregateOutputType = {
    citySlug: string | null
    city: string | null
    url: string | null
    alt: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TCityMaxAggregateOutputType = {
    citySlug: string | null
    city: string | null
    url: string | null
    alt: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TCityCountAggregateOutputType = {
    citySlug: number
    city: number
    url: number
    alt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TCityMinAggregateInputType = {
    citySlug?: true
    city?: true
    url?: true
    alt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TCityMaxAggregateInputType = {
    citySlug?: true
    city?: true
    url?: true
    alt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TCityCountAggregateInputType = {
    citySlug?: true
    city?: true
    url?: true
    alt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TCityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TCity to aggregate.
     */
    where?: TCityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TCities to fetch.
     */
    orderBy?: TCityOrderByWithRelationInput | TCityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TCityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TCities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TCities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TCities
    **/
    _count?: true | TCityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TCityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TCityMaxAggregateInputType
  }

  export type GetTCityAggregateType<T extends TCityAggregateArgs> = {
        [P in keyof T & keyof AggregateTCity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTCity[P]>
      : GetScalarType<T[P], AggregateTCity[P]>
  }




  export type TCityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TCityWhereInput
    orderBy?: TCityOrderByWithAggregationInput | TCityOrderByWithAggregationInput[]
    by: TCityScalarFieldEnum[] | TCityScalarFieldEnum
    having?: TCityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TCityCountAggregateInputType | true
    _min?: TCityMinAggregateInputType
    _max?: TCityMaxAggregateInputType
  }

  export type TCityGroupByOutputType = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt: Date
    updatedAt: Date
    _count: TCityCountAggregateOutputType | null
    _min: TCityMinAggregateOutputType | null
    _max: TCityMaxAggregateOutputType | null
  }

  type GetTCityGroupByPayload<T extends TCityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TCityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TCityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TCityGroupByOutputType[P]>
            : GetScalarType<T[P], TCityGroupByOutputType[P]>
        }
      >
    >


  export type TCitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    citySlug?: boolean
    city?: boolean
    url?: boolean
    alt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    events?: boolean | TCity$eventsArgs<ExtArgs>
    _count?: boolean | TCityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tCity"]>

  export type TCitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    citySlug?: boolean
    city?: boolean
    url?: boolean
    alt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tCity"]>

  export type TCitySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    citySlug?: boolean
    city?: boolean
    url?: boolean
    alt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tCity"]>

  export type TCitySelectScalar = {
    citySlug?: boolean
    city?: boolean
    url?: boolean
    alt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TCityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"citySlug" | "city" | "url" | "alt" | "createdAt" | "updatedAt", ExtArgs["result"]["tCity"]>
  export type TCityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    events?: boolean | TCity$eventsArgs<ExtArgs>
    _count?: boolean | TCityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TCityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TCityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TCityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TCity"
    objects: {
      events: Prisma.$TEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      citySlug: string
      city: string
      url: string
      alt: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tCity"]>
    composites: {}
  }

  type TCityGetPayload<S extends boolean | null | undefined | TCityDefaultArgs> = $Result.GetResult<Prisma.$TCityPayload, S>

  type TCityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TCityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TCityCountAggregateInputType | true
    }

  export interface TCityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TCity'], meta: { name: 'TCity' } }
    /**
     * Find zero or one TCity that matches the filter.
     * @param {TCityFindUniqueArgs} args - Arguments to find a TCity
     * @example
     * // Get one TCity
     * const tCity = await prisma.tCity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TCityFindUniqueArgs>(args: SelectSubset<T, TCityFindUniqueArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TCity that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TCityFindUniqueOrThrowArgs} args - Arguments to find a TCity
     * @example
     * // Get one TCity
     * const tCity = await prisma.tCity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TCityFindUniqueOrThrowArgs>(args: SelectSubset<T, TCityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TCity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityFindFirstArgs} args - Arguments to find a TCity
     * @example
     * // Get one TCity
     * const tCity = await prisma.tCity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TCityFindFirstArgs>(args?: SelectSubset<T, TCityFindFirstArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TCity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityFindFirstOrThrowArgs} args - Arguments to find a TCity
     * @example
     * // Get one TCity
     * const tCity = await prisma.tCity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TCityFindFirstOrThrowArgs>(args?: SelectSubset<T, TCityFindFirstOrThrowArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TCities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TCities
     * const tCities = await prisma.tCity.findMany()
     * 
     * // Get first 10 TCities
     * const tCities = await prisma.tCity.findMany({ take: 10 })
     * 
     * // Only select the `citySlug`
     * const tCityWithCitySlugOnly = await prisma.tCity.findMany({ select: { citySlug: true } })
     * 
     */
    findMany<T extends TCityFindManyArgs>(args?: SelectSubset<T, TCityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TCity.
     * @param {TCityCreateArgs} args - Arguments to create a TCity.
     * @example
     * // Create one TCity
     * const TCity = await prisma.tCity.create({
     *   data: {
     *     // ... data to create a TCity
     *   }
     * })
     * 
     */
    create<T extends TCityCreateArgs>(args: SelectSubset<T, TCityCreateArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TCities.
     * @param {TCityCreateManyArgs} args - Arguments to create many TCities.
     * @example
     * // Create many TCities
     * const tCity = await prisma.tCity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TCityCreateManyArgs>(args?: SelectSubset<T, TCityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TCities and returns the data saved in the database.
     * @param {TCityCreateManyAndReturnArgs} args - Arguments to create many TCities.
     * @example
     * // Create many TCities
     * const tCity = await prisma.tCity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TCities and only return the `citySlug`
     * const tCityWithCitySlugOnly = await prisma.tCity.createManyAndReturn({
     *   select: { citySlug: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TCityCreateManyAndReturnArgs>(args?: SelectSubset<T, TCityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TCity.
     * @param {TCityDeleteArgs} args - Arguments to delete one TCity.
     * @example
     * // Delete one TCity
     * const TCity = await prisma.tCity.delete({
     *   where: {
     *     // ... filter to delete one TCity
     *   }
     * })
     * 
     */
    delete<T extends TCityDeleteArgs>(args: SelectSubset<T, TCityDeleteArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TCity.
     * @param {TCityUpdateArgs} args - Arguments to update one TCity.
     * @example
     * // Update one TCity
     * const tCity = await prisma.tCity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TCityUpdateArgs>(args: SelectSubset<T, TCityUpdateArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TCities.
     * @param {TCityDeleteManyArgs} args - Arguments to filter TCities to delete.
     * @example
     * // Delete a few TCities
     * const { count } = await prisma.tCity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TCityDeleteManyArgs>(args?: SelectSubset<T, TCityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TCities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TCities
     * const tCity = await prisma.tCity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TCityUpdateManyArgs>(args: SelectSubset<T, TCityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TCities and returns the data updated in the database.
     * @param {TCityUpdateManyAndReturnArgs} args - Arguments to update many TCities.
     * @example
     * // Update many TCities
     * const tCity = await prisma.tCity.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TCities and only return the `citySlug`
     * const tCityWithCitySlugOnly = await prisma.tCity.updateManyAndReturn({
     *   select: { citySlug: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TCityUpdateManyAndReturnArgs>(args: SelectSubset<T, TCityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TCity.
     * @param {TCityUpsertArgs} args - Arguments to update or create a TCity.
     * @example
     * // Update or create a TCity
     * const tCity = await prisma.tCity.upsert({
     *   create: {
     *     // ... data to create a TCity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TCity we want to update
     *   }
     * })
     */
    upsert<T extends TCityUpsertArgs>(args: SelectSubset<T, TCityUpsertArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TCities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityCountArgs} args - Arguments to filter TCities to count.
     * @example
     * // Count the number of TCities
     * const count = await prisma.tCity.count({
     *   where: {
     *     // ... the filter for the TCities we want to count
     *   }
     * })
    **/
    count<T extends TCityCountArgs>(
      args?: Subset<T, TCityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TCityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TCity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TCityAggregateArgs>(args: Subset<T, TCityAggregateArgs>): Prisma.PrismaPromise<GetTCityAggregateType<T>>

    /**
     * Group by TCity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TCityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TCityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TCityGroupByArgs['orderBy'] }
        : { orderBy?: TCityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TCityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTCityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TCity model
   */
  readonly fields: TCityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TCity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TCityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    events<T extends TCity$eventsArgs<ExtArgs> = {}>(args?: Subset<T, TCity$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TCity model
   */
  interface TCityFieldRefs {
    readonly citySlug: FieldRef<"TCity", 'String'>
    readonly city: FieldRef<"TCity", 'String'>
    readonly url: FieldRef<"TCity", 'String'>
    readonly alt: FieldRef<"TCity", 'String'>
    readonly createdAt: FieldRef<"TCity", 'DateTime'>
    readonly updatedAt: FieldRef<"TCity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TCity findUnique
   */
  export type TCityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter, which TCity to fetch.
     */
    where: TCityWhereUniqueInput
  }

  /**
   * TCity findUniqueOrThrow
   */
  export type TCityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter, which TCity to fetch.
     */
    where: TCityWhereUniqueInput
  }

  /**
   * TCity findFirst
   */
  export type TCityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter, which TCity to fetch.
     */
    where?: TCityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TCities to fetch.
     */
    orderBy?: TCityOrderByWithRelationInput | TCityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TCities.
     */
    cursor?: TCityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TCities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TCities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TCities.
     */
    distinct?: TCityScalarFieldEnum | TCityScalarFieldEnum[]
  }

  /**
   * TCity findFirstOrThrow
   */
  export type TCityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter, which TCity to fetch.
     */
    where?: TCityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TCities to fetch.
     */
    orderBy?: TCityOrderByWithRelationInput | TCityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TCities.
     */
    cursor?: TCityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TCities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TCities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TCities.
     */
    distinct?: TCityScalarFieldEnum | TCityScalarFieldEnum[]
  }

  /**
   * TCity findMany
   */
  export type TCityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter, which TCities to fetch.
     */
    where?: TCityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TCities to fetch.
     */
    orderBy?: TCityOrderByWithRelationInput | TCityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TCities.
     */
    cursor?: TCityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TCities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TCities.
     */
    skip?: number
    distinct?: TCityScalarFieldEnum | TCityScalarFieldEnum[]
  }

  /**
   * TCity create
   */
  export type TCityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * The data needed to create a TCity.
     */
    data: XOR<TCityCreateInput, TCityUncheckedCreateInput>
  }

  /**
   * TCity createMany
   */
  export type TCityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TCities.
     */
    data: TCityCreateManyInput | TCityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TCity createManyAndReturn
   */
  export type TCityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * The data used to create many TCities.
     */
    data: TCityCreateManyInput | TCityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TCity update
   */
  export type TCityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * The data needed to update a TCity.
     */
    data: XOR<TCityUpdateInput, TCityUncheckedUpdateInput>
    /**
     * Choose, which TCity to update.
     */
    where: TCityWhereUniqueInput
  }

  /**
   * TCity updateMany
   */
  export type TCityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TCities.
     */
    data: XOR<TCityUpdateManyMutationInput, TCityUncheckedUpdateManyInput>
    /**
     * Filter which TCities to update
     */
    where?: TCityWhereInput
    /**
     * Limit how many TCities to update.
     */
    limit?: number
  }

  /**
   * TCity updateManyAndReturn
   */
  export type TCityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * The data used to update TCities.
     */
    data: XOR<TCityUpdateManyMutationInput, TCityUncheckedUpdateManyInput>
    /**
     * Filter which TCities to update
     */
    where?: TCityWhereInput
    /**
     * Limit how many TCities to update.
     */
    limit?: number
  }

  /**
   * TCity upsert
   */
  export type TCityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * The filter to search for the TCity to update in case it exists.
     */
    where: TCityWhereUniqueInput
    /**
     * In case the TCity found by the `where` argument doesn't exist, create a new TCity with this data.
     */
    create: XOR<TCityCreateInput, TCityUncheckedCreateInput>
    /**
     * In case the TCity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TCityUpdateInput, TCityUncheckedUpdateInput>
  }

  /**
   * TCity delete
   */
  export type TCityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
    /**
     * Filter which TCity to delete.
     */
    where: TCityWhereUniqueInput
  }

  /**
   * TCity deleteMany
   */
  export type TCityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TCities to delete
     */
    where?: TCityWhereInput
    /**
     * Limit how many TCities to delete.
     */
    limit?: number
  }

  /**
   * TCity.events
   */
  export type TCity$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    where?: TEventWhereInput
    orderBy?: TEventOrderByWithRelationInput | TEventOrderByWithRelationInput[]
    cursor?: TEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TEventScalarFieldEnum | TEventScalarFieldEnum[]
  }

  /**
   * TCity without action
   */
  export type TCityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TCity
     */
    select?: TCitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TCity
     */
    omit?: TCityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TCityInclude<ExtArgs> | null
  }


  /**
   * Model TEvent
   */

  export type AggregateTEvent = {
    _count: TEventCountAggregateOutputType | null
    _avg: TEventAvgAggregateOutputType | null
    _sum: TEventSumAggregateOutputType | null
    _min: TEventMinAggregateOutputType | null
    _max: TEventMaxAggregateOutputType | null
  }

  export type TEventAvgAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type TEventSumAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type TEventMinAggregateOutputType = {
    id: number | null
    name: string | null
    slug: string | null
    city: string | null
    citySlug: string | null
    location: string | null
    date: Date | null
    organizerName: string | null
    imageUrl: string | null
    alt: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TEventMaxAggregateOutputType = {
    id: number | null
    name: string | null
    slug: string | null
    city: string | null
    citySlug: string | null
    location: string | null
    date: Date | null
    organizerName: string | null
    imageUrl: string | null
    alt: string | null
    description: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TEventCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    city: number
    citySlug: number
    location: number
    date: number
    organizerName: number
    imageUrl: number
    alt: number
    description: number
    price: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TEventAvgAggregateInputType = {
    id?: true
    price?: true
  }

  export type TEventSumAggregateInputType = {
    id?: true
    price?: true
  }

  export type TEventMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    city?: true
    citySlug?: true
    location?: true
    date?: true
    organizerName?: true
    imageUrl?: true
    alt?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TEventMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    city?: true
    citySlug?: true
    location?: true
    date?: true
    organizerName?: true
    imageUrl?: true
    alt?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TEventCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    city?: true
    citySlug?: true
    location?: true
    date?: true
    organizerName?: true
    imageUrl?: true
    alt?: true
    description?: true
    price?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TEvent to aggregate.
     */
    where?: TEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TEvents to fetch.
     */
    orderBy?: TEventOrderByWithRelationInput | TEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TEvents
    **/
    _count?: true | TEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TEventMaxAggregateInputType
  }

  export type GetTEventAggregateType<T extends TEventAggregateArgs> = {
        [P in keyof T & keyof AggregateTEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTEvent[P]>
      : GetScalarType<T[P], AggregateTEvent[P]>
  }




  export type TEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TEventWhereInput
    orderBy?: TEventOrderByWithAggregationInput | TEventOrderByWithAggregationInput[]
    by: TEventScalarFieldEnum[] | TEventScalarFieldEnum
    having?: TEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TEventCountAggregateInputType | true
    _avg?: TEventAvgAggregateInputType
    _sum?: TEventSumAggregateInputType
    _min?: TEventMinAggregateInputType
    _max?: TEventMaxAggregateInputType
  }

  export type TEventGroupByOutputType = {
    id: number
    name: string
    slug: string
    city: string
    citySlug: string
    location: string
    date: Date
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt: Date
    updatedAt: Date
    _count: TEventCountAggregateOutputType | null
    _avg: TEventAvgAggregateOutputType | null
    _sum: TEventSumAggregateOutputType | null
    _min: TEventMinAggregateOutputType | null
    _max: TEventMaxAggregateOutputType | null
  }

  type GetTEventGroupByPayload<T extends TEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TEventGroupByOutputType[P]>
            : GetScalarType<T[P], TEventGroupByOutputType[P]>
        }
      >
    >


  export type TEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    city?: boolean
    citySlug?: boolean
    location?: boolean
    date?: boolean
    organizerName?: boolean
    imageUrl?: boolean
    alt?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tEvent"]>

  export type TEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    city?: boolean
    citySlug?: boolean
    location?: boolean
    date?: boolean
    organizerName?: boolean
    imageUrl?: boolean
    alt?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tEvent"]>

  export type TEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    city?: boolean
    citySlug?: boolean
    location?: boolean
    date?: boolean
    organizerName?: boolean
    imageUrl?: boolean
    alt?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tEvent"]>

  export type TEventSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    city?: boolean
    citySlug?: boolean
    location?: boolean
    date?: boolean
    organizerName?: boolean
    imageUrl?: boolean
    alt?: boolean
    description?: boolean
    price?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "city" | "citySlug" | "location" | "date" | "organizerName" | "imageUrl" | "alt" | "description" | "price" | "createdAt" | "updatedAt", ExtArgs["result"]["tEvent"]>
  export type TEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }
  export type TEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }
  export type TEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cityData?: boolean | TCityDefaultArgs<ExtArgs>
  }

  export type $TEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TEvent"
    objects: {
      cityData: Prisma.$TCityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      slug: string
      city: string
      citySlug: string
      location: string
      date: Date
      organizerName: string
      imageUrl: string
      alt: string
      description: string
      price: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tEvent"]>
    composites: {}
  }

  type TEventGetPayload<S extends boolean | null | undefined | TEventDefaultArgs> = $Result.GetResult<Prisma.$TEventPayload, S>

  type TEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TEventCountAggregateInputType | true
    }

  export interface TEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TEvent'], meta: { name: 'TEvent' } }
    /**
     * Find zero or one TEvent that matches the filter.
     * @param {TEventFindUniqueArgs} args - Arguments to find a TEvent
     * @example
     * // Get one TEvent
     * const tEvent = await prisma.tEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TEventFindUniqueArgs>(args: SelectSubset<T, TEventFindUniqueArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TEventFindUniqueOrThrowArgs} args - Arguments to find a TEvent
     * @example
     * // Get one TEvent
     * const tEvent = await prisma.tEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TEventFindUniqueOrThrowArgs>(args: SelectSubset<T, TEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventFindFirstArgs} args - Arguments to find a TEvent
     * @example
     * // Get one TEvent
     * const tEvent = await prisma.tEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TEventFindFirstArgs>(args?: SelectSubset<T, TEventFindFirstArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventFindFirstOrThrowArgs} args - Arguments to find a TEvent
     * @example
     * // Get one TEvent
     * const tEvent = await prisma.tEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TEventFindFirstOrThrowArgs>(args?: SelectSubset<T, TEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TEvents
     * const tEvents = await prisma.tEvent.findMany()
     * 
     * // Get first 10 TEvents
     * const tEvents = await prisma.tEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tEventWithIdOnly = await prisma.tEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TEventFindManyArgs>(args?: SelectSubset<T, TEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TEvent.
     * @param {TEventCreateArgs} args - Arguments to create a TEvent.
     * @example
     * // Create one TEvent
     * const TEvent = await prisma.tEvent.create({
     *   data: {
     *     // ... data to create a TEvent
     *   }
     * })
     * 
     */
    create<T extends TEventCreateArgs>(args: SelectSubset<T, TEventCreateArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TEvents.
     * @param {TEventCreateManyArgs} args - Arguments to create many TEvents.
     * @example
     * // Create many TEvents
     * const tEvent = await prisma.tEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TEventCreateManyArgs>(args?: SelectSubset<T, TEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TEvents and returns the data saved in the database.
     * @param {TEventCreateManyAndReturnArgs} args - Arguments to create many TEvents.
     * @example
     * // Create many TEvents
     * const tEvent = await prisma.tEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TEvents and only return the `id`
     * const tEventWithIdOnly = await prisma.tEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TEventCreateManyAndReturnArgs>(args?: SelectSubset<T, TEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TEvent.
     * @param {TEventDeleteArgs} args - Arguments to delete one TEvent.
     * @example
     * // Delete one TEvent
     * const TEvent = await prisma.tEvent.delete({
     *   where: {
     *     // ... filter to delete one TEvent
     *   }
     * })
     * 
     */
    delete<T extends TEventDeleteArgs>(args: SelectSubset<T, TEventDeleteArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TEvent.
     * @param {TEventUpdateArgs} args - Arguments to update one TEvent.
     * @example
     * // Update one TEvent
     * const tEvent = await prisma.tEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TEventUpdateArgs>(args: SelectSubset<T, TEventUpdateArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TEvents.
     * @param {TEventDeleteManyArgs} args - Arguments to filter TEvents to delete.
     * @example
     * // Delete a few TEvents
     * const { count } = await prisma.tEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TEventDeleteManyArgs>(args?: SelectSubset<T, TEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TEvents
     * const tEvent = await prisma.tEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TEventUpdateManyArgs>(args: SelectSubset<T, TEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TEvents and returns the data updated in the database.
     * @param {TEventUpdateManyAndReturnArgs} args - Arguments to update many TEvents.
     * @example
     * // Update many TEvents
     * const tEvent = await prisma.tEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TEvents and only return the `id`
     * const tEventWithIdOnly = await prisma.tEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TEventUpdateManyAndReturnArgs>(args: SelectSubset<T, TEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TEvent.
     * @param {TEventUpsertArgs} args - Arguments to update or create a TEvent.
     * @example
     * // Update or create a TEvent
     * const tEvent = await prisma.tEvent.upsert({
     *   create: {
     *     // ... data to create a TEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TEvent we want to update
     *   }
     * })
     */
    upsert<T extends TEventUpsertArgs>(args: SelectSubset<T, TEventUpsertArgs<ExtArgs>>): Prisma__TEventClient<$Result.GetResult<Prisma.$TEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventCountArgs} args - Arguments to filter TEvents to count.
     * @example
     * // Count the number of TEvents
     * const count = await prisma.tEvent.count({
     *   where: {
     *     // ... the filter for the TEvents we want to count
     *   }
     * })
    **/
    count<T extends TEventCountArgs>(
      args?: Subset<T, TEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TEventAggregateArgs>(args: Subset<T, TEventAggregateArgs>): Prisma.PrismaPromise<GetTEventAggregateType<T>>

    /**
     * Group by TEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TEventGroupByArgs['orderBy'] }
        : { orderBy?: TEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TEvent model
   */
  readonly fields: TEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cityData<T extends TCityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TCityDefaultArgs<ExtArgs>>): Prisma__TCityClient<$Result.GetResult<Prisma.$TCityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TEvent model
   */
  interface TEventFieldRefs {
    readonly id: FieldRef<"TEvent", 'Int'>
    readonly name: FieldRef<"TEvent", 'String'>
    readonly slug: FieldRef<"TEvent", 'String'>
    readonly city: FieldRef<"TEvent", 'String'>
    readonly citySlug: FieldRef<"TEvent", 'String'>
    readonly location: FieldRef<"TEvent", 'String'>
    readonly date: FieldRef<"TEvent", 'DateTime'>
    readonly organizerName: FieldRef<"TEvent", 'String'>
    readonly imageUrl: FieldRef<"TEvent", 'String'>
    readonly alt: FieldRef<"TEvent", 'String'>
    readonly description: FieldRef<"TEvent", 'String'>
    readonly price: FieldRef<"TEvent", 'Int'>
    readonly createdAt: FieldRef<"TEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"TEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TEvent findUnique
   */
  export type TEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter, which TEvent to fetch.
     */
    where: TEventWhereUniqueInput
  }

  /**
   * TEvent findUniqueOrThrow
   */
  export type TEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter, which TEvent to fetch.
     */
    where: TEventWhereUniqueInput
  }

  /**
   * TEvent findFirst
   */
  export type TEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter, which TEvent to fetch.
     */
    where?: TEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TEvents to fetch.
     */
    orderBy?: TEventOrderByWithRelationInput | TEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TEvents.
     */
    cursor?: TEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TEvents.
     */
    distinct?: TEventScalarFieldEnum | TEventScalarFieldEnum[]
  }

  /**
   * TEvent findFirstOrThrow
   */
  export type TEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter, which TEvent to fetch.
     */
    where?: TEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TEvents to fetch.
     */
    orderBy?: TEventOrderByWithRelationInput | TEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TEvents.
     */
    cursor?: TEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TEvents.
     */
    distinct?: TEventScalarFieldEnum | TEventScalarFieldEnum[]
  }

  /**
   * TEvent findMany
   */
  export type TEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter, which TEvents to fetch.
     */
    where?: TEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TEvents to fetch.
     */
    orderBy?: TEventOrderByWithRelationInput | TEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TEvents.
     */
    cursor?: TEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TEvents.
     */
    skip?: number
    distinct?: TEventScalarFieldEnum | TEventScalarFieldEnum[]
  }

  /**
   * TEvent create
   */
  export type TEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * The data needed to create a TEvent.
     */
    data: XOR<TEventCreateInput, TEventUncheckedCreateInput>
  }

  /**
   * TEvent createMany
   */
  export type TEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TEvents.
     */
    data: TEventCreateManyInput | TEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TEvent createManyAndReturn
   */
  export type TEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * The data used to create many TEvents.
     */
    data: TEventCreateManyInput | TEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TEvent update
   */
  export type TEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * The data needed to update a TEvent.
     */
    data: XOR<TEventUpdateInput, TEventUncheckedUpdateInput>
    /**
     * Choose, which TEvent to update.
     */
    where: TEventWhereUniqueInput
  }

  /**
   * TEvent updateMany
   */
  export type TEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TEvents.
     */
    data: XOR<TEventUpdateManyMutationInput, TEventUncheckedUpdateManyInput>
    /**
     * Filter which TEvents to update
     */
    where?: TEventWhereInput
    /**
     * Limit how many TEvents to update.
     */
    limit?: number
  }

  /**
   * TEvent updateManyAndReturn
   */
  export type TEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * The data used to update TEvents.
     */
    data: XOR<TEventUpdateManyMutationInput, TEventUncheckedUpdateManyInput>
    /**
     * Filter which TEvents to update
     */
    where?: TEventWhereInput
    /**
     * Limit how many TEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TEvent upsert
   */
  export type TEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * The filter to search for the TEvent to update in case it exists.
     */
    where: TEventWhereUniqueInput
    /**
     * In case the TEvent found by the `where` argument doesn't exist, create a new TEvent with this data.
     */
    create: XOR<TEventCreateInput, TEventUncheckedCreateInput>
    /**
     * In case the TEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TEventUpdateInput, TEventUncheckedUpdateInput>
  }

  /**
   * TEvent delete
   */
  export type TEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
    /**
     * Filter which TEvent to delete.
     */
    where: TEventWhereUniqueInput
  }

  /**
   * TEvent deleteMany
   */
  export type TEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TEvents to delete
     */
    where?: TEventWhereInput
    /**
     * Limit how many TEvents to delete.
     */
    limit?: number
  }

  /**
   * TEvent without action
   */
  export type TEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TEvent
     */
    select?: TEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TEvent
     */
    omit?: TEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TEventInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TCityScalarFieldEnum: {
    citySlug: 'citySlug',
    city: 'city',
    url: 'url',
    alt: 'alt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TCityScalarFieldEnum = (typeof TCityScalarFieldEnum)[keyof typeof TCityScalarFieldEnum]


  export const TEventScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    city: 'city',
    citySlug: 'citySlug',
    location: 'location',
    date: 'date',
    organizerName: 'organizerName',
    imageUrl: 'imageUrl',
    alt: 'alt',
    description: 'description',
    price: 'price',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TEventScalarFieldEnum = (typeof TEventScalarFieldEnum)[keyof typeof TEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TCityWhereInput = {
    AND?: TCityWhereInput | TCityWhereInput[]
    OR?: TCityWhereInput[]
    NOT?: TCityWhereInput | TCityWhereInput[]
    citySlug?: StringFilter<"TCity"> | string
    city?: StringFilter<"TCity"> | string
    url?: StringFilter<"TCity"> | string
    alt?: StringFilter<"TCity"> | string
    createdAt?: DateTimeFilter<"TCity"> | Date | string
    updatedAt?: DateTimeFilter<"TCity"> | Date | string
    events?: TEventListRelationFilter
  }

  export type TCityOrderByWithRelationInput = {
    citySlug?: SortOrder
    city?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    events?: TEventOrderByRelationAggregateInput
  }

  export type TCityWhereUniqueInput = Prisma.AtLeast<{
    citySlug?: string
    city?: string
    AND?: TCityWhereInput | TCityWhereInput[]
    OR?: TCityWhereInput[]
    NOT?: TCityWhereInput | TCityWhereInput[]
    url?: StringFilter<"TCity"> | string
    alt?: StringFilter<"TCity"> | string
    createdAt?: DateTimeFilter<"TCity"> | Date | string
    updatedAt?: DateTimeFilter<"TCity"> | Date | string
    events?: TEventListRelationFilter
  }, "citySlug" | "city">

  export type TCityOrderByWithAggregationInput = {
    citySlug?: SortOrder
    city?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TCityCountOrderByAggregateInput
    _max?: TCityMaxOrderByAggregateInput
    _min?: TCityMinOrderByAggregateInput
  }

  export type TCityScalarWhereWithAggregatesInput = {
    AND?: TCityScalarWhereWithAggregatesInput | TCityScalarWhereWithAggregatesInput[]
    OR?: TCityScalarWhereWithAggregatesInput[]
    NOT?: TCityScalarWhereWithAggregatesInput | TCityScalarWhereWithAggregatesInput[]
    citySlug?: StringWithAggregatesFilter<"TCity"> | string
    city?: StringWithAggregatesFilter<"TCity"> | string
    url?: StringWithAggregatesFilter<"TCity"> | string
    alt?: StringWithAggregatesFilter<"TCity"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TCity"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TCity"> | Date | string
  }

  export type TEventWhereInput = {
    AND?: TEventWhereInput | TEventWhereInput[]
    OR?: TEventWhereInput[]
    NOT?: TEventWhereInput | TEventWhereInput[]
    id?: IntFilter<"TEvent"> | number
    name?: StringFilter<"TEvent"> | string
    slug?: StringFilter<"TEvent"> | string
    city?: StringFilter<"TEvent"> | string
    citySlug?: StringFilter<"TEvent"> | string
    location?: StringFilter<"TEvent"> | string
    date?: DateTimeFilter<"TEvent"> | Date | string
    organizerName?: StringFilter<"TEvent"> | string
    imageUrl?: StringFilter<"TEvent"> | string
    alt?: StringFilter<"TEvent"> | string
    description?: StringFilter<"TEvent"> | string
    price?: IntFilter<"TEvent"> | number
    createdAt?: DateTimeFilter<"TEvent"> | Date | string
    updatedAt?: DateTimeFilter<"TEvent"> | Date | string
    cityData?: XOR<TCityScalarRelationFilter, TCityWhereInput>
  }

  export type TEventOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    city?: SortOrder
    citySlug?: SortOrder
    location?: SortOrder
    date?: SortOrder
    organizerName?: SortOrder
    imageUrl?: SortOrder
    alt?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cityData?: TCityOrderByWithRelationInput
  }

  export type TEventWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    AND?: TEventWhereInput | TEventWhereInput[]
    OR?: TEventWhereInput[]
    NOT?: TEventWhereInput | TEventWhereInput[]
    name?: StringFilter<"TEvent"> | string
    city?: StringFilter<"TEvent"> | string
    citySlug?: StringFilter<"TEvent"> | string
    location?: StringFilter<"TEvent"> | string
    date?: DateTimeFilter<"TEvent"> | Date | string
    organizerName?: StringFilter<"TEvent"> | string
    imageUrl?: StringFilter<"TEvent"> | string
    alt?: StringFilter<"TEvent"> | string
    description?: StringFilter<"TEvent"> | string
    price?: IntFilter<"TEvent"> | number
    createdAt?: DateTimeFilter<"TEvent"> | Date | string
    updatedAt?: DateTimeFilter<"TEvent"> | Date | string
    cityData?: XOR<TCityScalarRelationFilter, TCityWhereInput>
  }, "id" | "slug">

  export type TEventOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    city?: SortOrder
    citySlug?: SortOrder
    location?: SortOrder
    date?: SortOrder
    organizerName?: SortOrder
    imageUrl?: SortOrder
    alt?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TEventCountOrderByAggregateInput
    _avg?: TEventAvgOrderByAggregateInput
    _max?: TEventMaxOrderByAggregateInput
    _min?: TEventMinOrderByAggregateInput
    _sum?: TEventSumOrderByAggregateInput
  }

  export type TEventScalarWhereWithAggregatesInput = {
    AND?: TEventScalarWhereWithAggregatesInput | TEventScalarWhereWithAggregatesInput[]
    OR?: TEventScalarWhereWithAggregatesInput[]
    NOT?: TEventScalarWhereWithAggregatesInput | TEventScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"TEvent"> | number
    name?: StringWithAggregatesFilter<"TEvent"> | string
    slug?: StringWithAggregatesFilter<"TEvent"> | string
    city?: StringWithAggregatesFilter<"TEvent"> | string
    citySlug?: StringWithAggregatesFilter<"TEvent"> | string
    location?: StringWithAggregatesFilter<"TEvent"> | string
    date?: DateTimeWithAggregatesFilter<"TEvent"> | Date | string
    organizerName?: StringWithAggregatesFilter<"TEvent"> | string
    imageUrl?: StringWithAggregatesFilter<"TEvent"> | string
    alt?: StringWithAggregatesFilter<"TEvent"> | string
    description?: StringWithAggregatesFilter<"TEvent"> | string
    price?: IntWithAggregatesFilter<"TEvent"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TEvent"> | Date | string
  }

  export type TCityCreateInput = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: TEventCreateNestedManyWithoutCityDataInput
  }

  export type TCityUncheckedCreateInput = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: TEventUncheckedCreateNestedManyWithoutCityDataInput
  }

  export type TCityUpdateInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: TEventUpdateManyWithoutCityDataNestedInput
  }

  export type TCityUncheckedUpdateInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: TEventUncheckedUpdateManyWithoutCityDataNestedInput
  }

  export type TCityCreateManyInput = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TCityUpdateManyMutationInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TCityUncheckedUpdateManyInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventCreateInput = {
    id: number
    name: string
    slug: string
    city: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
    cityData: TCityCreateNestedOneWithoutEventsInput
  }

  export type TEventUncheckedCreateInput = {
    id: number
    name: string
    slug: string
    city: string
    citySlug: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TEventUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cityData?: TCityUpdateOneRequiredWithoutEventsNestedInput
  }

  export type TEventUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    citySlug?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventCreateManyInput = {
    id: number
    name: string
    slug: string
    city: string
    citySlug: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TEventUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    citySlug?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TEventListRelationFilter = {
    every?: TEventWhereInput
    some?: TEventWhereInput
    none?: TEventWhereInput
  }

  export type TEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TCityCountOrderByAggregateInput = {
    citySlug?: SortOrder
    city?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TCityMaxOrderByAggregateInput = {
    citySlug?: SortOrder
    city?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TCityMinOrderByAggregateInput = {
    citySlug?: SortOrder
    city?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type TCityScalarRelationFilter = {
    is?: TCityWhereInput
    isNot?: TCityWhereInput
  }

  export type TEventCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    city?: SortOrder
    citySlug?: SortOrder
    location?: SortOrder
    date?: SortOrder
    organizerName?: SortOrder
    imageUrl?: SortOrder
    alt?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TEventAvgOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type TEventMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    city?: SortOrder
    citySlug?: SortOrder
    location?: SortOrder
    date?: SortOrder
    organizerName?: SortOrder
    imageUrl?: SortOrder
    alt?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TEventMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    city?: SortOrder
    citySlug?: SortOrder
    location?: SortOrder
    date?: SortOrder
    organizerName?: SortOrder
    imageUrl?: SortOrder
    alt?: SortOrder
    description?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TEventSumOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TEventCreateNestedManyWithoutCityDataInput = {
    create?: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput> | TEventCreateWithoutCityDataInput[] | TEventUncheckedCreateWithoutCityDataInput[]
    connectOrCreate?: TEventCreateOrConnectWithoutCityDataInput | TEventCreateOrConnectWithoutCityDataInput[]
    createMany?: TEventCreateManyCityDataInputEnvelope
    connect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
  }

  export type TEventUncheckedCreateNestedManyWithoutCityDataInput = {
    create?: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput> | TEventCreateWithoutCityDataInput[] | TEventUncheckedCreateWithoutCityDataInput[]
    connectOrCreate?: TEventCreateOrConnectWithoutCityDataInput | TEventCreateOrConnectWithoutCityDataInput[]
    createMany?: TEventCreateManyCityDataInputEnvelope
    connect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TEventUpdateManyWithoutCityDataNestedInput = {
    create?: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput> | TEventCreateWithoutCityDataInput[] | TEventUncheckedCreateWithoutCityDataInput[]
    connectOrCreate?: TEventCreateOrConnectWithoutCityDataInput | TEventCreateOrConnectWithoutCityDataInput[]
    upsert?: TEventUpsertWithWhereUniqueWithoutCityDataInput | TEventUpsertWithWhereUniqueWithoutCityDataInput[]
    createMany?: TEventCreateManyCityDataInputEnvelope
    set?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    disconnect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    delete?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    connect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    update?: TEventUpdateWithWhereUniqueWithoutCityDataInput | TEventUpdateWithWhereUniqueWithoutCityDataInput[]
    updateMany?: TEventUpdateManyWithWhereWithoutCityDataInput | TEventUpdateManyWithWhereWithoutCityDataInput[]
    deleteMany?: TEventScalarWhereInput | TEventScalarWhereInput[]
  }

  export type TEventUncheckedUpdateManyWithoutCityDataNestedInput = {
    create?: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput> | TEventCreateWithoutCityDataInput[] | TEventUncheckedCreateWithoutCityDataInput[]
    connectOrCreate?: TEventCreateOrConnectWithoutCityDataInput | TEventCreateOrConnectWithoutCityDataInput[]
    upsert?: TEventUpsertWithWhereUniqueWithoutCityDataInput | TEventUpsertWithWhereUniqueWithoutCityDataInput[]
    createMany?: TEventCreateManyCityDataInputEnvelope
    set?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    disconnect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    delete?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    connect?: TEventWhereUniqueInput | TEventWhereUniqueInput[]
    update?: TEventUpdateWithWhereUniqueWithoutCityDataInput | TEventUpdateWithWhereUniqueWithoutCityDataInput[]
    updateMany?: TEventUpdateManyWithWhereWithoutCityDataInput | TEventUpdateManyWithWhereWithoutCityDataInput[]
    deleteMany?: TEventScalarWhereInput | TEventScalarWhereInput[]
  }

  export type TCityCreateNestedOneWithoutEventsInput = {
    create?: XOR<TCityCreateWithoutEventsInput, TCityUncheckedCreateWithoutEventsInput>
    connectOrCreate?: TCityCreateOrConnectWithoutEventsInput
    connect?: TCityWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TCityUpdateOneRequiredWithoutEventsNestedInput = {
    create?: XOR<TCityCreateWithoutEventsInput, TCityUncheckedCreateWithoutEventsInput>
    connectOrCreate?: TCityCreateOrConnectWithoutEventsInput
    upsert?: TCityUpsertWithoutEventsInput
    connect?: TCityWhereUniqueInput
    update?: XOR<XOR<TCityUpdateToOneWithWhereWithoutEventsInput, TCityUpdateWithoutEventsInput>, TCityUncheckedUpdateWithoutEventsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TEventCreateWithoutCityDataInput = {
    id: number
    name: string
    slug: string
    city: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TEventUncheckedCreateWithoutCityDataInput = {
    id: number
    name: string
    slug: string
    city: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TEventCreateOrConnectWithoutCityDataInput = {
    where: TEventWhereUniqueInput
    create: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput>
  }

  export type TEventCreateManyCityDataInputEnvelope = {
    data: TEventCreateManyCityDataInput | TEventCreateManyCityDataInput[]
    skipDuplicates?: boolean
  }

  export type TEventUpsertWithWhereUniqueWithoutCityDataInput = {
    where: TEventWhereUniqueInput
    update: XOR<TEventUpdateWithoutCityDataInput, TEventUncheckedUpdateWithoutCityDataInput>
    create: XOR<TEventCreateWithoutCityDataInput, TEventUncheckedCreateWithoutCityDataInput>
  }

  export type TEventUpdateWithWhereUniqueWithoutCityDataInput = {
    where: TEventWhereUniqueInput
    data: XOR<TEventUpdateWithoutCityDataInput, TEventUncheckedUpdateWithoutCityDataInput>
  }

  export type TEventUpdateManyWithWhereWithoutCityDataInput = {
    where: TEventScalarWhereInput
    data: XOR<TEventUpdateManyMutationInput, TEventUncheckedUpdateManyWithoutCityDataInput>
  }

  export type TEventScalarWhereInput = {
    AND?: TEventScalarWhereInput | TEventScalarWhereInput[]
    OR?: TEventScalarWhereInput[]
    NOT?: TEventScalarWhereInput | TEventScalarWhereInput[]
    id?: IntFilter<"TEvent"> | number
    name?: StringFilter<"TEvent"> | string
    slug?: StringFilter<"TEvent"> | string
    city?: StringFilter<"TEvent"> | string
    citySlug?: StringFilter<"TEvent"> | string
    location?: StringFilter<"TEvent"> | string
    date?: DateTimeFilter<"TEvent"> | Date | string
    organizerName?: StringFilter<"TEvent"> | string
    imageUrl?: StringFilter<"TEvent"> | string
    alt?: StringFilter<"TEvent"> | string
    description?: StringFilter<"TEvent"> | string
    price?: IntFilter<"TEvent"> | number
    createdAt?: DateTimeFilter<"TEvent"> | Date | string
    updatedAt?: DateTimeFilter<"TEvent"> | Date | string
  }

  export type TCityCreateWithoutEventsInput = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TCityUncheckedCreateWithoutEventsInput = {
    citySlug: string
    city: string
    url: string
    alt: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TCityCreateOrConnectWithoutEventsInput = {
    where: TCityWhereUniqueInput
    create: XOR<TCityCreateWithoutEventsInput, TCityUncheckedCreateWithoutEventsInput>
  }

  export type TCityUpsertWithoutEventsInput = {
    update: XOR<TCityUpdateWithoutEventsInput, TCityUncheckedUpdateWithoutEventsInput>
    create: XOR<TCityCreateWithoutEventsInput, TCityUncheckedCreateWithoutEventsInput>
    where?: TCityWhereInput
  }

  export type TCityUpdateToOneWithWhereWithoutEventsInput = {
    where?: TCityWhereInput
    data: XOR<TCityUpdateWithoutEventsInput, TCityUncheckedUpdateWithoutEventsInput>
  }

  export type TCityUpdateWithoutEventsInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TCityUncheckedUpdateWithoutEventsInput = {
    citySlug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventCreateManyCityDataInput = {
    id: number
    name: string
    slug: string
    city: string
    location: string
    date: Date | string
    organizerName: string
    imageUrl: string
    alt: string
    description: string
    price: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TEventUpdateWithoutCityDataInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventUncheckedUpdateWithoutCityDataInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TEventUncheckedUpdateManyWithoutCityDataInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    organizerName?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    alt?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}