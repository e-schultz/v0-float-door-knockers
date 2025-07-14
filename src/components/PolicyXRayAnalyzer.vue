<template>
  <div class="policy-xray-analyzer">
    <!-- X-Ray Toggle Button -->
    <button 
      @click="toggleXRay"
      class="xray-toggle-button fixed bottom-6 right-6 z-50 bg-cyan-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-200 flex items-center space-x-2"
      :class="{ 'bg-cyan-700': showXRay }"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <span class="font-medium">{{ showXRay ? 'Hide' : 'Show' }} X-Ray</span>
      <span v-if="!showXRay && currentAnalysis" class="bg-white/20 px-2 py-0.5 rounded-full text-xs">
        {{ currentAnalysis.score }}%
      </span>
    </button>

    <!-- X-Ray Panel -->
    <transition name="slide-up">
      <div v-show="showXRay" class="xray-panel fixed bottom-0 left-0 right-0 h-96 bg-gray-900 text-white shadow-2xl z-40 overflow-hidden flex">
        <!-- Left Side: Pattern Inspection -->
        <div class="w-3/5 border-r border-gray-700 flex flex-col">
          <!-- Header -->
          <div class="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="text-cyan-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">xray.devtools.policy</h3>
                <p class="text-xs text-gray-400">Pattern Analysis v1.0</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <select 
                v-model="filterLevel"
                class="bg-gray-700 text-sm px-3 py-1 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Patterns</option>
                <option value="trust_building">Trust Building</option>
                <option value="value_alignment">Value Alignment</option>
                <option value="evidence_strength">Evidence Strength</option>
                <option value="counter_narrative">Counter-Narrative</option>
                <option value="emotional_resonance">Emotional Resonance</option>
                <option value="action_motivation">Action Motivation</option>
              </select>
              <button 
                @click="showXRay = false"
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Pattern List -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="analysisError" class="text-center text-red-400 py-8">
              <p>Error loading analysis: {{ analysisError }}</p>
            </div>
            <div v-else-if="!isAnalysisLoaded" class="text-center text-gray-400 py-8">
              <div class="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>Loading pattern analysis...</p>
            </div>
            <div v-else-if="currentAnalysis && currentAnalysis.patterns.length > 0" class="space-y-3">
              <div 
                v-for="(patternMatch, index) in filteredPatterns" 
                :key="index"
                class="pattern-item bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                :class="{ 'ring-2 ring-cyan-400': selectedPattern === index }"
                @click="selectPattern(index)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span 
                        class="pattern-badge px-2 py-1 rounded text-xs font-medium"
                        :style="{ backgroundColor: getCategoryColor(patternMatch.category) + '20', color: getCategoryColor(patternMatch.category) }"
                      >
                        {{ getCategoryName(patternMatch.category) }}
                      </span>
                      <span 
                        class="severity-badge px-2 py-1 rounded text-xs"
                        :class="getSeverityClass(patternMatch.severity)"
                      >
                        {{ patternMatch.severity }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-300">{{ patternMatch.pattern.name }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ patternMatch.matches.length }} occurrence(s)</p>
                  </div>
                  <div class="text-cyan-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              <p v-if="filterLevel === 'all'">No patterns detected in current content</p>
              <p v-else>
                No {{ getCategoryName(filterLevel) }} patterns for 
                <span class="text-gray-400">{{ getLensDisplayName() }}</span> / 
                <span class="text-gray-400">{{ getPolicyDisplayName() }}</span>
              </p>
            </div>
          </div>

          <!-- Footer Stats -->
          <div class="bg-gray-800 px-6 py-3 text-xs text-gray-400 flex justify-between">
            <div>
              Patterns: <span class="text-white font-medium">{{ currentAnalysis?.patterns.length || 0 }}</span>
            </div>
            <div>
              Score: <span class="text-cyan-400 font-medium">{{ currentAnalysis?.score || 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Pattern Details -->
        <div class="w-2/5 bg-gray-850 flex flex-col">
          <div v-if="selectedPatternData" class="flex-1 overflow-y-auto p-6">
            <!-- Pattern Details -->
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Pattern Type</h4>
                <p class="text-lg font-medium">{{ selectedPatternData.pattern.name }}</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Description</h4>
                <p class="text-sm text-gray-300">{{ selectedPatternData.pattern.description }}</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Example</h4>
                <p class="text-sm text-cyan-300 italic">"{{ selectedPatternData.pattern.example }}"</p>
              </div>

              <div v-if="selectedPatternData.pattern.counter_risk">
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Potential Risk</h4>
                <p class="text-sm text-orange-300">{{ selectedPatternData.pattern.counter_risk }}</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Occurrences</h4>
                <div class="space-y-2">
                  <div 
                    v-for="(match, idx) in selectedPatternData.matches.slice(0, 3)" 
                    :key="idx"
                    class="bg-gray-800 rounded p-3 text-xs"
                  >
                    <p class="text-gray-400 mb-1">{{ match.indicator }}</p>
                    <p class="text-gray-300">{{ match.context }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Select a pattern to inspect</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch, shallowRef } from 'vue'
import { patternEngine } from '../lib/patternEngine.js'
import patternDefinitions from '../data/patternDefinitions.json'

export default {
  name: 'PolicyXRayAnalyzer',
  props: {
    content: {
      type: String,
      default: ''
    },
    context: {
      type: Object,
      default: () => ({})
    },
    policy: {
      type: Object,
      default: null
    }
  },
  emits: ['pattern-selected'],
  setup(props, { emit }) {
    const showXRay = ref(false)
    const filterLevel = ref('all')
    const selectedPattern = ref(null)
    const currentAnalysis = shallowRef(null)
    const isAnalysisLoaded = ref(false)
    const analysisError = ref(null)

    const generateAnalysisForContext = (policyType, lensType) => {
      const lensModifiers = {
        karen_fiscal_conservative: {
          emphasize: ['evidence_strength', 'trust_building'],
          patterns: [
            {
              patternId: 'evidence_strength::fiscal_responsibility',
              pattern: {
                name: 'Fiscal Responsibility Frame',
                description: 'Emphasizes cost-effectiveness and responsible spending',
                example: 'Saves taxpayers money while helping families',
                counter_risk: 'May seem purely transactional'
              },
              matches: [{ indicator: 'saves', context: '...saves taxpayers money...', index: 0, length: 5 }],
              severity: 'high',
              category: 'evidence_strength'
            },
            {
              patternId: 'trust_building::proven_success',
              pattern: {
                name: 'Proven Success Citation',
                description: 'References validated real-world implementation success',
                example: '70% voter approval across all demographics',
                counter_risk: 'Can seem cherry-picked if not comprehensive'
              },
              matches: [{ indicator: 'proven', context: '...proven success in Minnesota...', index: 0, length: 6 }],
              severity: 'high',
              category: 'trust_building'
            }
          ]
        },
        qtb_storyteller: {
          emphasize: ['emotional_resonance', 'value_alignment'],
          patterns: [
            {
              patternId: 'emotional_resonance::human_story',
              pattern: {
                name: 'Human Story Connection',
                description: 'Uses personal narratives to create emotional connection',
                example: 'Maria no longer worries about her child going hungry',
                counter_risk: 'Can seem exploitative if not authentic'
              },
              matches: [{ indicator: 'Maria', context: '...Maria no longer worries...', index: 0, length: 5 }],
              severity: 'high',
              category: 'emotional_resonance'
            },
            {
              patternId: 'value_alignment::family_values',
              pattern: {
                name: 'Family Values Connection',
                description: 'Connects policy to family priorities and values',
                example: 'Supporting working families and their children',
                counter_risk: 'May seem too broad without specifics'
              },
              matches: [{ indicator: 'families', context: '...helps all working families...', index: 0, length: 8 }],
              severity: 'medium',
              category: 'value_alignment'
            }
          ]
        },
        lf1m_truth_teller: {
          emphasize: ['counter_narrative', 'trust_building'],
          patterns: [
            {
              patternId: 'counter_narrative::system_truth',
              pattern: {
                name: 'System Truth Revelation',
                description: 'Exposes how current system fails people',
                example: 'Current system forces families to choose between food and rent',
                counter_risk: 'Can seem overly negative or radical'
              },
              matches: [{ indicator: 'system', context: '...current system forces families...', index: 0, length: 6 }],
              severity: 'high',
              category: 'counter_narrative'
            },
            {
              patternId: 'trust_building::authentic_voice',
              pattern: {
                name: 'Authentic Voice Pattern',
                description: 'Speaks directly without political spin',
                example: 'Here is what actually happens to families',
                counter_risk: 'May seem too blunt for some audiences'
              },
              matches: [{ indicator: 'actually', context: '...what actually happens...', index: 0, length: 8 }],
              severity: 'medium',
              category: 'trust_building'
            }
          ]
        },
        evna_emotional_intelligence: {
          emphasize: ['emotional_resonance', 'action_motivation'],
          patterns: [
            {
              patternId: 'emotional_resonance::community_wisdom',
              pattern: {
                name: 'Community Wisdom Connection',
                description: 'Draws on collective understanding and shared values',
                example: 'We all know what it means to care for our children',
                counter_risk: 'May seem presumptuous about shared values'
              },
              matches: [{ indicator: 'we all', context: '...we all know what it means...', index: 0, length: 6 }],
              severity: 'medium',
              category: 'emotional_resonance'
            },
            {
              patternId: 'action_motivation::collective_action',
              pattern: {
                name: 'Collective Action Frame',
                description: 'Motivates community-based engagement',
                example: 'Together we can make this change happen',
                counter_risk: 'May seem idealistic without concrete steps'
              },
              matches: [{ indicator: 'together', context: '...together we can make...', index: 0, length: 8 }],
              severity: 'high',
              category: 'action_motivation'
            }
          ]
        }
      }

      const lens = lensModifiers[lensType] || lensModifiers.karen_fiscal_conservative
      const patterns = lens.patterns

      const categoryScores = {
        trust_building: { score: 60, patterns: [], count: 0 },
        evidence_strength: { score: 70, patterns: [], count: 0 },
        value_alignment: { score: 55, patterns: [], count: 0 },
        counter_narrative: { score: 40, patterns: [], count: 0 },
        emotional_resonance: { score: 45, patterns: [], count: 0 },
        action_motivation: { score: 50, patterns: [], count: 0 }
      }

      patterns.forEach(pattern => {
        const category = pattern.category
        if (categoryScores[category]) {
          categoryScores[category].patterns.push(pattern.patternId)
          categoryScores[category].count++
          categoryScores[category].score += pattern.severity === 'high' ? 20 : 10
        }
      })

      return {
        patterns,
        negativePatterns: [],
        score: Math.round(Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0) / 6),
        categoryScores,
        suggestions: [
          {
            type: 'lens_optimization',
            message: `Optimized for ${lensType.replace(/_/g, ' ')} perspective`,
            priority: 0.9
          }
        ],
        metadata: {
          policyType,
          lensType,
          analyzedAt: new Date().toISOString(),
          mockData: true
        }
      }
    }

    const loadAnalysis = async () => {
      if (isAnalysisLoaded.value) return
      
      try {
        analysisError.value = null
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const policyType = props.context?.policy || 'free_school_meals'
        const lensType = props.context?.lens || 'karen_fiscal_conservative'
        
        currentAnalysis.value = generateAnalysisForContext(policyType, lensType)
        isAnalysisLoaded.value = true
      } catch (error) {
        console.error('Analysis loading error:', error)
        analysisError.value = error.message
      }
    }

    const filteredPatterns = computed(() => {
      if (!currentAnalysis.value) return []
      
      if (filterLevel.value === 'all') {
        return currentAnalysis.value.patterns
      }
      
      return currentAnalysis.value.patterns.filter(p => 
        p.category === filterLevel.value
      )
    })

    const selectedPatternData = computed(() => {
      if (selectedPattern.value === null || !filteredPatterns.value.length) {
        return null
      }
      return filteredPatterns.value[selectedPattern.value]
    })

    // Watch for context changes and reload analysis
    watch(() => props.context, (newContext) => {
      if (showXRay.value && newContext) {
        isAnalysisLoaded.value = false
        loadAnalysis()
      }
    }, { deep: true })

    const toggleXRay = () => {
      showXRay.value = !showXRay.value
      if (!showXRay.value) {
        selectedPattern.value = null
        isAnalysisLoaded.value = false
        // Clear pattern highlighting when X-ray is closed
        emit('pattern-selected', null)
      } else {
        loadAnalysis()
      }
    }

    const selectPattern = (index) => {
      selectedPattern.value = index
      
      // Emit the selected pattern data to parent component
      if (filteredPatterns.value.length > 0 && index !== null) {
        emit('pattern-selected', filteredPatterns.value[index])
      } else {
        emit('pattern-selected', null)
      }
    }

    const getCategoryColor = (category) => {
      return patternDefinitions.pattern_categories[category]?.color || '#6c757d'
    }

    const getCategoryName = (category) => {
      return patternDefinitions.pattern_categories[category]?.name || category
    }

    const getSeverityClass = (severity) => {
      const classes = {
        high: 'bg-green-500/20 text-green-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-blue-500/20 text-blue-400'
      }
      return classes[severity] || classes.low
    }

    const getLensDisplayName = () => {
      const lensNames = {
        'karen_fiscal_conservative': 'Fiscal Conservative',
        'qtb_storyteller': 'Human Storyteller',
        'lf1m_truth_teller': 'Systems Truth-Teller',
        'evna_emotional_intelligence': 'Community Wisdom'
      }
      const lensType = props.context?.lens || 'karen_fiscal_conservative'
      return lensNames[lensType] || lensType.replace(/_/g, ' ')
    }

    const getPolicyDisplayName = () => {
      const policyNames = {
        'free_school_meals': 'Free School Meals',
        'universal_healthcare': 'Universal Healthcare',
        'affordable_housing': 'Affordable Housing',
        'climate_action': 'Climate Action'
      }
      const policyType = props.context?.policy || 'free_school_meals'
      return policyNames[policyType] || policyType.replace(/_/g, ' ')
    }

    return {
      showXRay,
      filterLevel,
      selectedPattern,
      currentAnalysis,
      filteredPatterns,
      selectedPatternData,
      toggleXRay,
      selectPattern,
      getCategoryColor,
      getCategoryName,
      getSeverityClass,
      getLensDisplayName,
      getPolicyDisplayName,
      isAnalysisLoaded,
      analysisError
    }
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.bg-gray-750 {
  background-color: rgb(42, 46, 53);
}

.bg-gray-850 {
  background-color: rgb(24, 26, 30);
}

.xray-toggle-button {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.xray-panel {
  box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.5);
}
</style>