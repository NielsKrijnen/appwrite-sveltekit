import { ClientType } from "./types";
import { Client, Tokens, Users } from "node-appwrite";

export class AdminClient<T extends ClientType> {
  public client: Client

  constructor(endpoint: string, project: string, key: string) {
    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(key)
    ;
  }

  get tokens() {
    const tokens = new Tokens(this.client)

    type Bucket = T extends { Buckets: string[] } ? T["Buckets"][number] : string

    return {
      get raw() {
        return tokens
      },

      list(params: { bucket: Bucket, file: string, queries?: string[] }) {
        return tokens.list({
          bucketId: params.bucket,
          fileId: params.file,
          queries: params.queries
        })
      },

      create(params: { bucket: Bucket, file: string, expire?: string }) {
        return tokens.createFileToken({
          bucketId: params.bucket,
          fileId: params.file,
          expire: params.file
        })
      },

      get(id: string) {
        return tokens.get({ tokenId: id })
      },

      update(params: { id: string, expire?: string }) {
        return tokens.update({
          tokenId: params.id,
          expire: params.expire
        })
      },

      async delete(id: string) {
        await tokens.delete({ tokenId: id })
      }
    }
  }

  get users() {
    const users = new Users(this.client)

    type Preferences = T extends { Preferences: Record<string, any> } ? T["Preferences"] : Record<string, any>

    return {
      get raw() {
        return users
      },

      list(params?: { queries?: string[], search?: string }) {
        return users.list<Preferences>(params)
      },

      create(params: {
        id: string
        email?: string
        phone?: string
        password?: string
        name?: string
      }) {
        return users.create<Preferences>({
          userId: params.id,
          email: params.email,
          phone: params.phone,
          password: params.password,
          name: params.name
        })
      },

      createArgon2(params: {
        id: string
        email: string
        password: string
        name?: string
      }) {
        return users.createArgon2User<Preferences>({
          userId: params.id,
          email: params.email,
          password: params.password,
          name: params.name
        })
      },

      createBcrypt(params: {
        id: string
        email: string
        password: string
        name?: string
      }) {
        return users.createBcryptUser<Preferences>({
          userId: params.id,
          email: params.email,
          password: params.password,
          name: params.name
        })
      },

      listIdentities: users.listIdentities,
      deleteIdentity: users.deleteIdentity
    }
  }
}