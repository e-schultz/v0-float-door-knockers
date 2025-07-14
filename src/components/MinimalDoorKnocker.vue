<template>
  <div>
    <h1>Minimal Door Knocker</h1>
    <p>Status: {{ status }}</p>
    <button @click="loadPolicies">Load Policies</button>
    <pre>{{ debug }}</pre>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MinimalDoorKnocker',
  setup() {
    const status = ref('Not loaded')
    const debug = ref('')
    
    const loadPolicies = async () => {
      status.value = 'Loading...'
      try {
        const response = await fetch('./policies.json')
        status.value = `Fetch: ${response.status}`
        
        const data = await response.json()
        status.value = 'Loaded!'
        debug.value = `Found policies: ${Object.keys(data).join(', ')}`
        
      } catch (error) {
        status.value = 'Error!'
        debug.value = error.toString()
      }
    }
    
    return {
      status,
      debug,
      loadPolicies
    }
  }
}
</script>