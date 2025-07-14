/**
 * Pattern Detection Engine
 * Adapted from rhetoric-devtools for policy messaging analysis
 */

import patternDefinitions from '../data/patternDefinitions.json'

export class PolicyPatternEngine {
  constructor() {
    this.patterns = patternDefinitions.patterns
    this.negativePatterns = patternDefinitions.negative_patterns
    this.categories = patternDefinitions.pattern_categories
    this.scoring = patternDefinitions.scoring
  }

  /**
   * Analyze text for policy messaging patterns
   * @param {string} text - Text to analyze
   * @param {Object} context - Additional context (policy type, lens, etc.)
   * @returns {Object} Analysis results with patterns found
   */
  analyzeText(text, context = {}) {
    const results = {
      patterns: [],
      negativePatterns: [],
      score: 0,
      categoryScores: {},
      suggestions: [],
      metadata: {
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        analyzedAt: new Date().toISOString(),
        context
      }
    }

    // Analyze positive patterns
    for (const [patternId, pattern] of Object.entries(this.patterns)) {
      const matches = this.detectPattern(text, pattern)
      if (matches.length > 0) {
        results.patterns.push({
          patternId,
          pattern,
          matches,
          severity: pattern.severity,
          category: pattern.category
        })
      }
    }

    // Analyze negative patterns
    for (const [patternId, pattern] of Object.entries(this.negativePatterns)) {
      const matches = this.detectPattern(analyzedText, pattern)
      if (matches.length > 0) {
        results.negativePatterns.push({
          patternId,
          pattern,
          matches,
          severity: pattern.severity,
          improvement: pattern.improvement
        })
      }
    }

    // Calculate scores
    results.score = this.calculateEffectivenessScore(results)
    results.categoryScores = this.calculateCategoryScores(results)
    
    // Generate suggestions
    results.suggestions = this.generateSuggestions(results, context)

    return results
  }

  /**
   * Detect if a pattern exists in text
   * @param {string} text - Text to search
   * @param {Object} pattern - Pattern definition
   * @returns {Array} Matches found
   */
  detectPattern(text, pattern) {
    const matches = []
    const lowerText = text.toLowerCase()
    
    // Check each indicator
    for (const indicator of pattern.indicators) {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi')
      let match
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          indicator,
          index: match.index,
          length: match[0].length,
          context: this.extractContext(text, match.index, 50)
        })
      }
    }

    return matches
  }

  /**
   * Extract context around a match
   * @param {string} text - Full text
   * @param {number} index - Match index
   * @param {number} radius - Context radius in characters
   * @returns {string} Context string
   */
  extractContext(text, index, radius = 50) {
    const start = Math.max(0, index - radius)
    const end = Math.min(text.length, index + radius)
    let context = text.substring(start, end)
    
    if (start > 0) context = '...' + context
    if (end < text.length) context = context + '...'
    
    return context
  }

  /**
   * Calculate overall effectiveness score
   * @param {Object} results - Analysis results
   * @returns {number} Score 0-100
   */
  calculateEffectivenessScore(results) {
    let score = 0
    const categoryTotals = {}

    // Initialize category totals
    for (const category of Object.keys(this.categories)) {
      categoryTotals[category] = 0
    }

    // Add positive pattern scores
    for (const patternMatch of results.patterns) {
      const weight = this.scoring.pattern_weights[patternMatch.category] || 0.1
      const severityMultiplier = this.scoring.severity_multipliers[patternMatch.severity] || 0.5
      categoryTotals[patternMatch.category] += weight * severityMultiplier * 10
    }

    // Subtract negative pattern scores
    for (const negativeMatch of results.negativePatterns) {
      const severityMultiplier = this.scoring.severity_multipliers[negativeMatch.severity] || 0.5
      score -= severityMultiplier * 5
    }

    // Sum category scores with caps
    for (const [category, total] of Object.entries(categoryTotals)) {
      const weight = this.scoring.pattern_weights[category] || 0.1
      const maxCategoryScore = weight * 100
      score += Math.min(total, maxCategoryScore)
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Calculate scores for each category
   * @param {Object} results - Analysis results
   * @returns {Object} Category scores
   */
  calculateCategoryScores(results) {
    const scores = {}

    for (const category of Object.keys(this.categories)) {
      scores[category] = {
        score: 0,
        patterns: [],
        count: 0
      }
    }

    for (const patternMatch of results.patterns) {
      const category = patternMatch.category
      const severityMultiplier = this.scoring.severity_multipliers[patternMatch.severity] || 0.5
      
      scores[category].score += severityMultiplier * 20
      scores[category].patterns.push(patternMatch.patternId)
      scores[category].count++
    }

    // Cap scores at 100
    for (const category of Object.keys(scores)) {
      scores[category].score = Math.min(100, scores[category].score)
    }

    return scores
  }

  /**
   * Generate improvement suggestions
   * @param {Object} results - Analysis results
   * @param {Object} context - Additional context
   * @returns {Array} Suggestions
   */
  generateSuggestions(results, context) {
    const suggestions = []

    // Check for missing categories
    const presentCategories = new Set(results.patterns.map(p => p.category))
    for (const [categoryId, category] of Object.entries(this.categories)) {
      if (!presentCategories.has(categoryId)) {
        suggestions.push({
          type: 'missing_category',
          category: categoryId,
          message: `Consider adding ${category.name.toLowerCase()} elements`,
          priority: this.scoring.pattern_weights[categoryId] || 0.1
        })
      }
    }

    // Suggest improvements for negative patterns
    for (const negative of results.negativePatterns) {
      suggestions.push({
        type: 'improvement',
        pattern: negative.patternId,
        message: negative.improvement,
        priority: negative.severity === 'high' ? 0.9 : 0.5
      })
    }

    // Context-specific suggestions
    if (context.lens) {
      suggestions.push(...this.getLensSuggestions(context.lens, results))
    }

    // Sort by priority
    suggestions.sort((a, b) => b.priority - a.priority)

    return suggestions.slice(0, 5) // Top 5 suggestions
  }

  /**
   * Get lens-specific suggestions
   * @param {string} lens - Current lens (karen, qtb, lf1m, evna)
   * @param {Object} results - Analysis results
   * @returns {Array} Lens-specific suggestions
   */
  getLensSuggestions(lens, results) {
    const suggestions = []

    const lensPatterns = {
      karen_fiscal_conservative: ['evidence_strength', 'trust_building'],
      qtb_storyteller: ['emotional_resonance', 'value_alignment'],
      lf1m_truth_teller: ['counter_narrative', 'evidence_strength'],
      evna_emotional_intelligence: ['emotional_resonance', 'value_alignment']
    }

    const priorityCategories = lensPatterns[lens] || []
    for (const category of priorityCategories) {
      if (results.categoryScores[category].score < 50) {
        suggestions.push({
          type: 'lens_optimization',
          message: `Strengthen ${this.categories[category].name} for ${lens} effectiveness`,
          priority: 0.7
        })
      }
    }

    return suggestions
  }

  /**
   * Analyze a full policy document
   * @param {Object} policy - Policy object with lenses, scripts, etc.
   * @returns {Object} Comprehensive analysis
   */
  analyzePolicy(policy) {
    const analysis = {
      policyId: policy.metadata.id,
      overallScore: 0,
      lensAnalysis: {},
      scriptAnalysis: {},
      strengthAreas: [],
      improvementAreas: [],
      topPatterns: []
    }

    // Analyze each lens
    for (const [lensId, lens] of Object.entries(policy.lenses)) {
      const lensText = [
        lens.key_message,
        ...lens.evidence_points,
        lens.counter_narrative,
        lens.trust_builder
      ].join(' ')

      analysis.lensAnalysis[lensId] = this.analyzeText(lensText, { lens: lensId })
    }

    // Analyze conversation scripts
    const scriptTypes = ['door_to_door', 'phone_bank', 'social_media']
    for (const scriptType of scriptTypes) {
      if (policy.conversation_scripts[scriptType]) {
        const scriptText = policy.conversation_scripts[scriptType].join(' ')
        analysis.scriptAnalysis[scriptType] = this.analyzeText(scriptText, { scriptType })
      }
    }

    // Calculate overall score
    const allScores = [
      ...Object.values(analysis.lensAnalysis).map(a => a.score),
      ...Object.values(analysis.scriptAnalysis).map(a => a.score)
    ]
    analysis.overallScore = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    )

    // Identify strength and improvement areas
    analysis.strengthAreas = this.identifyStrengths(analysis)
    analysis.improvementAreas = this.identifyImprovements(analysis)
    analysis.topPatterns = this.identifyTopPatterns(analysis)

    return analysis
  }

  /**
   * Identify strength areas across analyses
   */
  identifyStrengths(analysis) {
    const strengths = []
    const allAnalyses = [
      ...Object.values(analysis.lensAnalysis),
      ...Object.values(analysis.scriptAnalysis)
    ]

    // Find consistently high-scoring categories
    const categoryScoreMap = {}
    for (const subAnalysis of allAnalyses) {
      for (const [category, data] of Object.entries(subAnalysis.categoryScores)) {
        if (!categoryScoreMap[category]) {
          categoryScoreMap[category] = []
        }
        categoryScoreMap[category].push(data.score)
      }
    }

    for (const [category, scores] of Object.entries(categoryScoreMap)) {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
      if (avgScore >= 70) {
        strengths.push({
          category,
          categoryName: this.categories[category].name,
          averageScore: Math.round(avgScore),
          consistency: scores.every(s => s >= 60) ? 'high' : 'medium'
        })
      }
    }

    return strengths.sort((a, b) => b.averageScore - a.averageScore)
  }

  /**
   * Identify improvement areas
   */
  identifyImprovements(analysis) {
    const improvements = []
    const allAnalyses = [
      ...Object.values(analysis.lensAnalysis),
      ...Object.values(analysis.scriptAnalysis)
    ]

    // Collect all suggestions
    const suggestionMap = new Map()
    for (const subAnalysis of allAnalyses) {
      for (const suggestion of subAnalysis.suggestions) {
        const key = suggestion.message
        if (!suggestionMap.has(key)) {
          suggestionMap.set(key, {
            ...suggestion,
            frequency: 0,
            contexts: []
          })
        }
        suggestionMap.get(key).frequency++
        suggestionMap.get(key).contexts.push(subAnalysis.metadata.context)
      }
    }

    // Convert to array and sort by frequency and priority
    improvements.push(...Array.from(suggestionMap.values())
      .sort((a, b) => b.frequency * b.priority - a.frequency * a.priority)
      .slice(0, 5))

    return improvements
  }

  /**
   * Identify most frequently used patterns
   */
  identifyTopPatterns(analysis) {
    const patternFrequency = new Map()
    const allAnalyses = [
      ...Object.values(analysis.lensAnalysis),
      ...Object.values(analysis.scriptAnalysis)
    ]

    for (const subAnalysis of allAnalyses) {
      for (const patternMatch of subAnalysis.patterns) {
        const key = patternMatch.patternId
        if (!patternFrequency.has(key)) {
          patternFrequency.set(key, {
            patternId: key,
            pattern: patternMatch.pattern,
            frequency: 0,
            contexts: []
          })
        }
        patternFrequency.get(key).frequency++
        patternFrequency.get(key).contexts.push(subAnalysis.metadata.context)
      }
    }

    return Array.from(patternFrequency.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  }
}

// Export singleton instance
export const patternEngine = new PolicyPatternEngine()