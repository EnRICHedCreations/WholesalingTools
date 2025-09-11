// Deal Analysis Calculator JavaScript Functions
// Extracted from dashboard.js for standalone use

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.alert-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = `alert-message fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
        type === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'
    }`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// ===========================================
// ARV CALCULATOR
// ===========================================

function getARVValue() {
    const comp1 = parseFloat(document.getElementById('comp1').value) || 0;
    const comp2 = parseFloat(document.getElementById('comp2').value) || 0;
    const comp3 = parseFloat(document.getElementById('comp3').value) || 0;
    
    let avgARV = 0;
    let compCount = 0;
    
    if (comp1 > 0) { avgARV += comp1; compCount++; }
    if (comp2 > 0) { avgARV += comp2; compCount++; }
    if (comp3 > 0) { avgARV += comp3; compCount++; }
    
    return compCount > 0 ? avgARV / compCount : 0;
}

function calculateARV() {
    const avgARV = getARVValue();
    document.getElementById('calculatedARV').textContent = formatCurrency(avgARV);
    updateProfitDisplay();
}

// ===========================================
// REPAIR COST CALCULATOR
// ===========================================

function getRepairsValue() {
    const totalRepairs = parseFloat(document.getElementById('totalRepairsInput').value) || 0;
    return { totalRepairs, contingency: 0 };
}

function updateSimpleRepairs() {
    const { totalRepairs } = getRepairsValue();
    
    document.getElementById('totalRepairs').textContent = formatCurrency(totalRepairs);
    
    updateProfitDisplay();
}

function calculateRepairs() {
    updateSimpleRepairs();
}

// ===========================================
// PROFIT ANALYSIS
// ===========================================

function calculateProfit() {
    updateProfitDisplay();
}

function updateProfitDisplay() {
    const arv = getARVValue();
    const { totalRepairs } = getRepairsValue();
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const assignmentFee = parseFloat(document.getElementById('assignmentFee').value) || 0;
    const marketingCosts = parseFloat(document.getElementById('marketingCosts').value) || 0;
    const otherCosts = parseFloat(document.getElementById('otherCosts').value) || 0;
    
    const closingFees = arv * 0.1; // 10% of ARV
    const totalCosts = marketingCosts + otherCosts;
    
    // Calculate buyer's profit potential
    const buyerProfit = arv - purchasePrice - totalRepairs - closingFees - assignmentFee;
    
    // Calculate your net profit
    const yourProfit = assignmentFee - totalCosts;
    
    // Update display elements
    document.getElementById('profitARV').textContent = formatCurrency(arv);
    document.getElementById('profitPurchase').textContent = formatCurrency(purchasePrice);
    document.getElementById('profitRepairs').textContent = formatCurrency(totalRepairs);
    document.getElementById('profitClosingFees').textContent = formatCurrency(closingFees);
    document.getElementById('profitAssignment').textContent = formatCurrency(assignmentFee);
    document.getElementById('profitCosts').textContent = formatCurrency(totalCosts);
    document.getElementById('buyerProfit').textContent = formatCurrency(buyerProfit);
    document.getElementById('yourProfit').textContent = formatCurrency(yourProfit);
    
    // Update ROI display
    updateROIDisplay();
    
    // Update Rapid Offer System
    updateRapidOfferSystem();
    
    // Calculate Custom Offer automatically
    calculateCustomOffer();
    
    // Calculate Buyer-Focused Offer automatically
    calculateBuyerFocusedOffer();
}

// ===========================================
// ROI CALCULATOR
// ===========================================

function calculateROI() {
    updateROIDisplay();
}

function updateROIDisplay() {
    const assignmentFee = parseFloat(document.getElementById('assignmentFee').value) || 0;
    const marketingCosts = parseFloat(document.getElementById('marketingCosts').value) || 0;
    const otherCosts = parseFloat(document.getElementById('otherCosts').value) || 0;
    const timeInvestment = parseFloat(document.getElementById('timeInvestment').value) || 0;
    const hourlyTarget = parseFloat(document.getElementById('hourlyTarget').value) || 0;
    const daysToClose = parseFloat(document.getElementById('daysToClose').value) || 30;
    
    const totalCosts = marketingCosts + otherCosts;
    const netProfit = assignmentFee - totalCosts;
    
    // Calculate metrics
    const profitPerHour = timeInvestment > 0 ? netProfit / timeInvestment : 0;
    const monthlyROI = daysToClose > 0 ? (netProfit / daysToClose) * 30 : 0;
    
    // Calculate deal score
    let dealScore = 'F';
    let dealColor = 'text-red-600';
    
    if (profitPerHour >= hourlyTarget * 2) {
        dealScore = 'A+';
        dealColor = 'text-green-600';
    } else if (profitPerHour >= hourlyTarget * 1.5) {
        dealScore = 'A';
        dealColor = 'text-green-600';
    } else if (profitPerHour >= hourlyTarget) {
        dealScore = 'B';
        dealColor = 'text-blue-600';
    } else if (profitPerHour >= hourlyTarget * 0.75) {
        dealScore = 'C';
        dealColor = 'text-yellow-600';
    } else if (profitPerHour >= hourlyTarget * 0.5) {
        dealScore = 'D';
        dealColor = 'text-orange-600';
    }
    
    // Update display
    document.getElementById('profitPerHour').textContent = formatCurrency(profitPerHour);
    document.getElementById('monthlyROI').textContent = formatCurrency(monthlyROI);
    const dealScoreEl = document.getElementById('dealScore');
    dealScoreEl.textContent = dealScore;
    dealScoreEl.className = `text-lg font-bold ${dealColor}`;
    
    // Update evaluation text
    let evaluation = '';
    if (netProfit <= 0) {
        evaluation = 'This deal will lose money. Not recommended.';
    } else if (dealScore === 'A+' || dealScore === 'A') {
        evaluation = 'Excellent deal! High profit per hour and great ROI.';
    } else if (dealScore === 'B') {
        evaluation = 'Good deal. Meets your hourly target.';
    } else if (dealScore === 'C') {
        evaluation = 'Average deal. Consider if you have better options.';
    } else if (dealScore === 'D') {
        evaluation = 'Below target deal. Only take if needed for cash flow.';
    } else {
        evaluation = 'Poor deal. Very low profit per hour.';
    }
    
    document.getElementById('dealEvaluation').textContent = evaluation;
}

// ===========================================
// RAPID OFFER SYSTEM
// ===========================================

function updateRapidOfferSystem() {
    const arv = getARVValue();
    const { totalRepairs } = getRepairsValue();
    
    if (arv <= 0) {
        document.getElementById('rapidNetValue').textContent = '$0';
        document.getElementById('rapidMultiplier').textContent = '0%';
        document.getElementById('rapidMAO').textContent = '$0';
        document.getElementById('rapidLAO').textContent = '$0';
        return;
    }
    
    const netValue = arv - totalRepairs;
    
    // Determine multiplier based on ARV
    let multiplier = 0.70; // Default 70%
    if (arv >= 400000) {
        multiplier = 0.849; // 84.9%
    } else if (arv >= 300000) {
        multiplier = 0.829; // 82.9%
    } else if (arv >= 220000) {
        multiplier = 0.815; // 81.5%
    } else if (arv >= 120000) {
        multiplier = 0.80; // 80%
    }
    
    const mao = netValue * multiplier;
    const lao = mao * 0.70; // 70% of MAO for initial offer
    
    document.getElementById('rapidNetValue').textContent = formatCurrency(netValue);
    document.getElementById('rapidMultiplier').textContent = (multiplier * 100).toFixed(1) + '%';
    document.getElementById('rapidMAO').textContent = formatCurrency(mao);
    document.getElementById('rapidLAO').textContent = formatCurrency(lao);
}

// ===========================================
// CUSTOM PERCENTAGE CALCULATOR
// ===========================================

function calculateCustomOffer() {
    try {
        const arv = getARVValue();
        const { totalRepairs } = getRepairsValue();
        const percentage = parseFloat(document.getElementById('customPercentage').value) || 0;
        
        // Update ARV and Repairs display
        document.getElementById('customARV').textContent = formatCurrency(arv);
        document.getElementById('customRepairs').textContent = formatCurrency(totalRepairs);
        
        if (arv <= 0 || percentage <= 0) {
            document.getElementById('customMaxOffer').textContent = '$0';
            document.getElementById('customSpread').textContent = '$0';
            return;
        }
        
        const maxOffer = (arv * (percentage / 100)) - totalRepairs;
        const spread = arv - maxOffer;
        
        document.getElementById('customMaxOffer').textContent = formatCurrency(Math.max(0, maxOffer));
        document.getElementById('customSpread').textContent = formatCurrency(spread);
        
    } catch (error) {
        console.error('Error in calculateCustomOffer:', error);
    }
}

// ===========================================
// BUYER-FOCUSED PROFIT CALCULATOR
// ===========================================

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
        
        const closingCosts = arv * 0.10; // 10% of ARV
        
        // Determine required buyer profit based on repair amount
        let requiredBuyerProfit = 30000; // Default $30k
        
        if (totalRepairs >= 80000) {
            requiredBuyerProfit = 60000; // Custom calculation needed - using $60k as placeholder
        } else if (totalRepairs >= 50000) {
            requiredBuyerProfit = 50000; // $50k for $50k-$80k repairs
        } else if (totalRepairs >= 30000) {
            requiredBuyerProfit = totalRepairs; // Same as repair amount for $30k-$50k
        }
        
        const mao = arv - totalRepairs - closingCosts - requiredBuyerProfit;
        const lao = mao * 0.70; // 70% of MAO
        
        document.getElementById('buyerFocusedClosing').textContent = formatCurrency(closingCosts);
        document.getElementById('buyerFocusedProfit').textContent = formatCurrency(requiredBuyerProfit);
        document.getElementById('buyerFocusedMAO').textContent = formatCurrency(Math.max(0, mao));
        document.getElementById('buyerFocusedLAO').textContent = formatCurrency(Math.max(0, lao));
        
    } catch (error) {
        console.error('Error in calculateBuyerFocusedOffer:', error);
    }
}

// ===========================================
// AI PROPERTY ASSESSMENT
// ===========================================

function updateAICalculator() {
    const data = collectAIFormData();
    generateAIPrompt(data);
    calculateSmartRepairs(data);
}

function collectAIFormData() {
    const getValue = (id) => parseFloat(document.getElementById(id)?.value) || 0;
    
    return {
        sqft: getValue('aiSqft'),
        yearBuilt: getValue('aiYearBuilt'),
        stories: getValue('aiStories'),
        bedrooms: getValue('aiBedrooms'),
        bathrooms: getValue('aiBathrooms'),
        windows: getValue('aiWindows'),
        hvacUnits: getValue('aiHvacUnits'),
        waterHeaters: getValue('aiWaterHeaters'),
        electricalPanels: getValue('aiElectricalPanels'),
        roofPercent: getValue('aiRoofPercent'),
        foundationFeet: getValue('aiFoundationFeet'),
        sidingSqft: getValue('aiSidingSqft'),
        flooringSqft: getValue('aiFlooringSqft'),
        paintRooms: getValue('aiPaintRooms'),
        doors: getValue('aiDoors'),
        appliances: getValue('aiAppliances'),
        lightFixtures: getValue('aiLightFixtures'),
        plumbingFixtures: getValue('aiPlumbingFixtures'),
        deckSqft: getValue('aiDeckSqft'),
        landscapingSqft: getValue('aiLandscapingSqft'),
        garageDoors: getValue('aiGarageDoors')
    };
}

function generateAIPrompt(data) {
    const address = document.getElementById('propAddress')?.value || '[Property Address]';
    const arv = getARVValue();
    
    const prompt = `You are a professional contractor providing a detailed repair estimate for a real estate investment property.

PROPERTY DETAILS:
• Address: ${address}
• Square Footage: ${data.sqft} sq ft
• Year Built: ${data.yearBuilt}
• Stories: ${data.stories}
• After Repair Value (ARV): ${formatCurrency(arv)}

SCOPE OF WORK NEEDED:
• Bedrooms needing repair: ${data.bedrooms}
• Bathrooms needing repair: ${data.bathrooms}  
• Windows needing replacement: ${data.windows}
• HVAC units needing repair/replace: ${data.hvacUnits}
• Water heaters needing replacement: ${data.waterHeaters}
• Electrical panels needing update: ${data.electricalPanels}
• Roof repair needed: ${data.roofPercent}% of roof
• Foundation issues: ${data.foundationFeet} linear feet
• Siding repair needed: ${data.sidingSqft} sq ft
• Flooring replacement: ${data.flooringSqft} sq ft
• Interior paint: ${data.paintRooms} rooms
• Doors needing replacement: ${data.doors}
• Kitchen appliances needed: ${data.appliances}
• Light fixtures needing replacement: ${data.lightFixtures}
• Plumbing fixtures needing replacement: ${data.plumbingFixtures}
• Deck/patio repair: ${data.deckSqft} sq ft
• Landscaping work: ${data.landscapingSqft} sq ft
• Garage doors needing repair/replace: ${data.garageDoors}

Please provide:
1. A detailed cost breakdown by category (structural, interior, systems, etc.)
2. Labor costs and material costs separated
3. Permit costs where applicable
4. A 10-15% contingency buffer
5. Total estimated cost range (conservative and aggressive estimates)
6. Timeline for completion
7. Any potential issues or concerns based on the year built and scope

Format your response as a professional contractor estimate that I can use for investment analysis.`;

    document.getElementById('aiPromptOutput').value = prompt;
    
    // Update ChatGPT link
    const encodedPrompt = encodeURIComponent(prompt);
    const chatGPTLink = `https://chat.openai.com/?q=${encodedPrompt}`;
    document.getElementById('chatGPTLink').href = chatGPTLink;
}

function calculateSmartRepairs(data) {
    try {
        // Structural & Exterior Costs
        let structuralCost = 0;
        structuralCost += (data.roofPercent / 100) * (data.sqft * 8); // $8/sq ft for roof
        structuralCost += data.foundationFeet * 150; // $150/linear foot
        structuralCost += data.sidingSqft * 12; // $12/sq ft for siding
        
        // Interior Costs
        let interiorCost = 0;
        interiorCost += data.flooringSqft * 8; // $8/sq ft for flooring
        interiorCost += data.paintRooms * 800; // $800 per room for paint
        interiorCost += data.doors * 350; // $350 per door
        interiorCost += data.deckSqft * 15; // $15/sq ft for deck
        
        // Systems & Mechanical
        let systemsCost = 0;
        systemsCost += data.hvacUnits * 6000; // $6k per HVAC unit
        systemsCost += data.waterHeaters * 1200; // $1.2k per water heater
        systemsCost += data.electricalPanels * 2500; // $2.5k per panel
        systemsCost += data.windows * 450; // $450 per window
        
        // Appliances & Fixtures
        let appliancesCost = 0;
        appliancesCost += data.appliances * 800; // $800 per appliance
        appliancesCost += data.lightFixtures * 150; // $150 per fixture
        appliancesCost += data.plumbingFixtures * 300; // $300 per fixture
        appliancesCost += data.garageDoors * 800; // $800 per garage door
        
        // Labor & Permits (30% of material costs)
        const materialTotal = structuralCost + interiorCost + systemsCost + appliancesCost;
        const laborCost = materialTotal * 0.30;
        
        // Add landscaping
        const landscapingCost = data.landscapingSqft * 3; // $3/sq ft
        const adjustedInteriorCost = interiorCost + landscapingCost;
        
        const subtotal = structuralCost + adjustedInteriorCost + systemsCost + appliancesCost + laborCost;
        const contingency = subtotal * 0.15; // 15% contingency
        const total = subtotal + contingency;
        
        // Update display
        document.getElementById('aiStructuralCost').textContent = formatCurrency(structuralCost);
        document.getElementById('aiInteriorCost').textContent = formatCurrency(adjustedInteriorCost);
        document.getElementById('aiSystemsCost').textContent = formatCurrency(systemsCost);
        document.getElementById('aiAppliancesCost').textContent = formatCurrency(appliancesCost);
        document.getElementById('aiLaborCost').textContent = formatCurrency(laborCost);
        document.getElementById('aiSubtotal').textContent = formatCurrency(subtotal);
        document.getElementById('aiContingency').textContent = formatCurrency(contingency);
        document.getElementById('aiTotalEstimate').textContent = formatCurrency(total);
        
        // Update the main repair input with AI calculation
        document.getElementById('totalRepairsInput').value = Math.round(total);
        updateSimpleRepairs();
        
    } catch (error) {
        console.error('Error in calculateSmartRepairs:', error);
    }
}

function copyAIPrompt() {
    const promptText = document.getElementById('aiPromptOutput').value;
    if (!promptText) {
        showErrorMessage('No prompt generated yet. Please fill out the assessment form first.');
        return;
    }
    
    navigator.clipboard.writeText(promptText).then(() => {
        showSuccessMessage('AI prompt copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showErrorMessage('Failed to copy prompt. Please select and copy manually.');
    });
}

// ===========================================
// COMPARABLES SEARCH
// ===========================================

function searchComparables() {
    const neighborhood = document.getElementById('neighborhood').value;
    const priceRangeLow = document.getElementById('priceRangeLow').value;
    const priceRangeHigh = document.getElementById('priceRangeHigh').value;
    const minBeds = document.getElementById('minBeds').value;
    const minBaths = document.getElementById('minBaths').value;
    const minSqft = document.getElementById('minSqft').value;
    
    const resultsDiv = document.getElementById('comparablesResults');
    
    if (!neighborhood) {
        resultsDiv.innerHTML = '<p class="text-red-600">Please enter a neighborhood or zip code</p>';
        return;
    }
    
    // Build search URLs with parameters
    const searchParams = new URLSearchParams();
    if (priceRangeLow) searchParams.append('minPrice', priceRangeLow);
    if (priceRangeHigh) searchParams.append('maxPrice', priceRangeHigh);
    if (minBeds) searchParams.append('minBeds', minBeds);
    if (minBaths) searchParams.append('minBaths', minBaths);
    if (minSqft) searchParams.append('minSqft', minSqft);
    
    const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(neighborhood)}_rb/?${searchParams.toString()}`;
    const realtorUrl = `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(neighborhood)}`;
    
    resultsDiv.innerHTML = `
        <div class="space-y-2">
            <p class="font-medium text-gray-800">Search Results for: ${neighborhood}</p>
            <div class="space-y-1">
                <a href="${zillowUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm block">→ View on Zillow</a>
                <a href="${realtorUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm block">→ View on Realtor.com</a>
            </div>
            <div class="text-xs text-gray-500 mt-2">
                Search criteria: $${priceRangeLow || 'Any'} - $${priceRangeHigh || 'Any'}, ${minBeds || 'Any'}+ beds, ${minBaths || 'Any'}+ baths, ${minSqft || 'Any'}+ sq ft
            </div>
        </div>
    `;
}

function openRedfinSearch() {
    const neighborhood = document.getElementById('neighborhood').value || 'search';
    window.open(`https://www.redfin.com/city/${encodeURIComponent(neighborhood)}`, '_blank');
}

function openHomesSearch() {
    const neighborhood = document.getElementById('neighborhood').value || 'search';
    window.open(`https://www.homes.com/search/${encodeURIComponent(neighborhood)}`, '_blank');
}

// ===========================================
// CLEAR ANALYSIS
// ===========================================

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
        
        // Repairs
        document.getElementById('totalRepairsInput').value = '';
        document.getElementById('totalRepairs').textContent = '$0';
        
        // AI Form
        const aiFields = [
            'aiSqft', 'aiYearBuilt', 'aiStories', 'aiBedrooms', 'aiBathrooms', 'aiWindows',
            'aiHvacUnits', 'aiWaterHeaters', 'aiElectricalPanels', 'aiRoofPercent',
            'aiFoundationFeet', 'aiSidingSqft', 'aiFlooringSqft', 'aiPaintRooms', 'aiDoors',
            'aiAppliances', 'aiLightFixtures', 'aiPlumbingFixtures', 'aiDeckSqft',
            'aiLandscapingSqft', 'aiGarageDoors'
        ];
        
        aiFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        document.getElementById('aiPromptOutput').value = '';
        
        // Reset AI calculator results
        const aiResultFields = [
            'aiStructuralCost', 'aiInteriorCost', 'aiSystemsCost', 'aiAppliancesCost',
            'aiLaborCost', 'aiSubtotal', 'aiContingency', 'aiTotalEstimate'
        ];
        
        aiResultFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '$0';
        });
        
        // Profit Analysis
        document.getElementById('purchasePrice').value = '';
        document.getElementById('assignmentFee').value = '';
        document.getElementById('marketingCosts').value = '';
        document.getElementById('otherCosts').value = '';
        
        // ROI Calculator
        document.getElementById('timeInvestment').value = '';
        document.getElementById('hourlyTarget').value = '';
        document.getElementById('daysToClose').value = '';
        
        // Comparables
        document.getElementById('neighborhood').value = '';
        document.getElementById('priceRangeLow').value = '';
        document.getElementById('priceRangeHigh').value = '';
        document.getElementById('minBeds').value = '';
        document.getElementById('minBaths').value = '';
        document.getElementById('minSqft').value = '';
        document.getElementById('researchNotes').value = '';
        document.getElementById('comparablesResults').innerHTML = '<p class="text-gray-600">Comparable search results will appear here</p>';
        
        // Custom percentage
        document.getElementById('customPercentage').value = '';
        
        // Reset all calculated displays
        updateProfitDisplay();
        
        showSuccessMessage('All deal analysis data cleared!');
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all calculations when page loads
    calculateARV();
    updateSimpleRepairs();
    calculateProfit();
    calculateROI();
    updateRapidOfferSystem();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
    updateAICalculator();
});