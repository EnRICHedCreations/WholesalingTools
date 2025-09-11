// ==============================================
// DEAL ANALYSIS CALCULATOR - MAIN.JS
// ==============================================

// Utility Functions
function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ==============================================
// ARV CALCULATOR FUNCTIONS
// ==============================================

// Calculate ARV (After Repair Value) - pure function
function getARVValue() {
    const comp1 = parseFloat(document.getElementById('comp1').value) || 0;
    const comp2 = parseFloat(document.getElementById('comp2').value) || 0;
    const comp3 = parseFloat(document.getElementById('comp3').value) || 0;
    
    let avgARV = 0;
    let compCount = 0;
    
    if (comp1 > 0) { avgARV += comp1; compCount++; }
    if (comp2 > 0) { avgARV += comp2; compCount++; }
    if (comp3 > 0) { avgARV += comp3; compCount++; }
    
    if (compCount > 0) {
        avgARV = avgARV / compCount;
    }
    
    return avgARV;
}

// Calculate ARV and update display
function calculateARV() {
    const avgARV = getARVValue();
    document.getElementById('calculatedARV').textContent = formatCurrency(avgARV);
    updateAllCalculators();
}

// ==============================================
// REPAIR COST FUNCTIONS
// ==============================================

// Get total repair costs - pure function
function getRepairsValue() {
    const totalRepairs = parseFloat(document.getElementById('totalRepairsInput').value) || 0;
    return { totalRepairs, contingency: 0 };
}

// Update simple repairs display
function updateSimpleRepairs() {
    const { totalRepairs } = getRepairsValue();
    
    document.getElementById('totalRepairs').textContent = formatCurrency(totalRepairs);
    
    updateAllCalculators();
}

// ==============================================
// RAPID OFFER SYSTEM CALCULATOR
// ==============================================

// Calculate offers based on Flip with Rick / Zach Ginn Wholesaling Formula
function calculateOffers({ ARV, repairs = 0 }) {
    if (!ARV || ARV <= 0) {
        throw new Error("ARV (After Repair Value) must be a positive number");
    }

    // Adjusted Value (ARV minus repairs)
    const netValue = ARV - repairs;

    let multiplier;

    if (ARV < 120000) {
        multiplier = 0.70; // 70%
    } else if (ARV >= 120000 && ARV <= 220000) {
        multiplier = 0.80; // 80%
    } else if (ARV > 220000 && ARV <= 300000) {
        multiplier = 0.815; // 81.5%
    } else if (ARV > 300000 && ARV <= 400000) {
        multiplier = 0.829; // 82.9%
    } else {
        multiplier = 0.849; // 84.9%
    }

    // Max Allowable Offer (MAO)
    const MAO = netValue * multiplier;

    // Least Allowable Offer (initial lowball = 70% of MAO)
    const LAO = MAO * 0.70;

    return {
        ARV,
        repairs,
        netValue,
        multiplier,
        MAO: Math.round(MAO),
        LAO: Math.round(LAO)
    };
}

// Calculate Rapid Offer System and update display
function calculateRapidOffers() {
    try {
        const arv = getARVValue();
        const { totalRepairs } = getRepairsValue();
        
        if (arv <= 0) {
            document.getElementById('rapidARV').textContent = '$0';
            document.getElementById('rapidMAO').textContent = '$0';
            document.getElementById('rapidLAO').textContent = '$0';
            document.getElementById('rapidMultiplier').textContent = '0%';
            return;
        }
        
        const result = calculateOffers({ ARV: arv, repairs: totalRepairs });
        
        // Update display elements
        document.getElementById('rapidARV').textContent = formatCurrency(result.ARV);
        document.getElementById('rapidMAO').textContent = formatCurrency(result.MAO);
        document.getElementById('rapidLAO').textContent = formatCurrency(result.LAO);
        document.getElementById('rapidMultiplier').textContent = (result.multiplier * 100).toFixed(1) + '%';
        
        // Color coding based on deal quality
        const maoEl = document.getElementById('rapidMAO');
        const laoEl = document.getElementById('rapidLAO');
        
        if (result.MAO > 100000) {
            maoEl.className = 'text-lg font-bold text-green-600 mt-1';
            laoEl.className = 'text-lg font-bold text-blue-600 mt-1';
        } else if (result.MAO > 50000) {
            maoEl.className = 'text-lg font-bold text-yellow-600 mt-1';
            laoEl.className = 'text-lg font-bold text-blue-600 mt-1';
        } else {
            maoEl.className = 'text-lg font-bold text-red-600 mt-1';
            laoEl.className = 'text-lg font-bold text-red-600 mt-1';
        }
        
    } catch (error) {
        console.error('Error calculating rapid offers:', error);
        document.getElementById('rapidMAO').textContent = 'Error';
        document.getElementById('rapidLAO').textContent = 'Error';
    }
}

// ==============================================
// CUSTOM PERCENTAGE CALCULATOR
// ==============================================

// Calculate custom percentage offer
function calculateCustomOffer() {
    try {
        const arv = getARVValue();
        const { totalRepairs } = getRepairsValue();
        const percentage = parseFloat(document.getElementById('customPercentage').value) || 75;
        
        // Update ARV and Repairs display
        document.getElementById('customARV').textContent = formatCurrency(arv);
        document.getElementById('customRepairs').textContent = formatCurrency(totalRepairs);
        
        if (arv <= 0) {
            document.getElementById('customMaxOffer').textContent = '$0';
            document.getElementById('customSpread').textContent = '$0';
            return;
        }
        
        // Calculate max offer: (ARV × percentage) - repairs
        const maxOffer = (arv * (percentage / 100)) - totalRepairs;
        
        // Calculate spread (profit potential)
        const spread = arv - totalRepairs - maxOffer;
        
        // Update display
        document.getElementById('customMaxOffer').textContent = formatCurrency(Math.max(maxOffer, 0));
        document.getElementById('customSpread').textContent = formatCurrency(Math.max(spread, 0));
        
        // Color coding based on spread percentage
        const spreadEl = document.getElementById('customSpread');
        if (spreadEl) {
            const spreadPercent = arv > 0 ? (spread / arv) * 100 : 0;
            if (spreadPercent >= 25) {
                spreadEl.className = 'text-lg font-bold text-green-600 mt-1';
            } else if (spreadPercent >= 15) {
                spreadEl.className = 'text-lg font-bold text-yellow-600 mt-1';
            } else {
                spreadEl.className = 'text-lg font-bold text-red-600 mt-1';
            }
        }
        
    } catch (error) {
        console.error('Error calculating custom offer:', error);
        document.getElementById('customMaxOffer').textContent = 'Error';
        document.getElementById('customSpread').textContent = 'Error';
    }
}

// ==============================================
// BUYER-FOCUSED PROFIT CALCULATOR
// ==============================================

// Calculate buyer-focused offer with closing costs and buyer profit
function calculateBuyerFocusedOffer() {
    try {
        const arv = getARVValue();
        const { totalRepairs } = getRepairsValue();
        
        // Update ARV and Repairs display
        document.getElementById('buyerFocusedARV').textContent = formatCurrency(arv);
        document.getElementById('buyerFocusedRepairs').textContent = formatCurrency(totalRepairs);
        
        if (arv <= 0) {
            document.getElementById('buyerFocusedClosing').textContent = '$0';
            document.getElementById('buyerFocusedProfit').textContent = '$0';
            document.getElementById('buyerFocusedMAO').textContent = '$0';
            document.getElementById('buyerFocusedLAO').textContent = '$0';
            return;
        }
        
        // Calculate closing costs (10% of ARV)
        const closingCosts = arv * 0.10;
        
        // Calculate buyer profit based on repair level
        let buyerProfit = 30000; // Default for under $30k repairs
        if (totalRepairs >= 50000 && totalRepairs <= 80000) {
            buyerProfit = 50000; // $50k profit for $50k-$80k repairs
        } else if (totalRepairs >= 30000 && totalRepairs < 50000) {
            buyerProfit = totalRepairs; // Same as repair amount for $30k-$50k repairs
        } else if (totalRepairs > 80000) {
            buyerProfit = 60000; // Higher profit for very high repair costs
        }
        
        // Simple Formula: ARV - Repairs - Closing Cost - Buyer Profit = MAO
        const mao = arv - totalRepairs - closingCosts - buyerProfit;
        
        // Calculate LAO (Local Assignment Offer): MAO × 70%
        const lao = mao * 0.70;
        
        // Update display elements
        document.getElementById('buyerFocusedClosing').textContent = formatCurrency(closingCosts);
        document.getElementById('buyerFocusedProfit').textContent = formatCurrency(buyerProfit);
        document.getElementById('buyerFocusedMAO').textContent = formatCurrency(Math.max(mao, 0));
        document.getElementById('buyerFocusedLAO').textContent = formatCurrency(Math.max(lao, 0));
        
        // Update color coding based on MAO viability
        const maoEl = document.getElementById('buyerFocusedMAO');
        const laoEl = document.getElementById('buyerFocusedLAO');
        
        if (maoEl) {
            if (mao > 50000) {
                maoEl.className = 'text-lg font-bold text-green-600 mt-1'; // Excellent offer
            } else if (mao > 25000) {
                maoEl.className = 'text-lg font-bold text-blue-600 mt-1'; // Good offer
            } else if (mao > 10000) {
                maoEl.className = 'text-lg font-bold text-yellow-600 mt-1'; // Marginal offer
            } else if (mao > 0) {
                maoEl.className = 'text-lg font-bold text-orange-600 mt-1'; // Low offer
            } else {
                maoEl.className = 'text-lg font-bold text-red-600 mt-1'; // No deal/negative
            }
        }
        
        if (laoEl) {
            if (lao > 35000) {
                laoEl.className = 'text-lg font-bold text-blue-600 mt-1';
            } else if (lao > 15000) {
                laoEl.className = 'text-lg font-bold text-yellow-600 mt-1';
            } else {
                laoEl.className = 'text-lg font-bold text-red-600 mt-1';
            }
        }
        
    } catch (error) {
        console.error('Error calculating buyer-focused offer:', error);
        document.getElementById('buyerFocusedMAO').textContent = 'Error';
        document.getElementById('buyerFocusedLAO').textContent = 'Error';
    }
}

// ==============================================
// MARKET COMPARABLES RESEARCH
// ==============================================

// Open Homes.com with search parameters
function researchComparables() {
    const neighborhood = document.getElementById('neighborhood').value || '';
    const priceRangeLow = document.getElementById('priceRangeLow').value || '';
    const priceRangeHigh = document.getElementById('priceRangeHigh').value || '';
    const minBeds = document.getElementById('minBeds').value || '';
    const minBaths = document.getElementById('minBaths').value || '';
    const minSqft = document.getElementById('minSqft').value || '';
    
    if (!neighborhood) {
        alert('Please enter a neighborhood or zip code first, then click "Research Comparables"');
        return;
    }
    
    // Build Homes.com URL
    let homesUrl = 'https://www.homes.com/for-sale/';
    if (neighborhood) {
        homesUrl += encodeURIComponent(neighborhood) + '/';
    }
    
    const homesParams = new URLSearchParams();
    if (priceRangeLow) homesParams.append('min_price', priceRangeLow);
    if (priceRangeHigh) homesParams.append('max_price', priceRangeHigh);
    if (minBeds) homesParams.append('min_beds', minBeds);
    if (minBaths) homesParams.append('min_baths', minBaths);
    if (minSqft) homesParams.append('min_sqft', minSqft);
    
    if (homesParams.toString()) {
        homesUrl += '?' + homesParams.toString();
    }
    
    window.open(homesUrl, '_blank');
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Update all calculators when data changes
function updateAllCalculators() {
    calculateRapidOffers();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
}

// Clear all analysis data
function clearAnalysis() {
    if (confirm('Clear all deal analysis data?')) {
        // Property info
        document.getElementById('propAddress').value = '';
        document.getElementById('propSqft').value = '';
        document.getElementById('propBeds').value = '';
        document.getElementById('propBaths').value = '';
        
        // ARV Calculator
        document.getElementById('comp1').value = '';
        document.getElementById('comp2').value = '';
        document.getElementById('comp3').value = '';
        document.getElementById('calculatedARV').textContent = '$0';
        
        // Repair costs
        document.getElementById('totalRepairsInput').value = '';
        document.getElementById('totalRepairs').textContent = '$0';
        
        // Custom percentage
        document.getElementById('customPercentage').value = '';
        
        // Market comparables
        document.getElementById('neighborhood').value = '';
        document.getElementById('priceRangeLow').value = '';
        document.getElementById('priceRangeHigh').value = '';
        document.getElementById('minBeds').value = '';
        document.getElementById('minBaths').value = '';
        document.getElementById('minSqft').value = '';
        
        // Reset all calculated values
        updateAllCalculators();
        
        // Show success message
        alert('All data cleared successfully!');
    }
}

// ==============================================
// INITIALIZATION
// ==============================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Deal Analysis Calculator loaded successfully!');
    
    // Set default custom percentage
    document.getElementById('customPercentage').value = '75';
    
    // Initialize all calculators
    updateAllCalculators();
    
    // Add event listeners for real-time updates
    const inputs = [
        'comp1', 'comp2', 'comp3',
        'totalRepairsInput',
        'customPercentage'
    ];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', updateAllCalculators);
            element.addEventListener('change', updateAllCalculators);
        }
    });
    
    console.log('Event listeners attached successfully!');
});

// ==============================================
// KEYBOARD SHORTCUTS
// ==============================================

// Add keyboard shortcuts for power users
document.addEventListener('keydown', function(e) {
    // Ctrl+R or Cmd+R - Clear all data (prevent default browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        clearAnalysis();
    }
    
    // Ctrl+Enter or Cmd+Enter - Research comparables
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        researchComparables();
    }
});

// ==============================================
// ADDITIONAL HELPER FUNCTIONS
// ==============================================

// Format percentage
function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
}

// Validate numeric input
function validateNumericInput(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.max(min, Math.min(max, num));
}

// Calculate deal score (for future enhancements)
function calculateDealScore(arv, repairs, maxOffer) {
    if (arv <= 0) return 0;
    
    const profitMargin = ((arv - repairs - maxOffer) / arv) * 100;
    
    if (profitMargin >= 30) return 100;
    if (profitMargin >= 25) return 90;
    if (profitMargin >= 20) return 80;
    if (profitMargin >= 15) return 70;
    if (profitMargin >= 10) return 60;
    if (profitMargin >= 5) return 40;
    return 20;
}

// Export functions for testing or external use
window.DealAnalysis = {
    formatCurrency,
    getARVValue,
    getRepairsValue,
    calculateOffers,
    calculateRapidOffers,
    calculateCustomOffer,
    calculateBuyerFocusedOffer,
    researchComparables,
    clearAnalysis,
    updateAllCalculators
};

console.log('Deal Analysis Calculator v1.0 - Ready for use!');
