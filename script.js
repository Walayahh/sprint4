document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const introCard = document.getElementById('introCard');
    const riskForm = document.getElementById('riskForm');
    const resultCard = document.getElementById('resultCard');
    
    // Form Sections
    const personalSection = document.getElementById('personalSection');
    const bmiSection = document.getElementById('bmiSection');
    const bpSection = document.getElementById('bpSection');
    const historySection = document.getElementById('historySection');
    
    // Buttons
    const startBtn = document.getElementById('startBtn');
    const personalNext = document.getElementById('personalNext');
    const bmiBack = document.getElementById('bmiBack');
    const bmiNext = document.getElementById('bmiNext');
    const bpBack = document.getElementById('bpBack');
    const bpNext = document.getElementById('bpNext');
    const historyBack = document.getElementById('historyBack');
    const calculateBtn = document.getElementById('calculateBtn');
    const newAssessmentBtn = document.getElementById('newAssessmentBtn');
    
    // Input fields
    const heightInput = document.getElementById('height');
    const heightError = document.getElementById('heightError');
    
    // Results
    const loader = document.getElementById('loader');
    const resultContent = document.getElementById('resultContent');
    
    // Event Listeners for Navigation
    startBtn.addEventListener('click', () => {
        introCard.classList.add('hidden');
        riskForm.classList.remove('hidden');
    });
    
    personalNext.addEventListener('click', () => {
        if (validatePersonalSection()) {
            switchSection(personalSection, bmiSection);
        }
    });
    
    bmiBack.addEventListener('click', () => {
        switchSection(bmiSection, personalSection);
    });
    
    bmiNext.addEventListener('click', () => {
        if (validateBmiSection()) {
            switchSection(bmiSection, bpSection);
        }
    });
    
    bpBack.addEventListener('click', () => {
        switchSection(bpSection, bmiSection);
    });
    
    bpNext.addEventListener('click', () => {
        if (validateBpSection()) {
            switchSection(bpSection, historySection);
        }
    });
    
    historyBack.addEventListener('click', () => {
        switchSection(historySection, bpSection);
    });
    
    calculateBtn.addEventListener('click', () => {
        if (validateAllSections()) {
            calculateRisk();
        }
    });
    
    newAssessmentBtn.addEventListener('click', () => {
        resetForm();
        resultCard.classList.add('hidden');
        riskForm.classList.remove('hidden');
    });
    
    // Validation for height field
    heightInput.addEventListener('input', () => {
        const heightValue = parseInt(heightInput.value);
        if (heightValue < 60 && heightValue !== '') {
            heightError.textContent = 'Height must be at least 60 cm';
        } else {
            heightError.textContent = '';
        }
    });
    
    // Helper Functions
    function switchSection(fromSection, toSection) {
        fromSection.classList.add('hidden');
        toSection.classList.remove('hidden');
    }
    
    function validatePersonalSection() {
        const fullName = document.getElementById('fullName').value;
        const age = document.getElementById('age').value;
        
        if (!fullName.trim()) {
            alert('Please enter a name');
            return false;
        }
        
        if (!age || age < 1 || age > 120) {
            alert('Please enter a valid age between 1 and 120');
            return false;
        }
        
        return true;
    }
    
    function validateBmiSection() {
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        
        if (!height || height < 60) {
            alert('Height must be at least 60 cm');
            return false;
        }
        
        if (!weight || weight < 1) {
            alert('Please enter a valid weight');
            return false;
        }
        
        return true;
    }
    
    function validateBpSection() {
        const bpCategory = document.getElementById('bpCategory').value;
        
        if (!bpCategory) {
            alert('Please select a blood pressure category');
            return false;
        }
        
        return true;
    }
    
    
    function validateAllSections() {
        return validatePersonalSection() && validateBmiSection() && validateBpSection();
    }
    
    function getSelectedDiseases() {
        const diseases = [];
        const diseaseCheckboxes = document.querySelectorAll('input[name="family_history"]:checked');
        
        diseaseCheckboxes.forEach(checkbox => {
            diseases.push(checkbox.value);
        });
        
        return diseases;
    }
    
    async function calculateRisk() {
        // Show loading screen
        riskForm.classList.add('hidden');
        resultCard.classList.remove('hidden');
        loader.classList.remove('hidden');
        resultContent.classList.add('hidden');
        
        // Calculate BMI
        const height = parseInt(document.getElementById('height').value);
        const weight = parseInt(document.getElementById('weight').value);
        const bmi = weight / ((height / 100) * (height / 100));
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            age: parseInt(document.getElementById('age').value),
            height: height,
            weight: weight,
            bp: document.getElementById('bpCategory').value, // Get BP category from dropdown
            familyHistory: getSelectedDiseases()
        };
        
        try {
            // Call the API with the data
            const response = await fetch('/api/calculate-risk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const data = await response.json();
            displayResults(formData, data);
            
        } catch (error) {
            console.error('Error calculating risk:', error);
            alert('An error occurred while calculating risk. Please try again.');
            resultCard.classList.add('hidden');
            riskForm.classList.remove('hidden');
        }
    }
    
    
    function displayResults(formData, results) {
        // Hide loader
        loader.classList.add('hidden');
        resultContent.classList.remove('hidden');
        
        // Display customer name
        document.getElementById('resultName').textContent = formData.fullName;
        
        // Display summary values
        document.getElementById('summaryAge').textContent = `${formData.age} years`;
        document.getElementById('agePoints').textContent = `(${results.agePoints} points)`;
        
        document.getElementById('summaryBMI').textContent = `${results.bmiValue.toFixed(1)} - ${results.bmiCategory}`;
        document.getElementById('bmiPoints').textContent = `(${results.bmiPoints} points)`;
        
        // Display BP category
        document.getElementById('summaryBP').textContent = `${results.bpCategory}`;
        document.getElementById('bpPoints').textContent = `(${results.bpPoints} points)`;
        
        const historyText = formData.familyHistory.length > 0 ? 
            formData.familyHistory.join(', ') : 
            'None reported';
        document.getElementById('summaryHistory').textContent = historyText;
        document.getElementById('historyPoints').textContent = `(${results.familyHistoryPoints} points)`;
        
        // Display total and category
        document.getElementById('totalPoints').textContent = results.totalPoints;
        
        const categoryElement = document.getElementById('riskCategory');
        categoryElement.textContent = results.riskCategory;
        
        // Apply appropriate class based on risk category
        categoryElement.className = 'category-badge';
        switch(results.riskCategory) {
            case 'Low Risk':
                categoryElement.classList.add('low-risk');
                break;
            case 'Moderate Risk':
                categoryElement.classList.add('moderate-risk');
                break;
            case 'High Risk':
                categoryElement.classList.add('high-risk');
                break;
            case 'Uninsurable':
                categoryElement.classList.add('uninsurable');
                break;
        }
    }
    function resetForm() {
        document.getElementById('riskForm').reset();
        
        // Reset all sections
        const sections = [bmiSection, bpSection, historySection];
        sections.forEach(section => section.classList.add('hidden'));
        personalSection.classList.remove('hidden');
        
        // Clear error messages
        heightError.textContent = '';
    }
});
