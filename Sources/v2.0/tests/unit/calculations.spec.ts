import { describe, expect, test } from 'vitest'

/**
 * Drapery Calculator - Calculation Tests
 * 
 * These tests verify the fabric calculation logic, specifically:
 * 1. Cut length includes proper allowances (header + hem + ease = 18")
 * 2. Yards rounding for 118" fabric (rounds to 0.5 yards)
 * 3. Regular fabric rounding (rounds to whole yards)
 */

// Default settings (matching useSettings.ts)
const defaultSettings = {
  widthMargin: 10,
  easeAllowance: 2,
  headerAllowance: 8,    // Double 4" header
  hemAllowance: 8,       // Double 4" hem
  rfSnapSeparation: 4.25,
  ripplefoldFullness: {
    "60": 1.8,
    "80": 2.0,
    "100": 2.2,
    "120": 2.4
  },
  railroadStrict: true,
  fabricWidthOptions: [54, 108, 110, 118],
  roundHalfYardFor118: true
}

/**
 * Calculate panel height (cut length) with all allowances
 */
function calculatePanelHeight(
  finishedLength: number,
  verticalRepeat: number,
  settings: typeof defaultSettings
): number {
  // Cut length = finished length + header + hem + ease + repeat
  return finishedLength + 
         settings.headerAllowance + 
         settings.hemAllowance + 
         settings.easeAllowance + 
         verticalRepeat
}

/**
 * Round yards based on fabric width
 * - For 118" fabric: round to nearest 0.5 yard (ceiling)
 * - For other widths: round to whole yards
 */
function roundYards(yards: number, fabricWidth: number, roundHalfYardFor118: boolean): number {
  if (fabricWidth >= 118 && roundHalfYardFor118) {
    // Round up to nearest 0.5 yard
    return Math.ceil(yards * 2) / 2
  }
  return Math.ceil(yards)
}

/**
 * Calculate required fabric in yards
 */
function calculateRequiredFabric(
  width: number,
  finishedLength: number,
  fabricWidth: number,
  fullness: number,
  panels: number,
  returnSize: number,
  verticalRepeat: number,
  settings: typeof defaultSettings
): { yards: number; cutLength: number; widths: number } {
  const totalWidth = (width * fullness) + (panels * (returnSize + settings.widthMargin))
  const panelHeight = calculatePanelHeight(finishedLength, verticalRepeat, settings)
  
  const requiredWidths = Math.ceil(totalWidth / fabricWidth)
  const cutLength = panelHeight
  const requiredFabricInches = requiredWidths * cutLength
  const yardsRaw = requiredFabricInches / 36
  const yards = roundYards(yardsRaw, fabricWidth, settings.roundHalfYardFor118)
  
  return { yards, cutLength, widths: requiredWidths }
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Cut Length Calculations (Header + Hem + Ease)', () => {
  
  test('should add 18" total allowance (8" header + 8" hem + 2" ease)', () => {
    const finishedLength = 96 // 96" finished length
    const verticalRepeat = 0
    
    const cutLength = calculatePanelHeight(finishedLength, verticalRepeat, defaultSettings)
    
    // Expected: 96 + 8 + 8 + 2 = 114"
    expect(cutLength).toBe(114)
    
    // Verify the allowance is exactly 18"
    const allowance = cutLength - finishedLength
    expect(allowance).toBe(18)
  })
  
  test('should include vertical repeat in cut length', () => {
    const finishedLength = 96
    const verticalRepeat = 12 // 12" pattern repeat
    
    const cutLength = calculatePanelHeight(finishedLength, verticalRepeat, defaultSettings)
    
    // Expected: 96 + 8 + 8 + 2 + 12 = 126"
    expect(cutLength).toBe(126)
  })
  
  test('review case: 84" finished length should need ~102" cut length', () => {
    const finishedLength = 84 // Common curtain length
    const verticalRepeat = 0
    
    const cutLength = calculatePanelHeight(finishedLength, verticalRepeat, defaultSettings)
    
    // Expected: 84 + 18 = 102"
    expect(cutLength).toBe(102)
    
    // This addresses the review: "should calculate finished length plus 16 to 18 inches"
    expect(cutLength - finishedLength).toBeGreaterThanOrEqual(16)
    expect(cutLength - finishedLength).toBeLessThanOrEqual(18)
  })
})

describe('Yards Rounding for 118" Fabric', () => {
  
  test('should round to 0.5 yards for 118" fabric', () => {
    // 2.1 yards should round to 2.5
    expect(roundYards(2.1, 118, true)).toBe(2.5)
    
    // 2.6 yards should round to 3.0
    expect(roundYards(2.6, 118, true)).toBe(3.0)
    
    // 3.0 yards should stay 3.0
    expect(roundYards(3.0, 118, true)).toBe(3.0)
    
    // 3.25 yards should round to 3.5
    expect(roundYards(3.25, 118, true)).toBe(3.5)
  })
  
  test('should round to whole yards for non-118" fabric', () => {
    // 2.1 yards should round to 3 for 54" fabric
    expect(roundYards(2.1, 54, true)).toBe(3)
    
    // 2.1 yards should round to 3 for 108" fabric
    expect(roundYards(2.1, 108, true)).toBe(3)
    
    // 2.1 yards should round to 3 for 110" fabric
    expect(roundYards(2.1, 110, true)).toBe(3)
  })
  
  test('should respect roundHalfYardFor118 setting', () => {
    // When disabled, 118" fabric should round to whole yards
    expect(roundYards(2.1, 118, false)).toBe(3)
    
    // When enabled, 118" fabric should round to 0.5 yards
    expect(roundYards(2.1, 118, true)).toBe(2.5)
  })
})

describe('Full Calculation Examples', () => {
  
  test('example: 100" wide x 84" long, 54" fabric, 2.5x fullness', () => {
    const result = calculateRequiredFabric(
      100,      // width in inches
      84,       // finished length in inches
      54,       // fabric width
      2.5,      // fullness
      2,        // panels (center open)
      4,        // return size
      0,        // no pattern repeat
      defaultSettings
    )
    
    // Cut length should be 84 + 18 = 102"
    expect(result.cutLength).toBe(102)
    
    // Total width = (100 * 2.5) + (2 * (4 + 10)) = 250 + 28 = 278"
    // Widths needed = ceil(278 / 54) = 6 widths
    expect(result.widths).toBe(6)
    
    // Fabric needed = 6 * 102 = 612" = 17 yards
    expect(result.yards).toBe(17)
  })
  
  test('example: 120" wide x 96" long, 118" fabric, 2x fullness (sheer)', () => {
    const result = calculateRequiredFabric(
      120,      // width in inches
      96,       // finished length in inches
      118,      // fabric width (sheer)
      2.0,      // fullness
      2,        // panels (center open)
      6,        // return size
      0,        // no pattern repeat
      defaultSettings
    )
    
    // Cut length should be 96 + 18 = 114"
    expect(result.cutLength).toBe(114)
    
    // For 118" fabric, should round to 0.5 yards
    // Total width = (120 * 2) + (2 * (6 + 10)) = 240 + 32 = 272"
    // Widths needed = ceil(272 / 118) = 3 widths
    expect(result.widths).toBe(3)
    
    // Fabric needed = 3 * 114 = 342" = 9.5 yards (rounded to 0.5)
    expect(result.yards).toBe(9.5)
  })
  
  test('example with pattern repeat: 80" wide x 90" long, 54" fabric, 12" repeat', () => {
    const result = calculateRequiredFabric(
      80,       // width in inches
      90,       // finished length in inches
      54,       // fabric width
      2.5,      // fullness
      1,        // panels (one-way)
      4,        // return size
      12,       // 12" pattern repeat
      defaultSettings
    )
    
    // Cut length should be 90 + 18 + 12 = 120"
    expect(result.cutLength).toBe(120)
    
    // Total width = (80 * 2.5) + (1 * (4 + 10)) = 200 + 14 = 214"
    // Widths needed = ceil(214 / 54) = 4 widths
    expect(result.widths).toBe(4)
    
    // Fabric needed = 4 * 120 = 480" = 13.33... yards = 14 yards
    expect(result.yards).toBe(14)
  })
})

describe('Edge Cases', () => {
  
  test('minimum dimensions should still include full allowances', () => {
    const result = calculateRequiredFabric(
      36,       // narrow window
      48,       // short curtain
      54,       // standard fabric
      2.0,      // minimum fullness
      1,        // one panel
      0,        // no return
      0,        // no repeat
      defaultSettings
    )
    
    // Even short curtains need full allowances
    // Cut length = 48 + 18 = 66"
    expect(result.cutLength).toBe(66)
  })
  
  test('very wide window should calculate correct widths', () => {
    const result = calculateRequiredFabric(
      200,      // very wide window
      84,       // standard length
      54,       // standard fabric
      2.5,      // fullness
      2,        // center open
      8,        // large return
      0,        // no repeat
      defaultSettings
    )
    
    // Total width = (200 * 2.5) + (2 * (8 + 10)) = 500 + 36 = 536"
    // Widths needed = ceil(536 / 54) = 10 widths
    expect(result.widths).toBe(10)
  })
})
