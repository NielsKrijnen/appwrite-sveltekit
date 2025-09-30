import { CookieSerializeOptions } from "cookie";
import { Client, Account } from "node-appwrite";
import type { Models } from "appwrite";

type SSRClientOptions = {
  cookies?: {
    set?(name: string, value: string, opts: CookieSerializeOptions & { path: string }): void
  }
}

export class SSRClient {
  public client: Client
  public account: Account
  private options?: SSRClientOptions
  private readonly COOKIE: `a_session_${string}`

  constructor(endpoint: string, project: string, key: string, options?: SSRClientOptions) {
    this.COOKIE = `a_session_${project}` as const
    this.options = options
    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(key)
    ;
    this.account = new Account(this.client)
  }

  private setCookie(session: Models.Session) {
    if (this.options?.cookies?.set) {
      this.options.cookies.set(this.COOKIE, session.secret, {
        sameSite: "strict",
        expires: new Date(session.expire),
        secure: true,
        path: "/"
      })
    }
  }

  async createSession(params: { user: string, secret: string }) {
    const session = await this.account.createSession({
      userId: params.user,
      secret: params.secret
    })
    this.setCookie(session)
    return session
  }

  async createEmailPasswordSession(params: { email: string, password: string }) {
    const session = await this.account.createEmailPasswordSession(params)
    this.setCookie(session)
    return session
  }

  async createAnonymousSession() {
    const session = await this.account.createAnonymousSession()
    this.setCookie(session)
    return session
  }
}