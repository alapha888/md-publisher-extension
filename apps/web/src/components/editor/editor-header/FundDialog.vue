<script setup lang="ts">
import { Heart, KeyRound } from '@lucide/vue'
import { computed } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const uiStore = useUIStore()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

function goPro() {
  emit(`update:open`, false)
  uiStore.toggleShowLicenseDialog(true)
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('fund.title')"
    :description="t('fund.description')"
    :icon="Heart"
  >
    <div class="space-y-4 px-4 py-4 text-center sm:px-6">
      <p class="text-sm text-muted-foreground">
        {{ t('fund.proHint') }}
      </p>
      <Button class="gap-2" @click="goPro">
        <KeyRound class="size-4" />
        {{ t('fund.goPro') }}
      </Button>
    </div>
  </PanelDialog>
</template>
