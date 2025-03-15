module.exports = async function (context, req) {
    context.log('Risk calculation API triggered');

    try {
        // Get data from request body
        const { age, height, weight, bp, familyHistory } = req.body;

        // Calculate BMI and its category
        const bmiResult = calculateBMI(height, weight);
        
        // Calculate blood pressure category
        const bpResult = calculateBloodPressure(bp);
        
        // Calculate age points
        const agePoints = calculateAgePoints(age);
        
        // Calculate family history points
        const familyHistoryPoints = calculateFamilyHistoryPoints(familyHistory);
        
        // Calculate total risk points
        const totalPoints = agePoints + bmiResult.points + bpResult.points + familyHistoryPoints;
        
        // Determine risk category
        const riskCategory = determineRiskCategory(totalPoints);
        
        // Return the results
        context.res = {
            status: 200,
            body: {
                agePoints,
                bmiValue: bmiResult.bmi,
                bmiCategory: bmiResult.category,
                bmiPoints: bmiResult.points,
                bpCategory: bpResult.category,
                bpPoints: bpResult.points,
                familyHistoryPoints,
                totalPoints,
                riskCategory
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log.error('Error in risk calculation:', error);
        
        context.res = {
            status: 500,
            body: {
                message: 'An error occurred during risk calculation.',
                error: error.message
            }
        };
    }
};

// Function to calculate BMI and determine its category and points
function calculateBMI(height, weight) {
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    
    // Calculate BMI: weight (kg) / height (m)^2
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category;
    let points;
    
    // Assign category and points based on BMI value
    if (bmi < 25) {
        category = 'Normal';
        points = 0;
    } else if (bmi < 30) {
        category = 'Overweight';
        points = 30;
    } else {
        category = 'Obese';
        points = 75;
    }
    
    return { bmi, category, points };
}

/**
 * Calculates the blood pressure category and associated points.
 * @param {string} bp - The blood pressure category as a string.
 * @returns {Object} An object containing the category and points.
 */
function calculateBloodPressure(bp) {
    let category;
    let points;
    
    // Determine blood pressure category based on category string
    if (bp === 'normal') {
        category = 'Normal';
        points = 0;
    } else if (bp === 'elevated') {
        category = 'Elevated';
        points = 15;
    } else if (bp === 'stage1') {
        category = 'Stage 1 Hypertension';
        points = 30;
    } else if (bp === 'stage2') {
        category = 'Stage 2 Hypertension';
        points = 75;
    } else if (bp === 'crisis') {
        category = 'Hypertensive Crisis';
        points = 100;
    } else {
        category = 'Unknown';
        points = 0;
    }
    
    return { category, points };
}

// Function to calculate age-related points
function calculateAgePoints(age) {
    if (age < 30) {
        return 0;
    } else if (age < 45) {
        return 10;
    } else if (age < 60) {
        return 20;
    } else {
        return 30;
    }
}

// Function to calculate family history points
function calculateFamilyHistoryPoints(familyHistory) {
    if (!familyHistory || !Array.isArray(familyHistory)) {
        return 0;
    }
    
    // Each condition adds 10 points
    return familyHistory.length * 10;
}

// Function to determine the risk category based on total points
function determineRiskCategory(totalPoints) {
    if (totalPoints <= 20) {
        return 'Low Risk';
    } else if (totalPoints <= 50) {
        return 'Moderate Risk';
    } else if (totalPoints <= 75) {
        return 'High Risk';
    } else {
        return 'Uninsurable';
    }
}
