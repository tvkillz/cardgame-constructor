import { appConfig } from '@/config'

/** Content pack / registry id — scopes auth and API calls to this site. */
export function getSiteId(): string {
  return appConfig.siteId
}

/** Public site URL from manifest (not the shared backend API URL). */
export function getSitePublicUrl(): string {
  return appConfig.domain.siteUrl
}
