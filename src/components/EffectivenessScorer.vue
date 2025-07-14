<template>
  <div class="effectiveness-scorer bg-white rounded-lg shadow-lg p-6 mb-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-prairie-900">Policy Effectiveness Score</h2>
      <button 
        @click="showDetails = !showDetails"
        class="text-progressive-600 hover:text-progressive-700 text-sm font-medium flex items-center"
      >
        {{ showDetails ? 'Hide' : 'Show' }} Details
        <svg 
          class="w-4 h-4 ml-1 transition-transform duration-200" 
          :class="{ 'rotate-180': showDetails }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Overall Score Display -->
    <div class="overall-score text-center mb-8">
      <div class="relative inline-flex items-center justify-center">
        <svg class="w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            :stroke="getScoreColor(overallScore)"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-out"
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold" :style="{ color: getScoreColor(overallScore) }">
            {{ overallScore }}%
          </span>
          <span class="text-xs text-prairie-600 mt-1">{{ getScoreLabel(overallScore) }}</span>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="category-breakdown grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div 
        v-for="(data, category) in categoryScores" 
        :key="category"
        class="category-item bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-center mb-2">
          <div 
            class="w-3 h-3 rounded-full mr-2"
            :style="{ backgroundColor: getCategoryColor(category) }"
          ></div>
          <h4 class="text-sm font-medium text-prairie-700">
            {{ getCategoryName(category) }}
          </h4>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-semibold text-prairie-900">{{ data.score }}</span>
          <span class="text-sm text-prairie-600 ml-1">/ 100</span>
        </div>
        <div class="text-xs text-prairie-500 mt-1">
          {{ data.count }} pattern{{ data.count !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Detailed Analysis (Collapsible) -->
    <transition name="slide-down">
      <div v-if="showDetails" class="detailed-analysis border-t pt-6">
        <!-- Strengths -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-prairie-900 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Messaging Strengths
          </h3>
          <div class="space-y-2">
            <div 
              v-for="strength in topStrengths" 
              :key="strength.pattern"
              class="flex items-start bg-green-50 rounded-lg p-3"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-prairie-900">{{ strength.name }}</p>
                <p class="text-xs text-prairie-600 mt-1">{{ strength.description }}</p>
              </div>
              <span class="text-xs font-medium text-green-600 ml-3">
                {{ strength.frequency }} uses
              </span>
            </div>
          </div>
        </div>

        <!-- Improvements -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-prairie-900 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Suggested Improvements
          </h3>
          <div class="space-y-2">
            <div 
              v-for="(suggestion, idx) in topSuggestions" 
              :key="idx"
              class="flex items-start bg-orange-50 rounded-lg p-3"
            >
              <span class="text-orange-500 font-bold mr-3">{{ idx + 1 }}.</span>
              <div class="flex-1">
                <p class="text-sm text-prairie-900">{{ suggestion.message }}</p>
                <p class="text-xs text-prairie-600 mt-1">
                  Priority: {{ getPriorityLabel(suggestion.priority) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pattern Distribution -->
        <div>
          <h3 class="text-lg font-semibold text-prairie-900 mb-3">Pattern Distribution</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-3">
              <div 
                v-for="(data, category) in categoryScores" 
                :key="category"
                v-if="data.count > 0"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-prairie-700">{{ getCategoryName(category) }}</span>
                  <span class="text-sm text-prairie-600">{{ data.count }} patterns</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :style="{ 
                      width: `${(data.score / 100) * 100}%`,
                      backgroundColor: getCategoryColor(category)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import patternDefinitions from '../data/patternDefinitions.json'

export default {
  name: 'EffectivenessScorer',
  props: {
    analysis: {
      type: Object,
      default: null
    },
    policyAnalysis: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const showDetails = ref(false)
    const circumference = 2 * Math.PI * 60

    const overallScore = computed(() => {
      if (props.policyAnalysis) {
        return props.policyAnalysis.overallScore
      }
      if (props.analysis) {
        return props.analysis.score
      }
      return 0
    })

    const strokeDashoffset = computed(() => {
      const progress = overallScore.value / 100
      return circumference - (progress * circumference)
    })

    const categoryScores = computed(() => {
      if (props.analysis) {
        return props.analysis.categoryScores
      }
      // Aggregate from policy analysis
      if (props.policyAnalysis) {
        const aggregated = {}
        const allAnalyses = [
          ...Object.values(props.policyAnalysis.lensAnalysis || {}),
          ...Object.values(props.policyAnalysis.scriptAnalysis || {})
        ]
        
        // Initialize categories
        for (const category of Object.keys(patternDefinitions.pattern_categories)) {
          aggregated[category] = { score: 0, count: 0, patterns: [] }
        }
        
        // Aggregate scores
        for (const analysis of allAnalyses) {
          for (const [category, data] of Object.entries(analysis.categoryScores || {})) {
            aggregated[category].score += data.score
            aggregated[category].count += data.count
          }
        }
        
        // Average scores
        for (const category of Object.keys(aggregated)) {
          if (allAnalyses.length > 0) {
            aggregated[category].score = Math.round(aggregated[category].score / allAnalyses.length)
          }
        }
        
        return aggregated
      }
      return {}
    })

    const topStrengths = computed(() => {
      if (!props.policyAnalysis?.topPatterns) return []
      
      return props.policyAnalysis.topPatterns
        .filter(p => p.pattern.positive)
        .slice(0, 3)
        .map(p => ({
          pattern: p.patternId,
          name: p.pattern.name,
          description: p.pattern.description,
          frequency: p.frequency
        }))
    })

    const topSuggestions = computed(() => {
      if (props.policyAnalysis?.improvementAreas) {
        return props.policyAnalysis.improvementAreas.slice(0, 3)
      }
      if (props.analysis?.suggestions) {
        return props.analysis.suggestions.slice(0, 3)
      }
      return []
    })

    const getScoreColor = (score) => {
      if (score >= 80) return '#28a745'
      if (score >= 60) return '#ffc107'
      if (score >= 40) return '#fd7e14'
      return '#dc3545'
    }

    const getScoreLabel = (score) => {
      if (score >= 80) return 'Excellent'
      if (score >= 60) return 'Good'
      if (score >= 40) return 'Fair'
      return 'Needs Work'
    }

    const getCategoryColor = (category) => {
      return patternDefinitions.pattern_categories[category]?.color || '#6c757d'
    }

    const getCategoryName = (category) => {
      return patternDefinitions.pattern_categories[category]?.name || category
    }

    const getPriorityLabel = (priority) => {
      if (priority >= 0.8) return 'High'
      if (priority >= 0.5) return 'Medium'
      return 'Low'
    }

    return {
      showDetails,
      circumference,
      overallScore,
      strokeDashoffset,
      categoryScores,
      topStrengths,
      topSuggestions,
      getScoreColor,
      getScoreLabel,
      getCategoryColor,
      getCategoryName,
      getPriorityLabel
    }
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  transform-origin: top;
}

.slide-down-enter-from {
  opacity: 0;
  transform: scaleY(0);
}

.slide-down-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>