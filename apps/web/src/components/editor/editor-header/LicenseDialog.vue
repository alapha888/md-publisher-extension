<script setup lang="ts">
import { Check, KeyRound, Lock } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Button } from '@/components/ui/button'
import { useLicense } from '@/lib/license'
import { PRO_FEATURES } from '@/lib/pro'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const { isPro, licenseKey, initLicense, activate, deactivate } = useLicense()

initLicense()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const keyInput = ref(``)
const activating = ref(false)
const activateError = ref(false)

watch(() => props.open, (open) => {
  if (open) {
    keyInput.value = ``
    activateError.value = false
  }
})

async function onActivate() {
  if (!keyInput.value.trim() || activating.value)
    return
  activating.value = true
  activateError.value = false
  try {
    const ok = await activate(keyInput.value.trim())
    if (!ok)
      activateError.value = true
  }
  finally {
    activating.value = false
  }
}

async function onDeactivate() {
  await deactivate()
}

function maskedKey(): string {
  const k = licenseKey.value ?? ``
  return k.length > 8 ? `${k.slice(0, 9)}…${k.slice(-6)}` : k
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('license.title')"
    :description="t('license.description')"
    :icon="KeyRound"
  >
    <div class="space-y-4 px-4 py-4 sm:px-6">
      <!-- Pro feature list -->
      <ul class="space-y-2 text-left">
        <li
          v-for="f in PRO_FEATURES"
          :key="f.id"
          class="flex items-start gap-2 text-sm"
        >
          <span class="mt-0.5 shrink-0">
            <Check v-if="f.available && isPro" class="size-4 text-green-600" />
            <Lock v-else class="size-4 text-muted-foreground" />
          </span>
          <span>
            <span class="font-medium">{{ t(`pro.features.${f.id}.name`) }}</span>
            <span class="text-muted-foreground"> — {{ t(`pro.features.${f.id}.desc`) }}</span>
            <span
              v-if="!f.available"
              class="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >{{ t('pro.comingSoon') }}</span>
          </span>
        </li>
      </ul>

      <div v-if="!isPro" class="space-y-2">
        <p class="text-left text-xs text-muted-foreground">
          {{ t('license.howToGet') }}
        </p>
        <div class="flex gap-2">
          <input
            v-model="keyInput"
            :placeholder="t('license.placeholder')"
            class="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono tracking-wide outline-none placeholder:text-muted-foreground focus:border-ring"
            @keyup.enter="onActivate"
          >
          <Button :disabled="activating || !keyInput.trim()" @click="onActivate">
            {{ t('license.activate') }}
          </Button>
        </div>
        <p v-if="activateError" class="text-left text-xs text-destructive">
          {{ t('license.invalidKey') }}
        </p>
      </div>

      <div v-else class="space-y-2 rounded-md border bg-muted/40 p-3 text-left">
        <p class="text-sm font-medium text-green-700 dark:text-green-400">
          {{ t('license.activated') }}
        </p>
        <p class="text-xs text-muted-foreground font-mono">
          {{ maskedKey() }}
        </p>
        <Button variant="outline" size="sm" @click="onDeactivate">
          {{ t('license.deactivate') }}
        </Button>
      </div>
    </div>
  </PanelDialog>
</template>
