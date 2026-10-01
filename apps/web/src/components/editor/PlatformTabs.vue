<script setup lang="ts">
import type { ExportPlatform } from '@/stores/platform'
import { Download, Lock } from '@lucide/vue'
import { useLicense } from '@/lib/license'
import { exportAllPlatforms } from '@/lib/pro'
import { PLATFORM_META, PLATFORM_ORDER, usePlatformStore } from '@/stores/platform'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const platformStore = usePlatformStore()
const uiStore = useUIStore()
const { isPro, initLicense } = useLicense()
const { toggleShowLicenseDialog } = uiStore

const { platform } = storeToRefs(platformStore)

initLicense()

function select(p: ExportPlatform) {
  platformStore.setPlatform(p)
}

const isExporting = ref(false)

async function onExportAll() {
  if (!isPro.value) {
    toggleShowLicenseDialog(true)
    return
  }
  if (isExporting.value)
    return
  isExporting.value = true
  try {
    await exportAllPlatforms()
    toast.success(t(`pro.exportAllDone`))
  }
  catch {
    toast.error(t(`pro.exportAllFailed`))
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <!-- 发布平台切换：只决定右侧预览区展示微信渲染还是干净 Markdown，不动编辑器与原有逻辑 -->
  <div class="flex items-center gap-1 border-b px-3 py-1.5" role="tablist" aria-label="export platform">
    <button
      v-for="p in PLATFORM_ORDER"
      :key="p"
      role="tab"
      :aria-selected="platform === p"
      :title="PLATFORM_META[p].hint"
      class="cursor-pointer rounded-md px-3 py-1 text-xs transition-colors"
      :class="platform === p
        ? `bg-primary text-primary-foreground font-medium`
        : `text-muted-foreground hover:bg-muted hover:text-foreground`"
      @click="select(p)"
    >
      {{ t(`platform.${p}`) }}
    </button>
    <div class="ml-auto">
      <button
        :title="t('pro.exportAllHint')"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors"
        :class="isPro
          ? `border-primary/40 text-primary hover:bg-primary/10`
          : `border-dashed text-muted-foreground hover:bg-muted hover:text-foreground`"
        :disabled="isExporting"
        @click="onExportAll"
      >
        <Download v-if="isPro" class="size-3.5" />
        <Lock v-else class="size-3.5" />
        {{ t('pro.exportAll') }}
        <span
          v-if="!isPro"
          class="rounded bg-amber-500/15 px-1 py-px text-[10px] font-semibold text-amber-600 dark:text-amber-400"
        >PRO</span>
      </button>
    </div>
  </div>
</template>
