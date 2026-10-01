import { describe, expect, it } from 'vitest'
import { checksumFor, formatLicenseKey, normalizeLicenseKey, validateLicenseKey } from './license'

function makeKey(payload: string): string {
  return `MDPE-${payload.slice(0, 6)}-${payload.slice(6, 12)}-${checksumFor(payload)}`
}

describe(`license key`, () => {
  it(`accepts a correctly checksummed key`, () => {
    const key = makeKey(`ABCDEFGHJKMN`)
    expect(validateLicenseKey(key)).toBe(true)
  })

  it(`is case-insensitive and dash-insensitive`, () => {
    const key = makeKey(`ABCDEFGHJKMN`)
    expect(validateLicenseKey(key.toLowerCase().replace(/-/g, ` `))).toBe(true)
  })

  it(`rejects tampered checksum`, () => {
    const key = makeKey(`ABCDEFGHJKMN`)
    const bad = `${key.slice(0, -1)}${key.endsWith(`A`) ? `B` : `A`}`
    expect(validateLicenseKey(bad)).toBe(false)
  })

  it(`rejects wrong prefix / length / alphabet`, () => {
    expect(validateLicenseKey(`XXXX-ABCDEFGH-JKLMNP-${checksumFor(`ABCDEFGHJKMN`)}`)).toBe(false)
    expect(validateLicenseKey(`MDPE-ABC`)).toBe(false)
    expect(validateLicenseKey(`MDPE-012345-6789AB-${checksumFor(`ABCDEFGHJKMN`)}`)).toBe(false)
    expect(validateLicenseKey(``)).toBe(false)
  })

  it(`formats keys as MDPE-XXXXXX-XXXXXX-CCCCCC`, () => {
    const key = makeKey(`ABCDEFGHJKMN`)
    expect(formatLicenseKey(key.replace(/-/g, ``))).toBe(key)
  })

  it(`normalize strips noise`, () => {
    expect(normalizeLicenseKey(` mdpe-abc `)).toBe(`MDPEABC`)
  })
})
