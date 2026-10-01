import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { normalizeMarkdownForPlatform } from '@/lib/platform/normalize'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { EXPORT_LAYOUT_CSS } from '@/services/export/apply-export-layout'
import { getHtmlContent } from '@/services/export/html-content'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from '@/services/export/share-styles'
import { usePostStore } from '@/stores/post'

/**
 * Pro feature registry + implementations.
 *
 * Free tier = the three platform tabs (wechat / zhihu / juejin).
 * Pro unlocks the features below. Features not yet implemented are
 * flagged `available: false` and shown locked in the license dialog.
 */

export type ProFeatureId = `multi-export` | `style-presets` | `no-branding`

export interface ProFeatureMeta {
  id: ProFeatureId
  available: boolean
}

export const PRO_FEATURES: ProFeatureMeta[] = [
  { id: `multi-export`, available: true },
  { id: `style-presets`, available: false },
  { id: `no-branding`, available: false },
]

export function isProFeatureAvailable(id: ProFeatureId): boolean {
  return PRO_FEATURES.find(f => f.id === id)?.available ?? false
}

/** Standalone wechat-styled HTML, same shell as the regular HTML export. */
async function buildWechatHtml(title: string): Promise<string> {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent({ staticLayout: true })
  const stylesToAdd = await getStylesToAdd()
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitizeTitle(title)}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
  <style>${EXPORT_LAYOUT_CSS}</style>
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${htmlStr}
  </div>
</body>
</html>`
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement(`a`)
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Pro: one-click export of the current post for all three platforms.
 * Produces a zip: <title>-微信.html, <title>-知乎.md, <title>-掘金.md.
 */
export async function exportAllPlatforms(): Promise<void> {
  const postStore = usePostStore()
  const post = postStore.currentPost
  if (!post)
    return

  const safeTitle = sanitizeTitle(post.title || `untitled`)
  const raw = post.content ?? ``
  const { strToU8, zip } = await import(`fflate`)

  const files: Record<string, Uint8Array> = {
    [`${safeTitle}-微信.html`]: strToU8(await buildWechatHtml(safeTitle)),
    [`${safeTitle}-知乎.md`]: strToU8(normalizeMarkdownForPlatform(raw, `zhihu`)),
    [`${safeTitle}-掘金.md`]: strToU8(normalizeMarkdownForPlatform(raw, `juejin`)),
  }

  const data = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
    zip(files, (err, out) => (err ? reject(err) : resolve(out as Uint8Array<ArrayBuffer>)))
  })
  downloadBlob(new Blob([data], { type: `application/zip` }), `${safeTitle}-三平台.zip`)
}
