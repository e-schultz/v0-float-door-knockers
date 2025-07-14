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
            v-memo="[selectedPolicy === key]"
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

    <!-- Effectiveness Scorer - Hidden until X-Ray is used -->
    <!-- <EffectivenessScorer 
      v-if="currentPolicy && (policyXRayAnalysis || currentLensAnalysis)"
      :analysis="currentLensAnalysis"
      :policyAnalysis="policyXRayAnalysis"
    /> -->

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
        
        <div class="mt-6" :style="getHighlightStyle('economic_impact', JSON.stringify(currentPolicy.economic_impact))">
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
          <div class="key-message bg-progressive-50 p-4 rounded-lg" :class="getHighlightClasses('key_message', currentLens.key_message)" :style="getHighlightStyle('key_message', currentLens.key_message)">
            <h4 class="font-semibold text-progressive-900 mb-2">Key Message</h4>
            <p class="text-lg text-progressive-800">{{ currentLens.key_message }}</p>
          </div>

          <!-- Evidence Points -->
          <div class="evidence-points" :class="getHighlightClasses('evidence_points', currentLens.evidence_points.join(' '))" :style="getHighlightStyle('evidence_points', currentLens.evidence_points.join(' '))">
            <h4 class="font-semibold mb-3">Evidence Points</h4>
            <div class="space-y-3">
              <div v-for="point in currentLens.evidence_points" :key="point" class="evidence-point">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>{{ point }}</p>
              </div>
            </div>
          </div>

          <!-- Counter Narrative -->
          <div class="counter-narrative" :class="getHighlightClasses('counter_narrative', currentLens.counter_narrative)" :style="getHighlightStyle('counter_narrative', currentLens.counter_narrative)">
            <h4 class="font-semibold text-yellow-800 mb-2">Counter-Narrative</h4>
            <p class="text-yellow-800">{{ currentLens.counter_narrative }}</p>
          </div>

          <!-- Trust Builder -->
          <div class="trust-builder bg-blue-50 p-4 rounded-lg" :class="getHighlightClasses('trust_builder', currentLens.trust_builder)" :style="getHighlightStyle('trust_builder', currentLens.trust_builder)">
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
          <div class="script-section" :class="getHighlightClasses('call_to_action', currentPolicy.conversation_scripts.door_to_door.join(' '))" :style="getHighlightStyle('call_to_action', currentPolicy.conversation_scripts.door_to_door.join(' '))">
            <h3 class="font-semibold mb-3">Door-to-Door Script</h3>
            <div class="conversation-script space-y-2">
              <div v-for="(line, index) in currentPolicy.conversation_scripts.door_to_door" :key="index" class="script-line">
                <span class="text-blue-600 font-mono text-sm">{{ index + 1 }}.</span>
                <span class="ml-2">{{ line }}</span>
              </div>
            </div>
          </div>

          <!-- Phone Bank Scripts -->
          <div class="script-section" :class="getHighlightClasses('call_to_action', currentPolicy.conversation_scripts.phone_bank.join(' '))" :style="getHighlightStyle('call_to_action', currentPolicy.conversation_scripts.phone_bank.join(' '))">
            <h3 class="font-semibold mb-3">Phone Bank Script</h3>
            <div class="conversation-script space-y-2">
              <div v-for="(line, index) in currentPolicy.conversation_scripts.phone_bank" :key="index" class="script-line">
                <span class="text-blue-600 font-mono text-sm">{{ index + 1 }}.</span>
                <span class="ml-2">{{ line }}</span>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="script-section" :class="getHighlightClasses('call_to_action', currentPolicy.conversation_scripts.social_media.join(' '))" :style="getHighlightStyle('call_to_action', currentPolicy.conversation_scripts.social_media.join(' '))">
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
          <div v-for="item in currentPolicy.counter_misinformation.common_lies" :key="item.lie" class="misinformation-item" :class="getHighlightClasses('myth_busting', item.lie + ' ' + item.truth + ' ' + item.evidence)" :style="getHighlightStyle('myth_busting', item.lie + ' ' + item.truth + ' ' + item.evidence)">
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
          <div v-for="viz in currentPolicy.visual_elements.infographics" :key="viz.type" class="viz-card data-visualization" :class="getHighlightClasses('evidence_strength', JSON.stringify(viz.data))" :style="getHighlightStyle('evidence_strength', JSON.stringify(viz.data))">
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
      @pattern-selected="handlePatternSelection"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, shallowRef, markRaw, nextTick } from 'vue'
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
    // Use shallowRef for large static data to avoid deep reactivity
    const policies = shallowRef({})
    const selectedPolicy = ref('free_school_meals')
    const selectedLens = ref('karen_fiscal_conservative')
    const loading = ref(true)
    // Use shallowRef for analysis results to avoid deep reactive proxies
    const policyXRayAnalysis = shallowRef(null)
    const currentLensAnalysis = shallowRef(null)
    
    // Pattern highlighting state
    const selectedPatternForHighlighting = shallowRef(null)
    const intersectionObserver = ref(null)
    const highlightedElements = ref(new Set())
    
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
    
    // Analyze current policy when it changes - but only if X-Ray is open
    watch(currentPolicy, (newPolicy) => {
      // Don't analyze unless user actually needs it
      console.log('Policy changed to:', selectedPolicy.value)
      // Clear previous analysis and highlighting
      policyXRayAnalysis.value = null
      currentLensAnalysis.value = null
      selectedPatternForHighlighting.value = null
    })
    
    // Don't analyze lens content automatically - wait for X-Ray to open
    watch([currentLens, currentXRayContent], ([newLens, newContent]) => {
      // Just log the change, don't analyze
      console.log('Lens changed to:', selectedLens.value)
      currentLensAnalysis.value = null
      selectedPatternForHighlighting.value = null
    })
    
    // Handle pattern selection from X-Ray
    const handlePatternSelection = (patternData) => {
      selectedPatternForHighlighting.value = patternData
      
      // Setup intersection observer for scroll animations
      if (patternData) {
        setupIntersectionObserver()
      } else {
        cleanupIntersectionObserver()
      }
    }
    
    // Setup intersection observer for scroll-triggered animations
    const setupIntersectionObserver = () => {
      cleanupIntersectionObserver()
      
      intersectionObserver.value = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target
            if (element.classList.contains('pattern-highlighted')) {
              // Add pop animation class
              element.classList.add('animate-pop-in')
              
              // Remove animation class after animation completes but keep element stable
              setTimeout(() => {
                element.classList.remove('animate-pop-in')
                // Force a repaint to ensure smooth transition back to base state
                element.style.transform = 'translateZ(0)'
                requestAnimationFrame(() => {
                  element.style.transform = ''
                })
              }, 600)
            }
          }
        })
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      })
      
      // Observe all highlighted elements
      nextTick(() => {
        const highlightedElements = document.querySelectorAll('.pattern-highlighted')
        highlightedElements.forEach(el => {
          intersectionObserver.value.observe(el)
        })
      })
    }
    
    // Clean up intersection observer
    const cleanupIntersectionObserver = () => {
      if (intersectionObserver.value) {
        intersectionObserver.value.disconnect()
        intersectionObserver.value = null
      }
    }
    
    // Check if content should be highlighted based on selected pattern
    const shouldHighlightContent = (contentType, contentText) => {
      if (!selectedPatternForHighlighting.value) return false
      
      const pattern = selectedPatternForHighlighting.value
      const category = pattern.category
      
      // Pattern-to-content mapping
      const contentCategoryMap = {
        'trust_building': ['trust_builder', 'historical_precedent', 'proven_success'],
        'evidence_strength': ['evidence_points', 'economic_impact', 'statistics'],
        'counter_narrative': ['counter_narrative', 'myth_busting', 'opposition_response'],
        'emotional_resonance': ['key_message', 'human_stories', 'personal_impact'],
        'value_alignment': ['value_based_messaging', 'family_benefits', 'community_impact'],
        'action_motivation': ['call_to_action', 'engagement_tools', 'next_steps']
      }
      
      if (!contentCategoryMap[category]) return false
      
      // Check if content type matches pattern category
      if (contentCategoryMap[category].includes(contentType)) {
        return true
      }
      
      // Check if content text contains pattern indicators
      if (contentText && pattern.matches) {
        return pattern.matches.some(match => 
          contentText.toLowerCase().includes(match.indicator.toLowerCase())
        )
      }
      
      return false
    }
    
    // Get highlight style for content
    const getHighlightStyle = (contentType, contentText) => {
      if (!shouldHighlightContent(contentType, contentText)) return {}
      
      const pattern = selectedPatternForHighlighting.value
      const category = pattern.category
      
      // Pattern category colors from patternDefinitions.json
      const categoryColors = {
        'trust_building': '#28a745',
        'evidence_strength': '#6c757d', 
        'counter_narrative': '#dc3545',
        'emotional_resonance': '#fd7e14',
        'value_alignment': '#0066cc',
        'action_motivation': '#6f42c1'
      }
      
      const color = categoryColors[category] || '#6c757d'
      
      return {
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}15`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 4px 12px ${color}25, 0 2px 6px ${color}30, inset 0 1px 0 ${color}40`,
        borderRadius: '6px',
        transform: 'translateZ(0)',
        position: 'relative'
      }
    }

    // Get highlight classes for content (for CSS-based animations)
    const getHighlightClasses = (contentType, contentText) => {
      if (!shouldHighlightContent(contentType, contentText)) return ''
      
      const pattern = selectedPatternForHighlighting.value
      const category = pattern.category
      
      return `pattern-highlighted pattern-${category} animate-highlight`
    }
    
    // Load policies data
    onMounted(async () => {
      try {
        console.log('Loading policies.json...')
        const response = await fetch('./policies.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Policies loaded:', Object.keys(data))
        // Mark the data as non-reactive since it's static
        policies.value = markRaw(data)
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
      currentLensAnalysis,
      selectedPatternForHighlighting,
      handlePatternSelection,
      shouldHighlightContent,
      getHighlightStyle,
      getHighlightClasses,
      setupIntersectionObserver,
      cleanupIntersectionObserver
    }
  }
}
</script>

<style scoped>
/* Pattern highlighting animations */
@keyframes highlightIn {
  0% {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes popIn {
  0% {
    transform: scale(0.95) translateY(4px) translateZ(0);
  }
  50% {
    transform: scale(1.02) translateY(-2px) translateZ(0);
  }
  100% {
    transform: scale(1) translateY(0) translateZ(0);
  }
}

@keyframes subtlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.005);
  }
}

.pattern-highlighted {
  animation: highlightIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-pop-in {
  animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.pattern-highlighted:hover {
  animation: subtlePulse 2s ease-in-out infinite;
}

/* 3D effect enhancements */
.pattern-highlighted::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
  border-radius: inherit;
}

.pattern-highlighted::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.02) 100%);
  pointer-events: none;
  border-radius: inherit;
}

/* Category-specific accent colors */
.pattern-trust_building {
  border-image: linear-gradient(45deg, #28a745, #34ce57) 1;
}

.pattern-evidence_strength {
  border-image: linear-gradient(45deg, #6c757d, #8d9499) 1;
}

.pattern-counter_narrative {
  border-image: linear-gradient(45deg, #dc3545, #e85668) 1;
}

.pattern-emotional_resonance {
  border-image: linear-gradient(45deg, #fd7e14, #fd9642) 1;
}

.pattern-value_alignment {
  border-image: linear-gradient(45deg, #0066cc, #3385d6) 1;
}

.pattern-action_motivation {
  border-image: linear-gradient(45deg, #6f42c1, #8a5cf5) 1;
}

/* Smooth transitions for all highlight elements */
.pattern-highlighted {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow, background-color;
  transform: translateZ(0) scale(1);
}

/* Performance optimization */
.pattern-highlighted * {
  will-change: auto;
}
</style>