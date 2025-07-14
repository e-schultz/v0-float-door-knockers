<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Test Pattern Engine</h1>
    
    <button @click="testEngine" class="px-4 py-2 bg-blue-500 text-white rounded">
      Test Pattern Engine
    </button>
    
    <div v-if="result" class="mt-4 p-4 border rounded">
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { patternEngine } from '../lib/patternEngine.js'

export default {
  name: 'TestPatternEngine',
  setup() {
    const result = ref('')
    
    const testEngine = () => {
      try {
        result.value = 'Testing pattern engine...\n'
        
        // Test with minimal text
        const testText = "Universal free school meals save families $1,000/year."
        result.value += `Test text: "${testText}"\n\n`
        
        const analysis = patternEngine.analyzeText(testText)
        result.value += `Analysis score: ${analysis.score}\n`
        result.value += `Patterns found: ${analysis.patterns.length}\n`
        result.value += `Categories: ${Object.keys(analysis.categoryScores).join(', ')}`
        
      } catch (error) {
        result.value = `ERROR: ${error.message}\n${error.stack}`
      }
    }
    
    return {
      result,
      testEngine
    }
  }
}
</script>