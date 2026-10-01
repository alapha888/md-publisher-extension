import { computed, ref } from 'vue'

/**
 * Pro license key management (offline validation, v1).
 *
 * Key format: MDPE-XXXXXX-XXXXXX-CCCCCC
 * - `MDPE` product prefix
 * - 12 payload chars + 6 checksum chars, Crockford-style base32
 *   (no 0/O/1/I/L to avoid transcription mistakes)
 * - checksum = FNV-1a(SECRET + payload), base32-encoded
 *
 * Security note: offline validation is obfuscation-grade, not real DRM.
 * It keeps honest users honest; anyone reading this file can mint keys.
 * Server-side verification is planned for v2 (after first revenue).
 */

const ALPHABET = `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
const PREFIX = `MDPE`
const PAYLOAD_LEN = 12
const CHECKSUM_LEN = 6
const SECRET = `mdpe-pro-v1-2026`

function fnv1a(str: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Checksum for a 12-char payload. Exported for the (private) key generator. */
export function checksumFor(payload: string): string {
  let h = fnv1a(SECRET + payload)
  let out = ``
  for (let i = 0; i < CHECKSUM_LEN; i++) {
    out += ALPHABET[h & 31]
    h >>>= 5
  }
  return out
}

/** Uppercase + strip everything that is not A-Z0-9. */
export function normalizeLicenseKey(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, ``)
}

function isAlphabet(s: string): boolean {
  for (const c of s) {
    if (!ALPHABET.includes(c))
      return false
  }
  return true
}

export function validateLicenseKey(input: string): boolean {
  const raw = normalizeLicenseKey(input)
  if (raw.length !== PREFIX.length + PAYLOAD_LEN + CHECKSUM_LEN)
    return false
  if (!raw.startsWith(PREFIX))
    return false
  const payload = raw.slice(PREFIX.length, PREFIX.length + PAYLOAD_LEN)
  const check = raw.slice(PREFIX.length + PAYLOAD_LEN)
  if (!isAlphabet(payload) || !isAlphabet(check))
    return false
  return checksumFor(payload) === check
}

/** Pretty-print: MDPE-XXXXXX-XXXXXX-CCCCCC (returns input as-is when invalid). */
export function formatLicenseKey(input: string): string {
  const raw = normalizeLicenseKey(input)
  if (!validateLicenseKey(raw))
    return input.trim()
  return `${PREFIX}-${raw.slice(4, 10)}-${raw.slice(10, 16)}-${raw.slice(16, 22)}`
}

const STORAGE_KEY = `mdpe.pro.license`

/**
 * Pro purchase page URL (Afdian item). Empty until the product page is live;
 * the buy button in LicenseDialog is hidden while this is empty.
 */
export const PRO_PURCHASE_URL = ``

interface ExtensionStorageArea {
  get: (key: string) => Promise<Record<string, unknown>>
  set: (items: Record<string, unknown>) => Promise<void>
  remove: (key: string) => Promise<void>
}

/** chrome.storage.local when running as an extension, otherwise null. */
function getExtensionStorage(): ExtensionStorageArea | null {
  try {
    const c = (globalThis as { chrome?: { storage?: { local?: ExtensionStorageArea } } }).chrome
    return c?.storage?.local ?? null
  }
  catch {
    return null
  }
}

async function readStored(): Promise<string | null> {
  const ext = getExtensionStorage()
  if (ext) {
    try {
      const got = await ext.get(STORAGE_KEY)
      const v = got?.[STORAGE_KEY]
      return typeof v === `string` ? v : null
    }
    catch {
      return null
    }
  }
  try {
    return localStorage.getItem(STORAGE_KEY)
  }
  catch {
    return null
  }
}

async function writeStored(key: string): Promise<void> {
  const ext = getExtensionStorage()
  if (ext) {
    await ext.set({ [STORAGE_KEY]: key })
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, key)
  }
  catch {
    // storage unavailable (private mode etc.): keep in-memory only
  }
}

async function clearStored(): Promise<void> {
  const ext = getExtensionStorage()
  if (ext) {
    try {
      await ext.remove(STORAGE_KEY)
    }
    catch {
      // ignore
    }
    return
  }
  try {
    localStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // ignore
  }
}

const licenseKey = ref<string | null>(null)
const licenseReady = ref(false)
let initPromise: Promise<void> | null = null

function initLicense(): Promise<void> {
  if (!initPromise) {
    initPromise = readStored().then((stored) => {
      licenseKey.value = stored && validateLicenseKey(stored) ? stored : null
      licenseReady.value = true
    })
  }
  return initPromise
}

export function useLicense() {
  const isPro = computed(() => licenseKey.value !== null && validateLicenseKey(licenseKey.value))

  async function activate(input: string): Promise<boolean> {
    if (!validateLicenseKey(input))
      return false
    const key = formatLicenseKey(input)
    await writeStored(key)
    licenseKey.value = key
    return true
  }

  async function deactivate(): Promise<void> {
    await clearStored()
    licenseKey.value = null
  }

  return { licenseKey, licenseReady, isPro, initLicense, activate, deactivate }
}
