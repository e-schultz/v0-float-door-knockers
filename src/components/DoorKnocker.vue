<template>
  <div v-if="loading" class="loading">
    Loading Digital Door Knockers...
  </div>
  <div v-else class="door-knocker-container max-w-6xl mx-auto p-6">
    <!-- Header -->
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-prairie-900 mb-4">
        Digital Door Knockers
      </h1>
      <p class="text-xl text-prairie-700 max-w-3xl mx-auto">
        Transform complex progressive policy into accessible voter conversations through proven conversation-as-infrastructure patterns
      </p>
    </header>

    <!-- Policy Selector -->
    <div class="policy-selector mb-8">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">Select Policy</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="(policy, key) in policies" 
            :key="key"
            @click="selectedPolicy = key"
            class="policy-card cursor-pointer p-4 rounded-lg border-2 transition-all"
            :class="selectedPolicy === key ? 'border-progressive-500 bg-progressive-50' : 'border-prairie-300 hover:border-progressive-300'"
          >
            <h3 class="font-semibold text-lg">{{ policy.metadata.title }}</h3>
            <p class="text-sm text-prairie-600 mt-2">{{ policy.metadata.validation }}</p>
            <div class="mt-3">
              <span class="fact-badge">{{ (policy.metadata.approval_rating * 100).toFixed(0) }}% approval</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Effectiveness Scorer -->
    <EffectivenessScorer 
      v-if="currentPolicy && policyXRayAnalysis"
      :analysis="currentLensAnalysis"
      :policyAnalysis="policyXRayAnalysis"
    />

    <!-- Lens Selector -->
    <div v-if="currentPolicy" class="lens-selector mb-8">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">Choose Your Lens</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            v-for="(lens, key) in currentPolicy.lenses"
            :key="key"
            @click="selectedLens = key"
            class="lens-button"
            :class="{ active: selectedLens === key }"
          >
            {{ getLensName(key) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="currentPolicy && currentLens" class="main-content grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Policy Overview -->
      <div class="policy-overview door-knocker-card">
        <h3 class="text-xl font-semibold mb-4">Policy Facts</h3>
        <div class="space-y-3">
          <div v-for="(value, key) in currentPolicy.core_facts" :key="key" class="fact-item">
            <div class="text-sm font-medium text-prairie-600 capitalize">
              {{ key.replace(/_/g, ' ') }}
            </div>
            <div class="text-lg font-semibold text-prairie-900">{{ value }}</div>
          </div>
        </div>
        
        <div class="mt-6">
          <h4 class="font-semibold mb-3">Economic Impact</h4>
          <div class="space-y-2">
            <div v-for="(value, key) in currentPolicy.economic_impact" :key="key" class="text-sm">
              <span class="text-prairie-600 capitalize">{{ key.replace(/_/g, ' ') }}:</span>
              <span class="font-medium ml-2">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lens Perspective -->
      <div class="lens-perspective door-knocker-card lg:col-span-2">
        <h3 class="text-xl font-semibold mb-4">{{ getLensName(selectedLens) }} Perspective</h3>
        
        <div class="lens-content space-y-6">
          <!-- Key Message -->
          <div class="key-message bg-progressive-50 p-4 rounded-lg">
            <h4 class="font-semibold text-progressive-900 mb-2">Key Message</h4>
            <p class="text-lg text-progressive-800">{{ currentLens.key_message }}</p>
          </div>

          <!-- Evidence Points -->
          <div class="evidence-points">
            <h4 class="font-semibold mb-3">Evidence Points</h4>
            <div class="space-y-3">
              <div v-for="point in currentLens.evidence_points" :key="point" class="evidence-point">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>{{ point }}</p>
              </div>
            </div>
          </div>

          <!-- Counter Narrative -->
          <div class="counter-narrative">
            <h4 class="font-semibold text-yellow-800 mb-2">Counter-Narrative</h4>
            <p class="text-yellow-800">{{ currentLens.counter_narrative }}</p>
          </div>

          <!-- Trust Builder -->
          <div class="trust-builder bg-blue-50 p-4 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">Trust Builder</h4>
            <p class="text-blue-800">{{ currentLens.trust_builder }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversation Tools -->
    <div v-if="currentPolicy" class="conversation-tools mt-8">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-2xl font-semibold mb-6">Conversation Tools</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Door to Door Scripts -->
          <div class="script-section">
            <h3 class="font-semibold mb-3">Door-to-Door Script</h3>
            <div class="conversation-script space-y-2">
              <div v-for="(line, index) in currentPolicy.conversation_scripts.door_to_door" :key="index" class="script-line">
                <span class="text-blue-600 font-mono text-sm">{{ index + 1 }}.</span>
                <span class="ml-2">{{ line }}</span>
              </div>
            </div>
          </div>

          <!-- Phone Bank Scripts -->
          <div class="script-section">
            <h3 class="font-semibold mb-3">Phone Bank Script</h3>
            <div class="conversation-script space-y-2">
              <div v-for="(line, index) in currentPolicy.conversation_scripts.phone_bank" :key="index" class="script-line">
                <span class="text-blue-600 font-mono text-sm">{{ index + 1 }}.</span>
                <span class="ml-2">{{ line }}</span>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="script-section">
            <h3 class="font-semibold mb-3">Social Media Posts</h3>
            <div class="space-y-3">
              <div v-for="(post, index) in currentPolicy.conversation_scripts.social_media" :key="index" class="social-post bg-twitter-blue bg-opacity-10 p-3 rounded-lg">
                <p class="text-sm">{{ post }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Counter-Misinformation -->
    <div v-if="currentPolicy" class="counter-misinformation mt-8">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-2xl font-semibold mb-6">Counter-Misinformation Toolkit</h2>
        
        <div class="space-y-4">
          <div v-for="item in currentPolicy.counter_misinformation.common_lies" :key="item.lie" class="misinformation-item">
            <div class="misinformation-alert">
              <h4 class="font-semibold text-red-800 mb-2">❌ Common Lie</h4>
              <p class="text-red-700 mb-3">"{{ item.lie }}"</p>
              
              <h4 class="font-semibold text-green-800 mb-2">✅ Truth Response</h4>
              <p class="text-green-700 mb-3">{{ item.truth }}</p>
              
              <h4 class="font-semibold text-blue-800 mb-2">📊 Evidence</h4>
              <p class="text-blue-700">{{ item.evidence }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Visualization -->
    <div v-if="currentPolicy" class="data-visualization mt-8">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-2xl font-semibold mb-6">Data Stories</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="viz in currentPolicy.visual_elements.infographics" :key="viz.type" class="viz-card data-visualization">
            <h3 class="font-semibold mb-4 capitalize">{{ viz.type.replace(/_/g, ' ') }}</h3>
            <div class="space-y-2">
              <div v-for="(value, key) in viz.data" :key="key" class="flex justify-between">
                <span class="capitalize">{{ key.replace(/_/g, ' ') }}</span>
                <span class="font-bold">{{ typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- X-Ray Analyzer Integration -->
    <PolicyXRayAnalyzer 
      :content="currentXRayContent"
      :context="currentXRayContext"
      :policy="currentPolicy"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import PolicyXRayAnalyzer from './PolicyXRayAnalyzer.vue'
import EffectivenessScorer from './EffectivenessScorer.vue'
import { patternEngine } from '../lib/patternEngine.js'

export default {
  name: 'DoorKnocker',
  components: {
    PolicyXRayAnalyzer,
    EffectivenessScorer
  },
  setup() {
    const policies = ref({})
    const selectedPolicy = ref('free_school_meals')
    const selectedLens = ref('karen_fiscal_conservative')
    const loading = ref(true)
    const policyXRayAnalysis = ref(null)
    const currentLensAnalysis = ref(null)
    
    const currentPolicy = computed(() => {
      return policies.value[selectedPolicy.value]
    })
    
    const currentLens = computed(() => {
      if (!currentPolicy.value) return null
      return currentPolicy.value.lenses[selectedLens.value]
    })
    
    const getLensName = (lensKey) => {
      const names = {
        'karen_fiscal_conservative': 'Fiscal Conservative',
        'qtb_storyteller': 'Human Storyteller', 
        'lf1m_truth_teller': 'Systems Truth-Teller',
        'evna_emotional_intelligence': 'Community Wisdom'
      }
      return names[lensKey] || lensKey
    }
    
    // X-Ray content for analysis
    const currentXRayContent = computed(() => {
      if (!currentLens.value) return ''
      
      // Combine all lens content for analysis
      const content = [
        currentLens.value.key_message,
        ...currentLens.value.evidence_points,
        currentLens.value.counter_narrative,
        currentLens.value.trust_builder
      ].join(' ')
      
      return content
    })
    
    const currentXRayContext = computed(() => {
      return {
        policy: selectedPolicy.value,
        lens: selectedLens.value,
        policyTitle: currentPolicy.value?.metadata?.title || '',
        lensName: getLensName(selectedLens.value)
      }
    })
    
    // Analyze current policy when it changes
    watch(currentPolicy, (newPolicy) => {
      if (newPolicy) {
        policyXRayAnalysis.value = patternEngine.analyzePolicy(newPolicy)
      }
    })
    
    // Analyze current lens content when it changes
    watch([currentLens, currentXRayContent], ([newLens, newContent]) => {
      if (newLens && newContent) {
        currentLensAnalysis.value = patternEngine.analyzeText(newContent, currentXRayContext.value)
      }
    })
    
    // Load policies data
    onMounted(async () => {
      try {
        const response = await fetch('./policies.json')
        const data = await response.json()
        policies.value = data
        loading.value = false
      } catch (error) {
        console.error('Failed to load policies:', error)
        loading.value = false
      }
    })
    
    return {
      policies,
      selectedPolicy,
      selectedLens,
      currentPolicy,
      currentLens,
      getLensName,
      loading,
      currentXRayContent,
      currentXRayContext,
      policyXRayAnalysis,
      currentLensAnalysis
    }
  }
}
</script>