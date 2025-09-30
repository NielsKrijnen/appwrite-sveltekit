import {
  Account,
  Avatars,
  Client,
  Functions,
  Graphql,
  Locale,
  Messaging,
  TablesDB,
  Storage,
  Teams,
  ExecutionMethod
} from "appwrite"
import { SharedClientType } from "./types";

export class SharedClient<T extends SharedClientType> {
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
    const avatars = new Avatars(this.client)

    return {
      get raw() {
        return avatars
      }
    }
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

    return {
      get raw() {
        return db
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