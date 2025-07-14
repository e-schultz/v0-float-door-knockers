<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Digital Door Knockers (Simple)</h1>
    
    <div v-if="loading">Loading...</div>
    
    <div v-else-if="error" class="text-red-600">
      Error: {{ error }}
    </div>
    
    <div v-else>
      <!-- Policy Selector -->
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-2">Select Policy:</h2>
        <div class="flex gap-2">
          <button 
            v-for="(policy, key) in policies" 
            :key="key"
            @click="selectedPolicy = key"
            class="px-4 py-2 border rounded"
            :class="selectedPolicy === key ? 'bg-blue-500 text-white' : 'bg-white'"
          >
            {{ policy.metadata.title }}
          </button>
        </div>
      </div>
      
      <!-- Show current policy -->
      <div v-if="currentPolicy" class="mt-4 p-4 border rounded">
        <h3 class="font-semibold">{{ currentPolicy.metadata.title }}</h3>
        <p>{{ currentPolicy.metadata.description }}</p>
        <p class="text-sm text-gray-600 mt-2">
          Approval: {{ (currentPolicy.metadata.approval_rating * 100).toFixed(0) }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SimpleDoorKnocker',
  setup() {
    const policies = ref({})
    const selectedPolicy = ref('free_school_meals')
    const loading = ref(true)
    const error = ref(null)
    
    const currentPolicy = computed(() => {
      return policies.value[selectedPolicy.value]
    })
    
    onMounted(async () => {
      try {
        console.log('SimpleDoorKnocker: Loading policies...')
        const response = await fetch('./policies.json')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        console.log('SimpleDoorKnocker: Loaded', Object.keys(data))
        
        policies.value = data
        loading.value = false
        
      } catch (err) {
        console.error('SimpleDoorKnocker: Error', err)
        error.value = err.message
        loading.value = false
      }
    })
    
    return {
      policies,
      selectedPolicy,
      currentPolicy,
      loading,
      error
    }
  }
}
</script>