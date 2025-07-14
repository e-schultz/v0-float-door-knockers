#!/usr/bin/env node

/**
 * Test script for X-Ray Pattern Engine
 */

import { patternEngine } from './src/lib/patternEngine.js'

// Test text from Tim Walz policy
const testText = `Universal free school meals cost $2/day but save families $1,000/year. 
Even fiscal conservatives support it because it eliminates bureaucratic waste. 
150 million meals served means 150 million moments of community care.
70% approval across all demographics in Minnesota proves progressive policy works.`

console.log('=== Testing Policy X-Ray Pattern Engine ===\n')
console.log('Test Text:')
console.log(testText)
console.log('\n---\n')

// Analyze the text
const analysis = patternEngine.analyzeText(testText, {
  policy: 'free_school_meals',
  lens: 'karen_fiscal_conservative'
})

console.log('Analysis Results:')
console.log(`Overall Score: ${analysis.score}%`)
console.log(`\nPatterns Found: ${analysis.patterns.length}`)

analysis.patterns.forEach(pattern => {
  console.log(`\n- ${pattern.pattern.name} (${pattern.category})`)
  console.log(`  Severity: ${pattern.severity}`)
  console.log(`  Matches: ${pattern.matches.length}`)
  pattern.matches.forEach(match => {
    console.log(`    • "${match.indicator}" at position ${match.index}`)
  })
})

console.log('\n\nCategory Scores:')
Object.entries(analysis.categoryScores).forEach(([category, data]) => {
  if (data.score > 0) {
    console.log(`- ${category}: ${data.score}% (${data.count} patterns)`)
  }
})

console.log('\n\nSuggestions:')
analysis.suggestions.forEach((suggestion, idx) => {
  console.log(`${idx + 1}. ${suggestion.message} (priority: ${suggestion.priority})`)
})

console.log('\n=== Test Complete ===')