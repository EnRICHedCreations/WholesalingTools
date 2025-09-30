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
    // Get the recommended ARV (conservative approach using lower of two methods)
    const recommendedARV = parseFloat(document.getElementById('recommendedARV').textContent.replace(/[$,]/g, '')) || 0;
    return recommendedARV;
}

function getAverageARVValue() {
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

function getSqftARVValue() {
    const subjectSqft = parseFloat(document.getElementById('subjectSqft').value) || 0;
    const avgPricePerSqft = getAveragePricePerSqft();

    return subjectSqft > 0 && avgPricePerSqft > 0 ? subjectSqft * avgPricePerSqft : 0;
}

function getAveragePricePerSqft() {
    const comp1Price = parseFloat(document.getElementById('comp1').value) || 0;
    const comp1Sqft = parseFloat(document.getElementById('comp1Sqft').value) || 0;
    const comp2Price = parseFloat(document.getElementById('comp2').value) || 0;
    const comp2Sqft = parseFloat(document.getElementById('comp2Sqft').value) || 0;
    const comp3Price = parseFloat(document.getElementById('comp3').value) || 0;
    const comp3Sqft = parseFloat(document.getElementById('comp3Sqft').value) || 0;

    let totalPricePerSqft = 0;
    let compCount = 0;

    if (comp1Price > 0 && comp1Sqft > 0) {
        totalPricePerSqft += comp1Price / comp1Sqft;
        compCount++;
    }
    if (comp2Price > 0 && comp2Sqft > 0) {
        totalPricePerSqft += comp2Price / comp2Sqft;
        compCount++;
    }
    if (comp3Price > 0 && comp3Sqft > 0) {
        totalPricePerSqft += comp3Price / comp3Sqft;
        compCount++;
    }

    return compCount > 0 ? totalPricePerSqft / compCount : 0;
}

function calculateARV() {
    // Calculate individual price per sqft for each comp
    calculateIndividualPricePerSqft();

    // Calculate average ARV (simple average of sale prices)
    const avgARV = getAverageARVValue();
    document.getElementById('calculatedARV').textContent = formatCurrency(avgARV);

    // Calculate ARV based on $/sqft method
    const sqftARV = getSqftARVValue();
    document.getElementById('calculatedARVBySqft').textContent = formatCurrency(sqftARV);

    // Display average price per sqft
    const avgPricePerSqft = getAveragePricePerSqft();
    document.getElementById('avgPricePerSqft').textContent = '$' + avgPricePerSqft.toFixed(2);

    // Calculate and display recommended (conservative) ARV
    let recommendedARV = 0;
    if (avgARV > 0 && sqftARV > 0) {
        // Use the lower of the two methods for conservative estimate
        recommendedARV = Math.min(avgARV, sqftARV);
    } else if (avgARV > 0) {
        // Use average method if only that's available
        recommendedARV = avgARV;
    } else if (sqftARV > 0) {
        // Use sqft method if only that's available
        recommendedARV = sqftARV;
    }

    document.getElementById('recommendedARV').textContent = formatCurrency(recommendedARV);

    // Update all dependent calculations
    updateProfitDisplay();
    updateRapidOfferSystem();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
}

function calculateIndividualPricePerSqft() {
    // Calculate price per sqft for each comparable
    const comps = [
        { priceId: 'comp1', sqftId: 'comp1Sqft', displayId: 'comp1PricePerSqft' },
        { priceId: 'comp2', sqftId: 'comp2Sqft', displayId: 'comp2PricePerSqft' },
        { priceId: 'comp3', sqftId: 'comp3Sqft', displayId: 'comp3PricePerSqft' }
    ];

    comps.forEach(comp => {
        const price = parseFloat(document.getElementById(comp.priceId).value) || 0;
        const sqft = parseFloat(document.getElementById(comp.sqftId).value) || 0;
        const pricePerSqft = (price > 0 && sqft > 0) ? price / sqft : 0;

        document.getElementById(comp.displayId).textContent = pricePerSqft > 0 ? '$' + pricePerSqft.toFixed(2) : '$0.00';
    });
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
    updateRapidOfferSystem();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
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
    
    // Update Deal Score and Evaluation
    updateROIDisplay();
}

// ===========================================
// ROI CALCULATOR
// ===========================================

function calculateROI() {
    updateROIDisplay();
}

function updateROIDisplay() {
    const arv = getARVValue();
    const { totalRepairs } = getRepairsValue();
    const assignmentFee = parseFloat(document.getElementById('assignmentFee').value) || 0;
    const marketingCosts = parseFloat(document.getElementById('marketingCosts').value) || 0;
    const otherCosts = parseFloat(document.getElementById('otherCosts').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;

    const totalCosts = marketingCosts + otherCosts;
    const netProfit = assignmentFee - totalCosts;
    const closingFees = arv * 0.1;
    const buyerProfit = arv - purchasePrice - totalRepairs - closingFees - assignmentFee;

    // Calculate deal score based on multiple factors
    let dealScore = 'F';
    let dealColor = 'text-red-600';

    // Scoring criteria based on profit margins and deal quality
    const profitMargin = arv > 0 ? (netProfit / arv) * 100 : 0; // Your profit as % of ARV
    const buyerMargin = arv > 0 ? (buyerProfit / arv) * 100 : 0; // Buyer profit as % of ARV
    const totalSpread = arv - purchasePrice - totalRepairs; // Total potential profit in deal

    // Grade based on combined factors
    if (netProfit >= 15000 && buyerProfit >= 30000 && profitMargin >= 4) {
        dealScore = 'A+';
        dealColor = 'text-green-600';
    } else if (netProfit >= 10000 && buyerProfit >= 25000 && profitMargin >= 3) {
        dealScore = 'A';
        dealColor = 'text-green-600';
    } else if (netProfit >= 7500 && buyerProfit >= 20000 && profitMargin >= 2.5) {
        dealScore = 'B';
        dealColor = 'text-blue-600';
    } else if (netProfit >= 5000 && buyerProfit >= 15000 && profitMargin >= 2) {
        dealScore = 'C';
        dealColor = 'text-yellow-600';
    } else if (netProfit >= 2500 && buyerProfit >= 10000 && profitMargin >= 1) {
        dealScore = 'D';
        dealColor = 'text-orange-600';
    }

    // Update deal score display
    const dealScoreEl = document.getElementById('dealScore');
    if (dealScoreEl) {
        dealScoreEl.textContent = dealScore;
        dealScoreEl.className = `text-2xl font-bold ${dealColor}`;
    }

    // Update evaluation text
    let evaluation = '';
    if (arv === 0 || totalRepairs === 0) {
        evaluation = 'Enter ARV and repair costs to see evaluation';
    } else if (netProfit <= 0) {
        evaluation = 'This deal will lose money. Not recommended.';
    } else if (buyerProfit <= 0) {
        evaluation = 'Buyer has no profit potential. Deal will not sell.';
    } else if (dealScore === 'A+') {
        evaluation = `Excellent deal! $${formatCurrency(netProfit).replace('$', '')} profit with strong buyer margins. High priority.`;
    } else if (dealScore === 'A') {
        evaluation = `Great deal! $${formatCurrency(netProfit).replace('$', '')} profit with good buyer appeal. Recommended.`;
    } else if (dealScore === 'B') {
        evaluation = `Good deal! $${formatCurrency(netProfit).replace('$', '')} profit. Solid wholesale opportunity.`;
    } else if (dealScore === 'C') {
        evaluation = `Average deal. $${formatCurrency(netProfit).replace('$', '')} profit. Consider if you need cash flow.`;
    } else if (dealScore === 'D') {
        evaluation = `Below average. $${formatCurrency(netProfit).replace('$', '')} profit. Low priority unless needed.`;
    } else {
        evaluation = `Poor deal. Very low profit margins. Not recommended.`;
    }

    const evalEl = document.getElementById('dealEvaluation');
    if (evalEl) {
        evalEl.textContent = evaluation;
    }
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

        // Update the Tax Delinquent Calculator MAO display
        updateTaxMAODisplay();
        
    } catch (error) {
        console.error('Error in calculateBuyerFocusedOffer:', error);
    }
}

// ===========================================
// TAX DELINQUENT DEAL CALCULATOR
// ===========================================

function calculateTaxDelinquentDeal() {
    try {
        // Get original MAO from the buyer-focused calculator
        const originalMAOText = document.getElementById('buyerFocusedMAO').textContent;
        const originalMAO = parseFloat(originalMAOText.replace(/[$,]/g, '')) || 0;

        const taxLien = parseFloat(document.getElementById('taxLienAmount').value) || 0;
        const customFee = parseFloat(document.getElementById('customAssignmentFee').value) || 0;

        if (originalMAO <= 0) {
            alert('Please ensure the Buyer-Focused Calculator above has been calculated first to generate a MAO value.');
            return;
        }

        if (taxLien <= 0) {
            alert('Please enter a valid Tax Delinquent amount');
            return;
        }

        // SCENARIO B: Buyer Pays Tax Lien - Adjust MAO
        const adjustedMAO = originalMAO - taxLien;

        if (adjustedMAO <= 0) {
            alert('Tax lien amount exceeds the MAO. This deal is not viable as structured.');
            return;
        }

        // Update displays
        document.getElementById('taxOriginalMAO').textContent = formatCurrency(originalMAO);

        // Show MAO adjustment section
        document.getElementById('maoAdjustmentSection').classList.remove('hidden');
        document.getElementById('adjustmentOriginalMAO').textContent = formatCurrency(originalMAO);
        document.getElementById('adjustmentTaxLien').textContent = formatCurrency(taxLien);
        document.getElementById('adjustmentAdjustedMAO').textContent = formatCurrency(adjustedMAO);

        // Define scenarios
        const scenarios = [
            { fee: 10000, label: 'Minimum Fee', color: 'bg-red-50 border-red-200' },
            { fee: 15000, label: 'Conservative', color: 'bg-yellow-50 border-yellow-200' },
            { fee: 20000, label: 'Target Fee', color: 'bg-blue-50 border-blue-200' },
            { fee: 25000, label: 'Aggressive', color: 'bg-purple-50 border-purple-200' },
            { fee: 30000, label: 'Premium', color: 'bg-green-50 border-green-200' }
        ];

        // Add custom fee if provided
        if (customFee > 0) {
            scenarios.push({
                fee: customFee,
                label: 'Custom Fee',
                color: 'bg-indigo-50 border-indigo-200'
            });
        }

        // Calculate scenarios using ADJUSTED MAO
        const calculatedResults = scenarios.map(scenario => {
            const offer = adjustedMAO - scenario.fee;
            const sellerNet = offer; // Seller gets clean proceeds (no tax lien deduction)
            const viable = sellerNet >= 0;

            let quality = 'Not Viable';
            let qualityColor = 'text-red-600';
            let icon = '❌';

            if (sellerNet < 0) {
                quality = 'Needs Tax Negotiation';
                qualityColor = 'text-red-600';
                icon = '❌';
            } else if (sellerNet >= 0 && sellerNet < 10000) {
                quality = 'High Motivation Required';
                qualityColor = 'text-orange-600';
                icon = '⚠️';
            } else if (sellerNet >= 10000 && sellerNet < 25000) {
                quality = 'Good Deal';
                qualityColor = 'text-yellow-600';
                icon = '✅';
            } else if (sellerNet >= 25000 && sellerNet < 50000) {
                quality = 'Strong Deal';
                qualityColor = 'text-green-600';
                icon = '💪';
            } else {
                quality = 'Premium Deal';
                qualityColor = 'text-blue-600';
                icon = '🏆';
            }

            let strategy = '';
            if (sellerNet < 0) {
                strategy = 'Negative offer. Assignment fee too high for this tax burden scenario.';
            } else if (sellerNet < 10000) {
                strategy = 'Low seller net. Need highly motivated seller willing to accept minimal proceeds.';
            } else if (sellerNet < 25000) {
                strategy = 'Reasonable offer. Seller gets clean proceeds, buyer handles tax lien separately.';
            } else if (sellerNet < 50000) {
                strategy = 'Strong offer. Clean transaction with meaningful seller proceeds.';
            } else {
                strategy = 'Premium offer. Excellent deal structure with high seller satisfaction.';
            }

            return {
                ...scenario,
                offer,
                sellerNet,
                viable,
                quality,
                qualityColor,
                icon,
                strategy
            };
        });

        // Sort by assignment fee
        calculatedResults.sort((a, b) => a.fee - b.fee);

        // Update summary stats
        document.getElementById('taxSummaryOriginalMAO').textContent = formatCurrency(originalMAO);
        document.getElementById('taxSummaryLien').textContent = formatCurrency(taxLien);
        document.getElementById('taxSummaryAdjustedMAO').textContent = formatCurrency(adjustedMAO);

        const minOffer = adjustedMAO - 30000;
        const maxOffer = adjustedMAO - 10000;
        document.getElementById('taxOfferRange').textContent = `${formatCurrency(Math.max(0, minOffer))} - ${formatCurrency(Math.max(0, maxOffer))}`;

        // Generate scenario cards
        const cardsContainer = document.getElementById('taxScenarioCards');
        cardsContainer.innerHTML = '';

        calculatedResults.forEach(scenario => {
            const cardHTML = `
                <div class="${scenario.color} border-2 rounded-xl p-6 transition-all hover:shadow-lg">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="text-lg font-bold text-gray-900 mb-1">
                                ${scenario.label}
                            </h4>
                            <div class="flex items-center gap-2">
                                <span class="text-lg">${scenario.icon}</span>
                                <span class="text-sm font-semibold ${scenario.qualityColor}">
                                    ${scenario.quality}
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-600 mb-1">Your Fee</div>
                            <div class="text-xl font-bold text-gray-900">
                                ${formatCurrency(scenario.fee)}
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center py-2 border-b border-gray-300">
                            <span class="text-sm text-gray-700 font-medium">Your Offer to Seller</span>
                            <span class="text-lg font-bold text-gray-900">${formatCurrency(scenario.offer)}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-gray-300">
                            <span class="text-sm text-gray-700 font-medium">Buyer Pays Tax Lien</span>
                            <span class="text-lg font-bold text-blue-600">+${formatCurrency(taxLien)}</span>
                        </div>

                        <div class="flex justify-between items-center py-3 bg-white bg-opacity-60 rounded-lg px-3">
                            <span class="text-sm font-bold text-gray-700">Seller Nets (Clean)</span>
                            <span class="text-xl font-bold ${scenario.sellerNet >= 0 ? 'text-green-600' : 'text-red-600'}">
                                ${formatCurrency(scenario.sellerNet)}
                            </span>
                        </div>

                        <div class="bg-blue-50 rounded px-3 py-2">
                            <div class="text-xs text-blue-700">
                                <strong>Buyer's Total:</strong> ${formatCurrency(scenario.offer + taxLien)} (${formatCurrency(scenario.offer)} + ${formatCurrency(taxLien)} tax lien)
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-300">
                        <p class="text-xs text-gray-600">
                            ${scenario.strategy}
                        </p>
                    </div>
                </div>
            `;
            cardsContainer.innerHTML += cardHTML;
        });

        // Show results, hide instructions
        document.getElementById('taxDelinquentResults').classList.remove('hidden');
        document.getElementById('taxHowItWorks').classList.add('hidden');

    } catch (error) {
        console.error('Error in calculateTaxDelinquentDeal:', error);
        alert('Error calculating tax delinquent deal. Please check your inputs.');
    }
}

function updateTaxMAODisplay() {
    // This function is called whenever the buyer-focused calculator updates
    // to keep the tax delinquent calculator in sync
    try {
        const buyerMAOElement = document.getElementById('buyerFocusedMAO');
        const taxMAOElement = document.getElementById('taxOriginalMAO');

        console.log('updateTaxMAODisplay called');
        console.log('buyerMAOElement:', buyerMAOElement);
        console.log('taxMAOElement:', taxMAOElement);

        if (!buyerMAOElement) {
            console.log('buyerFocusedMAO element not found');
            return;
        }

        if (!taxMAOElement) {
            console.log('taxOriginalMAO element not found');
            return;
        }

        const maoText = buyerMAOElement.textContent;
        console.log('Updating Tax MAO display with:', maoText);
        taxMAOElement.textContent = maoText;

        // If user has already entered tax lien amount, recalculate automatically
        const taxLienElement = document.getElementById('taxLienAmount');
        if (taxLienElement) {
            const taxLien = parseFloat(taxLienElement.value) || 0;
            if (taxLien > 0) {
                console.log('Auto-recalculating tax delinquent deal with tax lien:', taxLien);
                calculateTaxDelinquentDeal();
            }
        }
    } catch (error) {
        console.error('Error in updateTaxMAODisplay:', error);
    }
}

// Test function for debugging
function testTaxMAOUpdate() {
    console.log('Testing MAO update...');
    const buyerMAO = document.getElementById('buyerFocusedMAO');
    console.log('Buyer MAO element:', buyerMAO);
    console.log('Buyer MAO text:', buyerMAO ? buyerMAO.textContent : 'not found');

    updateTaxMAODisplay();
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
    
    // Build Zillow URL for SOLD properties (comparables research) - matching main dashboard structure
    let zillowUrl = 'https://www.zillow.com/homes/recently_sold/';
    if (neighborhood) {
        zillowUrl += encodeURIComponent(neighborhood) + '_rb/';
    }
    
    // Add Zillow search parameters for sold homes
    const zillowParams = [];
    
    // Add sold status filter - this is key for getting sold properties
    zillowParams.push('rs_z');
    
    if (priceRangeLow && priceRangeHigh) {
        zillowParams.push(`${priceRangeLow}-${priceRangeHigh}_price`);
    } else if (priceRangeLow) {
        zillowParams.push(`${priceRangeLow}-_price`);
    } else if (priceRangeHigh) {
        zillowParams.push(`0-${priceRangeHigh}_price`);
    }
    
    if (minBeds) {
        zillowParams.push(`${minBeds}-${minBeds}_beds`);
    }
    
    if (minBaths) {
        zillowParams.push(`${minBaths}-_baths`);
    }
    
    if (minSqft) {
        zillowParams.push(`${minSqft}-_size`);
    }
    
    if (zillowParams.length > 0) {
        zillowUrl += zillowParams.join('/') + '/';
    }
    
    resultsDiv.innerHTML = `
        <div class="space-y-2">
            <p class="font-medium text-gray-800">Zillow Search Generated for: ${neighborhood}</p>
            <div class="space-y-1">
                <a href="${zillowUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm block">→ View Sold Properties on Zillow</a>
            </div>
            <div class="text-xs text-gray-500 mt-2">
                Search criteria: $${priceRangeLow || 'Any'} - $${priceRangeHigh || 'Any'}, ${minBeds || 'Any'} beds (exact match), ${minBaths || 'Any'}+ baths, ${minSqft || 'Any'}+ sq ft
            </div>
        </div>
    `;
    
    // Update the button onclick handler to use the generated Zillow URL
    const zillowButton = document.querySelector('button[onclick*="zillow.com"]');
    
    if (zillowButton) {
        zillowButton.setAttribute('onclick', `window.open('${zillowUrl}', '_blank')`);
        zillowButton.innerHTML = 'Open Zillow Search 🔗';
    }
}

// Removed other search functions - using only Zillow for comparables research

// ===========================================
// CLEAR ANALYSIS
// ===========================================

function clearAnalysis() {
    if (confirm('Clear all deal analysis data?')) {
        // ARV Calculator
        document.getElementById('comp1').value = '';
        document.getElementById('comp2').value = '';
        document.getElementById('comp3').value = '';
        document.getElementById('comp1Sqft').value = '';
        document.getElementById('comp2Sqft').value = '';
        document.getElementById('comp3Sqft').value = '';
        document.getElementById('subjectSqft').value = '';
        document.getElementById('calculatedARV').textContent = '$0';
        document.getElementById('calculatedARVBySqft').textContent = '$0';
        document.getElementById('recommendedARV').textContent = '$0';
        document.getElementById('avgPricePerSqft').textContent = '$0.00';
        document.getElementById('comp1PricePerSqft').textContent = '$0.00';
        document.getElementById('comp2PricePerSqft').textContent = '$0.00';
        document.getElementById('comp3PricePerSqft').textContent = '$0.00';

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

        const promptOutput = document.getElementById('aiPromptOutput');
        if (promptOutput) promptOutput.value = '';

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
        calculateARV();
        updateSimpleRepairs();
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
    updateProfitDisplay();
    updateRapidOfferSystem();
    calculateCustomOffer();
    calculateBuyerFocusedOffer();
    updateAICalculator();

    // Initialize Tax Delinquent Calculator with a small delay to ensure all elements are loaded
    setTimeout(() => {
        updateTaxMAODisplay();
    }, 100);
});
