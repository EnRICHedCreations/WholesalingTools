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
    
    // Update all other calculators
    calculateRapidOffers();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
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
    
    // Update all other calculators
    calculateRapidOffers();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
}

// ==============================================
// RAPID OFFER SYSTEM CALCULATOR
// ==============================================

// Calculate offers based on Flip with Rick / Zach Ginn Wholesaling Formula
function calculateOffers({ ARV, repairs = 0 }) {
    if (!ARV || ARV <= 0) {
        return {
            ARV: 0,
            repairs: 0,
            netValue: 0,
            multiplier: 0,
            MAO: 0,
            LAO: 0
        };
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
    const arv = getARVValue();
    const { totalRepairs } = getRepairsValue();
    
    const result = calculateOffers({ ARV: arv, repairs: totalRepairs });
    
    // Update display elements
    document.getElementById('rapidARV').textContent = formatCurrency(result.ARV);
    document.getElementById('rapidMAO').textContent = formatCurrency(result.MAO);
    document.getElementById('rapidLAO').textContent = formatCurrency(result.LAO);
    document.getElementById('rapidMultiplier').textContent = (result.multiplier * 100).toFixed(1) + '%';
}

// ==============================================
// CUSTOM PERCENTAGE CALCULATOR
// ==============================================

// Calculate custom percentage offer
function calculateCustomOffer() {
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
}

// ==============================================
// BUYER-FOCUSED PROFIT CALCULATOR
// ==============================================

// Calculate buyer-focused offer with closing costs and buyer profit
function calculateBuyerFocusedOffer() {
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
}

// ==============================================
// PROFIT MARGIN ANALYSIS
// ==============================================

// Update profit display with all calculations
function updateProfitDisplay() {
    const arv = getARVValue();
    const { totalRepairs } = getRepairsValue();
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const assignmentFee = parseFloat(document.getElementById('assignmentFee').value) || 0;
    const marketingCosts = parseFloat(document.getElementById('marketingCosts').value) || 0;
    const otherCosts = parseFloat(document.getElementById('otherCosts').value) || 0;
    
    // Calculate profits
    const grossProfit = assignmentFee;
    const totalCosts = marketingCosts + otherCosts;
    const netProfit = grossProfit - totalCosts;
    
    // Calculate profit margin (net profit / purchase price)
    const profitMargin = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0;
    
    // Update display
    document.getElementById('grossProfit').textContent = formatCurrency(grossProfit);
    document.getElementById('netProfit').textContent = formatCurrency(netProfit);
    document.getElementById('profitMargin').textContent = profitMargin.toFixed(1) + '%';
    
    // Calculate deal score and evaluation
    const dealScore = calculateDealScore(arv, totalRepairs, purchasePrice, netProfit);
    updateDealEvaluation(dealScore);
    
    // Update ROI calculator since it depends on net profit
    updateROIDisplay();
}

// Calculate deal score
function calculateDealScore(arv, repairs, purchasePrice, netProfit) {
    if (arv <= 0 || purchasePrice <= 0) return 0;
    
    // Multiple scoring factors
    const profitMargin = (netProfit / purchasePrice) * 100;
    const totalInvestment = purchasePrice + repairs;
    const totalSpread = arv - totalInvestment;
    const spreadPercentage = (totalSpread / arv) * 100;
    
    let score = 0;
    
    // Profit margin scoring (40% weight)
    if (profitMargin >= 5) score += 40;
    else if (profitMargin >= 3) score += 30;
    else if (profitMargin >= 2) score += 20;
    else if (profitMargin >= 1) score += 10;
    
    // Spread percentage scoring (40% weight)
    if (spreadPercentage >= 25) score += 40;
    else if (spreadPercentage >= 20) score += 30;
    else if (spreadPercentage >= 15) score += 20;
    else if (spreadPercentage >= 10) score += 10;
    
    // Net profit absolute amount scoring (20% weight)
    if (netProfit >= 10000) score += 20;
    else if (netProfit >= 7500) score += 15;
    else if (netProfit >= 5000) score += 10;
    else if (netProfit >= 2500) score += 5;
    
    return Math.min(100, score);
}

// Update deal evaluation based on score
function updateDealEvaluation(dealScore) {
    let evaluation = '';
    
    if (dealScore >= 90) {
        evaluation = '🎯 EXCELLENT DEAL - Outstanding profits with low risk. High ROI potential.';
    } else if (dealScore >= 70) {
        evaluation = '✅ GOOD DEAL - Solid profits with acceptable risk. Worth pursuing.';
    } else if (dealScore >= 60) {
        evaluation = '⚠️ MARGINAL DEAL - Lower profits but still viable. Consider negotiating better terms.';
    } else if (dealScore >= 40) {
        evaluation = '❌ POOR DEAL - Low profit margins. High risk, not recommended.';
    } else {
        evaluation = '🛑 BAD DEAL - Negative or very low returns. Avoid this deal.';
    }
    
    document.getElementById('dealEvaluation').textContent = evaluation;
}

// ==============================================
// ROI CALCULATOR
// ==============================================

// Update ROI display
function updateROIDisplay() {
    // Get net profit from the profit analysis
    const netProfitText = document.getElementById('netProfit').textContent || '$0';
    const netProfit = parseFloat(netProfitText.replace(/[$,]/g, '')) || 0;
    
    const timeInvestment = parseFloat(document.getElementById('timeInvestment').value) || 0;
    const hourlyTarget = parseFloat(document.getElementById('hourlyTarget').value) || 0;
    const daysToClose = parseFloat(document.getElementById('daysToClose').value) || 0;
    const cashInvested = parseFloat(document.getElementById('cashInvested').value) || 0;
    
    // Calculate actual hourly rate
    const actualHourlyRate = timeInvestment > 0 ? netProfit / timeInvestment : 0;
    
    // Calculate cash ROI
    const cashROI = cashInvested > 0 ? (netProfit / cashInvested) * 100 : 0;
    
    // Calculate annualized ROI
    const annualizedROI = daysToClose > 0 ? (cashROI * 365) / daysToClose : 0;
    
    // Update display
    document.getElementById('actualHourlyRate').textContent = formatCurrency(actualHourlyRate);
    document.getElementById('cashROI').textContent = cashROI.toFixed(1) + '%';
    document.getElementById('annualizedROI').textContent = annualizedROI.toFixed(1) + '%';
    
    // Calculate and display ROI grade
    updateROIGrade(actualHourlyRate, hourlyTarget, cashROI);
}

// Update ROI grade
function updateROIGrade(actualHourlyRate, hourlyTarget, cashROI) {
    let grade = '';
    
    const hourlyRatio = hourlyTarget > 0 ? actualHourlyRate / hourlyTarget : 0;
    
    if (hourlyRatio >= 1.5 && cashROI > 150) {
        grade = 'A+ EXCEPTIONAL - Outstanding returns across all metrics';
    } else if (hourlyRatio >= 1.2 && cashROI > 100) {
        grade = 'A EXCELLENT - Strong returns, highly profitable deal';
    } else if (hourlyRatio >= 1.0 && cashROI > 50) {
        grade = 'B+ GOOD - Meets targets with solid returns';
    } else if (hourlyRatio >= 0.8 && cashROI > 25) {
        grade = 'B ACCEPTABLE - Reasonable returns, consider if strategic';
    } else if (hourlyRatio >= 0.6 && cashROI > 10) {
        grade = 'C MARGINAL - Below targets, proceed with caution';
    } else {
        grade = 'D POOR - Insufficient returns, not recommended';
    }
    
    document.getElementById('roiGrade').textContent = grade;
}

// ==============================================
// AI PROPERTY ASSESSMENT & PROMPT GENERATOR
// ==============================================

// Get AI form data
function getAIFormData() {
    const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;
    
    return {
        // Property Details
        sqft: getValue('aiSqft'),
        yearBuilt: getValue('aiYearBuilt'),
        stories: getValue('aiStories'),
        
        // Room Counts
        bedrooms: getValue('aiBedrooms'),
        bathrooms: getValue('aiBathrooms'),
        windows: getValue('aiWindows'),
        
        // Structural & Systems
        roofPercent: getValue('aiRoofPercent'),
        hvacUnits: getValue('aiHvacUnits'),
        flooringSqft: getValue('aiFlooringSqft')
    };
}

// Check if any input has data
function hasAnyInput(data) {
    return Object.values(data).some(value => value > 0);
}

// Generate AI Prompt
function generateAIPrompt(data) {
    if (!hasAnyInput(data)) {
        document.getElementById('aiPromptOutput').value = '';
        document.getElementById('chatGPTLink').href = '#';
        return;
    }

    const prompt = `Please provide a detailed repair cost estimate for a residential property with the following specifications:

PROPERTY DETAILS:
• Square Footage: ${data.sqft} sq ft
• Year Built: ${data.yearBuilt}
• Number of Stories: ${data.stories}

REPAIR REQUIREMENTS:

Structural & Exterior:
• Roof repairs needed: ${data.roofPercent}% of total roof area
• Windows needing replacement: ${data.windows}

Interior Repairs:
• Bedrooms needing repair: ${data.bedrooms}
• Bathrooms needing repair: ${data.bathrooms}
• Flooring replacement: ${data.flooringSqft} sq ft

Systems & Mechanical:
• HVAC units needing repair/replace: ${data.hvacUnits}

Please provide:
1. Itemized cost breakdown for each category
2. Labor costs and timeline estimates
3. Total repair cost estimate with 15% contingency
4. Regional cost considerations
5. Potential cost-saving alternatives where applicable

Format the response in a clear, organized manner suitable for real estate investment analysis.`;

    document.getElementById('aiPromptOutput').value = prompt;
    
    // Update ChatGPT link
    const encodedPrompt = encodeURIComponent(prompt);
    document.getElementById('chatGPTLink').href = `https://chat.openai.com/?q=${encodedPrompt}`;
}

// Update AI Calculator
function updateAICalculator() {
    const data = getAIFormData();
    generateAIPrompt(data);
}

// Copy prompt to clipboard
function copyPromptToClipboard() {
    const promptText = document.getElementById('aiPromptOutput').value;
    if (!promptText) {
        alert('Please fill out the form first to generate a prompt.');
        return;
    }
    
    navigator.clipboard.writeText(promptText).then(() => {
        // Temporarily change button text
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('bg-green-600');
        button.classList.remove('bg-blue-600');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
            button.classList.add('bg-blue-600');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please copy manually.');
    });
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
        
        // AI Property Assessment
        document.getElementById('aiSqft').value = '';
        document.getElementById('aiYearBuilt').value = '';
        document.getElementById('aiStories').value = '';
        document.getElementById('aiBedrooms').value = '';
        document.getElementById('aiBathrooms').value = '';
        document.getElementById('aiWindows').value = '';
        document.getElementById('aiRoofPercent').value = '';
        document.getElementById('aiHvacUnits').value = '';
        document.getElementById('aiFlooringSqft').value = '';
        document.getElementById('aiPromptOutput').value = '';
        document.getElementById('chatGPTLink').href = '#';
        
        // Profit Analysis
        document.getElementById('purchasePrice').value = '';
        document.getElementById('assignmentFee').value = '';
        document.getElementById('marketingCosts').value = '';
        document.getElementById('otherCosts').value = '';
        document.getElementById('grossProfit').textContent = '$0';
        document.getElementById('netProfit').textContent = '$0';
        document.getElementById('profitMargin').textContent = '0%';
        document.getElementById('dealEvaluation').textContent = 'Enter deal details above';
        
        // ROI Calculator
        document.getElementById('timeInvestment').value = '';
        document.getElementById('hourlyTarget').value = '';
        document.getElementById('daysToClose').value = '';
        document.getElementById('cashInvested').value = '';
        document.getElementById('actualHourlyRate').textContent = '$0';
        document.getElementById('cashROI').textContent = '0%';
        document.getElementById('annualizedROI').textContent = '0%';
        document.getElementById('roiGrade').textContent = 'Enter data above';
        
        // Custom percentage
        document.getElementById('customPercentage').value = '75';
        
        // Market comparables
        document.getElementById('neighborhood').value = '';
        document.getElementById('priceRangeLow').value = '';
        document.getElementById('priceRangeHigh').value = '';
        document.getElementById('minBeds').value = '';
        document.getElementById('minBaths').value = '';
        document.getElementById('minSqft').value = '';
        
        // Reset all calculated values
        calculateARV();
        updateSimpleRepairs();
        updateProfitDisplay();
        
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
    
    console.log('Deal Analysis Calculator v2.0 - Ready for use!');
});

console.log('Deal Analysis Calculator v2.0 - Scripts loaded!');