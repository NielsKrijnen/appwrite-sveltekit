import {
  Account,
  Avatars,
  Client,
  ExecutionMethod,
  Functions,
  Graphql,
  ID,
  Locale,
  Messaging,
  type Models,
  Storage,
  TablesDB,
  Teams
} from "appwrite"
import { ClientType } from "./types";

export class SharedClient<T extends ClientType> {
  private readonly COOKIE: `a_session_${string}`

  public client: Client

  constructor(endpoint: string, project: string, options?: {
    cookies?: {
      get(name: string): string | undefined
    }
  }) {
    this.COOKIE = `a_session_${project}` as const

    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
    ;
    const session = options?.cookies?.get(`a_session_${project}`)
    if (session) this.setSession(session)
  }

  setSession(session: string) {
    this.client.setSession(session)
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("cookieFallback", JSON.stringify({
        [this.COOKIE]: session
      }))
    }
  }

  get account() {
    const account = new Account(this.client)
    type Preferences = T extends { Preferences: Record<string, any> } ? T["Preferences"] : Record<string, any>

    return {
      get raw() {
        return account
      },

      get() {
        return account.get<Preferences>()
      },

      create(user: {
        id: string
        email: string
        password: string
        name?: string
      }) {
        return account.create<Preferences>({
          userId: user.id,
          email: user.email,
          password: user.password,
          name: user.name
        })
      },

      updateEmail(params: { email: string, password: string }) {
        return account.updateEmail<Preferences>(params)
      }
    }
  }

  get avatars() {
    return new Avatars(this.client)
  }

  get functions() {
    const functions = new Functions(this.client)
    type Function = T extends { Functions: string[] } ? T["Functions"][number] : string

    return {
      get raw() {
        return functions
      },

      listExecutions(params: { function: Function, queries?: string[] }) {
        return functions.listExecutions({ functionId: params.function, ...params })
      },
      createExecution(params: {
        function: Function,
        body?: string
        async?: boolean
        xpath?: string
        method?: ExecutionMethod
        headers?: object
        scheduledAt?: string
      }) {
        return functions.createExecution({ functionId: params.function, ...params })
      },
      getExecution(params: { function: Function, execution: string }) {
        return functions.getExecution({ functionId: params.function, executionId: params.execution })
      }
    }
  }

  get graphql() {
    const graphql = new Graphql(this.client)

    return {
      get raw() {
        return graphql
      }
    }
  }

  get locale() {
    const locale = new Locale(this.client)

    return {
      get raw() {
        return locale
      }
    }
  }

  get messaging() {
    const messaging = new Messaging(this.client)

    return {
      get raw() {
        return messaging
      }
    }
  }

  get storage() {
    const storage = new Storage(this.client)

    return {
      get raw() {
        return storage
      }
    }
  }

  get db() {
    const db = new TablesDB(this.client)
    type Databases = T extends { Databases: Record<string, any> } ? keyof T["Databases"] : string
    type Tables<DB extends Databases> = T extends { Databases: Record<DB, Record<string, any>> } ? keyof T["Databases"][DB] : string
    type Row<DB extends Databases, TB extends Tables<DB>> = T extends { Databases: Record<DB, Record<TB, Record<string, any>>> } ? T["Databases"][DB][TB] : Record<string, any>

    return {
      get raw() {
        return db
      },

      listRows<DB extends Databases, TB extends Tables<DB>>(database: Databases, table: TB, queries?: string[]) {
        return db.listRows<Row<DB, TB> & Models.Row>({
          databaseId: database,
          tableId: table as string,
          queries
        })
      },

      getRow<DB extends Databases, TB extends Tables<DB>>(database: Databases, table: TB, row: string, queries?: string[]) {
        return db.getRow<Row<DB, TB> & Models.Row>({
          databaseId: database,
          tableId: table as string,
          rowId: row,
          queries
        })
      },

      createRow<DB extends Databases, TB extends Tables<DB>>(database: Databases, table: TB, data: Row<DB, TB>, permissions?: string[]) {
        return db.createRow({
          databaseId: database,
          tableId: table as string,
          rowId: ID.unique(),
          data,
          permissions
        }) as Promise<Row<DB, TB> & Models.Row>
      },

      updateRow<DB extends Databases, TB extends Tables<DB>>(database: Databases, table: TB, id: string, data: Partial<Row<DB, TB>> | Row<DB, TB>, permissions?: string[]) {
        return db.updateRow({
          databaseId: database,
          tableId: table as string,
          rowId: id,
          data,
          permissions
        }) as Promise<Row<DB, TB> & Models.Row>
      },

      async deleteRow<DB extends Databases, TB extends Tables<DB>>(database: DB, table: TB, id: string) {
        await db.deleteRow({
          databaseId: database,
          tableId: table as string,
          rowId: id
        })
      },

      upsertRow<DB extends Databases, TB extends Tables<DB>>(database: DB, table: TB, id: string, data: Partial<Row<DB, TB>> | Row<DB, TB>, permissions?: string[]) {
        return db.upsertRow({
          databaseId: database,
          tableId: table as string,
          rowId: id,
          data,
          permissions
        }) as Promise<Row<DB, TB> & Models.Row>
      },

      decrementRowColumn<DB extends Databases, TB extends Tables<DB>>(params: {
        database: DB,
        table: TB,
        id: string,
        column: keyof Row<DB, TB>,
        value?: number,
        min?: number
      }) {
        return db.decrementRowColumn<Row<DB, TB> & Models.Row>({
          databaseId: params.database,
          tableId: params.table as string,
          rowId: params.id,
          column: params.column as string,
          value: params.value,
          min: params.min
        })
      },

      incrementRowColumn<DB extends Databases, TB extends Tables<DB>>(params: {
        database: DB,
        table: TB,
        id: string,
        column: keyof Row<DB, TB>,
        value?: number,
        max?: number
      }) {
        return db.incrementRowColumn<Row<DB, TB> & Models.Row>({
          databaseId: params.database,
          tableId: params.table as string,
          rowId: params.id,
          column: params.column as string,
          value: params.value,
          max: params.max
        })
      }
    }
  }

  get teams() {
    const teams = new Teams(this.client)

    return {
      get raw() {
        return teams
      }
    }
  }
}