export type ClientType = {
  Preferences?: Record<string, any>
  Functions?: string[]
  Buckets?: string[]
  Databases?: Record<string, Record<string, Record<string, any>>>
}