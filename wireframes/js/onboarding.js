// Onboarding Wizard JavaScript
// 
// PRODUCTION INTEGRATION NOTES:
// =============================
// 1. Replace extractFromWebsite() with actual API call to web scraping service
// 2. Replace extractFromPDF() with actual API call to PDF parsing service (e.g., AWS Textract, Google Document AI)
// 3. Add proper error handling for network failures and parsing errors
// 4. Consider adding rate limiting for extraction requests
// 5. Implement proper validation of extracted data before auto-population
// 6. Add support for additional company fields (phone, email, website, etc.)
//
// Backend API Endpoints (suggested):
// - POST /api/extract/website - accepts URL, returns company data
// - POST /api/extract/pdf - accepts PDF file, returns company data
//

let currentStep = 1;
let extractedData = null;
let uploadedPDF = null;

// Skip extraction and go directly to manual entry
function skipToManualEntry() {
    document.getElementById('companyInfoExtraction').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

// Handle PDF file selection
function handlePDFSelect(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedPDF = file;
        document.getElementById('pdfFileName').textContent = file.name;
        document.getElementById('extractFromPDFBtn').style.display = 'block';
    } else {
        uploadedPDF = null;
        document.getElementById('pdfFileName').textContent = 'No file selected';
        document.getElementById('extractFromPDFBtn').style.display = 'none';
    }
}

// Extract text content from website and populate textarea
async function extractTextFromWebsite() {
    const websiteUrl = document.getElementById('companyWebsiteInput').value.trim();
    
    if (!websiteUrl) {
        showExtractionError('Please enter a valid website URL');
        return;
    }
    
    // Validate URL format
    try {
        new URL(websiteUrl);
    } catch (e) {
        showExtractionError('Please enter a valid URL (e.g., https://www.company.com)');
        return;
    }
    
    // Show loading
    showExtractionLoading();
    
    // Simulate API call to scrape website text
    // In production, this would call a backend endpoint
    setTimeout(() => {
        // Mock extracted text from website
        const extractedText = `ABC Construction Co., Ltd. is a premier construction company headquartered in Tokyo, Japan. Since our establishment in 1985, we have been at the forefront of residential and commercial building projects throughout the Kanto region. Our main office is located at 1-2-3 Shibuya, Tokyo 150-0002, Japan. With a dedicated workforce of over 500 skilled professionals, we manage construction projects of all sizes and complexities. Our expertise spans sustainable building practices, modern architectural design, and efficient project management.`;
        
        // Populate the textarea
        document.getElementById('companyIntroText').value = extractedText;
        
        hideExtractionLoading();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification is-success is-light';
        notification.innerHTML = '<button class="delete" onclick="this.parentElement.remove()"></button><p><i class="fas fa-check-circle mr-2"></i><strong>Text loaded!</strong> Review and edit the text below, then click "Extract Company Information".</p>';
        document.getElementById('companyIntroText').parentElement.parentElement.insertBefore(notification, document.getElementById('companyIntroText').parentElement);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => notification.remove(), 5000);
        
        // Clear the URL input
        document.getElementById('companyWebsiteInput').value = '';
        
    }, 2000);
}

// Extract text content from PDF and populate textarea
async function extractTextFromPDF() {
    if (!uploadedPDF) {
        showExtractionError('Please select a PDF file first');
        return;
    }
    
    // Show loading
    showExtractionLoading();
    
    // Simulate PDF text extraction
    // In production, this would call a backend endpoint with the PDF file
    setTimeout(() => {
        // Mock extracted text from PDF
        const companyName = extractCompanyNameFromPDF(uploadedPDF.name);
        const extractedText = `${companyName} is a leading manufacturing company specializing in precision components and industrial equipment. Our state-of-the-art facility is located in Osaka, Japan, where we employ cutting-edge technology and skilled craftsmen. Since our founding, we have been committed to quality, innovation, and customer satisfaction. Our headquarters is situated at 5-10-20 Namba, Osaka 542-0076, Japan. We serve clients across various industries including automotive, electronics, and aerospace sectors.`;
        
        // Populate the textarea
        document.getElementById('companyIntroText').value = extractedText;
        
        hideExtractionLoading();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'notification is-success is-light';
        notification.innerHTML = '<button class="delete" onclick="this.parentElement.remove()"></button><p><i class="fas fa-check-circle mr-2"></i><strong>Text loaded from PDF!</strong> Review and edit the text below, then click "Extract Company Information".</p>';
        document.getElementById('companyIntroText').parentElement.parentElement.insertBefore(notification, document.getElementById('companyIntroText').parentElement);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => notification.remove(), 5000);
        
        // Hide the extract button
        document.getElementById('extractFromPDFBtn').style.display = 'none';
        
    }, 2500);
}

// Extract company information from text input
async function extractFromText() {
    const introText = document.getElementById('companyIntroText').value.trim();
    
    if (!introText) {
        showExtractionError('Please enter company introduction text');
        return;
    }
    
    if (introText.length < 50) {
        showExtractionError('Please provide more details (at least 50 characters) for better extraction accuracy');
        return;
    }
    
    // Show loading
    showExtractionLoading();
    
    // Simulate NLP/AI text extraction
    // In production, this would call a backend endpoint with NLP/AI service
    setTimeout(() => {
        // Mock extraction from text using simple pattern matching
        extractedData = extractInfoFromText(introText);
        
        hideExtractionLoading();
        showExtractionSuccess();
        
        // Auto-populate form and navigate
        setTimeout(() => {
            populateFormWithExtractedData();
            proceedToSignupForm();
        }, 1500);
        
    }, 2000);
}

// Helper function to extract info from text (mock implementation)
function extractInfoFromText(text) {
    const data = {
        name: '',
        address: '',
        industry: ''
    };
    
    // Simple pattern matching for company name
    // Look for "Company Name Co., Ltd." or similar patterns
    const namePatterns = [
        /([A-Z][a-zA-Z\s&]+(?:Co\.,?\s?Ltd\.?|Corporation|Corp\.?|Inc\.?|Company))/,
        /^([A-Z][a-zA-Z\s&]+(?=\s+is|\s+provides|\s+specializes))/
    ];
    
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match) {
            data.name = match[1].trim();
            break;
        }
    }
    
    // Look for location/address patterns
    const locationPatterns = [
        /((?:located|based|headquarters)\s+(?:in|at)\s+[^.]+)/i,
        /([0-9]+-[0-9]+-[0-9]+\s+[A-Za-z]+,?\s+[A-Za-z]+,?\s+[A-Za-z]+)/,
        /(Tokyo|Osaka|Kyoto|Yokohama|Nagoya|Sapporo|Fukuoka|Kobe)[^.]+/
    ];
    
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
            data.address = match[1].replace(/(located|based|headquarters)\s+(in|at)\s+/i, '').trim();
            break;
        }
    }
    
    // Detect industry keywords
    const industryKeywords = {
        'Construction': ['construction', 'building', 'contractor', 'builder'],
        'Transportation': ['transportation', 'logistics', 'shipping', 'delivery'],
        'Manufacturing': ['manufacturing', 'production', 'factory', 'assembly'],
        'Healthcare': ['healthcare', 'medical', 'hospital', 'clinic', 'health'],
        'Hospitality': ['hospitality', 'hotel', 'resort', 'accommodation'],
        'Food Service': ['restaurant', 'food service', 'catering', 'dining'],
        'Retail': ['retail', 'store', 'shop', 'merchandise'],
    };
    
    const lowerText = text.toLowerCase();
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            data.industry = industry;
            break;
        }
    }
    
    // Fallback values if extraction fails
    if (!data.name) {
        data.name = 'Extracted Company Name';
    }
    if (!data.address) {
        data.address = 'Tokyo, Japan';
    }
    if (!data.industry) {
        data.industry = 'Other';
    }
    
    return data;
}

// Helper function to extract company name from filename (mock)
function extractCompanyNameFromPDF(filename) {
    // Remove .pdf extension and clean up
    const name = filename.replace('.pdf', '').replace(/[_-]/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1) + ' Corporation';
}

// Populate the signup form with extracted data
function populateFormWithExtractedData() {
    if (!extractedData) return;
    
    if (extractedData.name) {
        document.getElementById('companyNameInput').value = extractedData.name;
    }
    
    if (extractedData.address) {
        document.getElementById('companyAddressInput').value = extractedData.address;
    }
    
    if (extractedData.industry) {
        const industrySelect = document.getElementById('industrySelect');
        // Try to match the industry
        for (let option of industrySelect.options) {
            if (option.value.toLowerCase() === extractedData.industry.toLowerCase()) {
                option.selected = true;
                break;
            }
        }
    }
}

// Navigate from extraction step to signup form
function proceedToSignupForm() {
    document.getElementById('companyInfoExtraction').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    
    // Show auto-populated notice and back button if data was extracted
    if (extractedData) {
        document.getElementById('autoPopulatedNotice').style.display = 'block';
        document.getElementById('backToExtractionBtn').style.display = 'inline-block';
    }
}

// Go back from signup form to extraction step
function backToExtraction() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('companyInfoExtraction').style.display = 'block';
    
    // Hide notices
    document.getElementById('autoPopulatedNotice').style.display = 'none';
    document.getElementById('backToExtractionBtn').style.display = 'none';
}

// Show loading state
function showExtractionLoading() {
    document.getElementById('extractionLoading').style.display = 'block';
    document.getElementById('extractionSuccess').style.display = 'none';
    document.getElementById('extractionError').style.display = 'none';
}

// Hide loading state
function hideExtractionLoading() {
    document.getElementById('extractionLoading').style.display = 'none';
}

// Show success message
function showExtractionSuccess() {
    document.getElementById('extractionSuccess').style.display = 'block';
    document.getElementById('extractionError').style.display = 'none';
}

// Show error message
function showExtractionError(message) {
    document.getElementById('extractionErrorMessage').textContent = message;
    document.getElementById('extractionError').style.display = 'block';
    document.getElementById('extractionSuccess').style.display = 'none';
    hideExtractionLoading();
}

function handleSignup(event) {
    event.preventDefault();
    
    // Hide signup form and show wizard
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('wizardSteps').style.display = 'block';
    
    console.log('Account created, starting wizard...');
}

function nextStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    currentStepEl.classList.remove('is-active');
    
    currentStep++;
    
    const nextStepEl = document.getElementById(`step${currentStep}`);
    if (nextStepEl) {
        nextStepEl.classList.add('is-active');
    }
}

function prevStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    currentStepEl.classList.remove('is-active');
    
    currentStep--;
    
    const prevStepEl = document.getElementById(`step${currentStep}`);
    if (prevStepEl) {
        prevStepEl.classList.add('is-active');
    }
}

function completeWizard() {
    // Redirect to dashboard
    console.log('Wizard completed, redirecting to dashboard...');
    window.location.href = 'dashboard.html';
}

function toggleChip(element) {
    element.classList.toggle('is-selected');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Update file name display
        document.getElementById('fileName').textContent = file.name;
        
        // Show the clear button
        const clearButton = document.getElementById('clearFileButton');
        if (clearButton) {
            clearButton.style.display = 'block';
        }
        
        // Show the custom accent selection section
        const accentSection = document.getElementById('customAccentSection');
        if (accentSection) {
            accentSection.style.display = 'block';
        }
        
        // Auto-select Tokyo accent for custom voice (default)
        const tokyoCustomRadio = document.querySelector('input[name="customAccent"][value="tokyo"]');
        if (tokyoCustomRadio) {
            tokyoCustomRadio.checked = true;
            selectCustomAccent('tokyo');
        }
    } else {
        // Reset to no file selected
        clearVoiceFile();
    }
}

function handleCSVSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('csvFileName').textContent = file.name;
    }
}

function showEmployeeTab(tab) {
    const tabs = document.querySelectorAll('.tabs li');
    tabs.forEach(t => t.classList.remove('is-active'));
    
    if (tab === 'single') {
        document.getElementById('singleEmployeeTab').style.display = 'block';
        document.getElementById('bulkEmployeeTab').style.display = 'none';
        tabs[0].classList.add('is-active');
    } else {
        document.getElementById('singleEmployeeTab').style.display = 'none';
        document.getElementById('bulkEmployeeTab').style.display = 'block';
        tabs[1].classList.add('is-active');
    }
}

function selectAccent(accent) {
    // Remove is-selected class from all accent boxes
    const allAccents = document.querySelectorAll('.accent-selection');
    allAccents.forEach(box => {
        box.classList.remove('is-selected');
    });
    
    // Add is-selected class to the selected accent
    const selectedAccent = document.getElementById(`accent-${accent}`);
    if (selectedAccent) {
        selectedAccent.classList.add('is-selected');
    }
    
    console.log(`Selected accent: ${accent}`);
}

// Handle voice source selection (Standard vs Custom)
function selectVoiceSource(source) {
    console.log(`Selected voice source: ${source}`);
    
    const standardSection = document.getElementById('standardVoiceSection');
    const customSection = document.getElementById('customVoiceSection');
    const standardBox = document.getElementById('source-standard');
    const customBox = document.getElementById('source-custom');
    
    if (source === 'standard') {
        // Show standard voice section, hide custom
        standardSection.style.display = 'block';
        customSection.style.display = 'none';
        
        // Update visual styling
        standardBox.style.border = '3px solid #000';
        customBox.style.border = '2px solid #dbdbdb';
        
        // Select Tokyo accent by default
        const tokyoRadio = document.querySelector('input[name="accent"][value="tokyo"]');
        if (tokyoRadio) {
            tokyoRadio.checked = true;
            selectAccent('tokyo');
        }
    } else if (source === 'custom') {
        // Show custom voice section, hide standard
        standardSection.style.display = 'none';
        customSection.style.display = 'block';
        
        // Update visual styling
        standardBox.style.border = '2px solid #dbdbdb';
        customBox.style.border = '3px solid #000';
    }
}

// Handle custom voice accent selection
function selectCustomAccent(accent) {
    console.log(`Selected custom voice accent: ${accent}`);
    
    // Remove is-selected class from all custom accent boxes
    const allCustomAccents = document.querySelectorAll('#customAccentSection .accent-selection');
    allCustomAccents.forEach(box => {
        box.classList.remove('is-selected');
    });
    
    // Add is-selected class to the selected custom accent
    const selectedCustomAccent = document.getElementById(`custom-accent-${accent}`);
    if (selectedCustomAccent) {
        selectedCustomAccent.classList.add('is-selected');
    }
}

// Clear uploaded voice file
function clearVoiceFile() {
    // Reset file input
    const fileInput = document.getElementById('voiceFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Reset file name display
    document.getElementById('fileName').textContent = 'No file selected';
    
    // Hide the clear button
    const clearButton = document.getElementById('clearFileButton');
    if (clearButton) {
        clearButton.style.display = 'none';
    }
    
    // Hide custom accent section
    const accentSection = document.getElementById('customAccentSection');
    if (accentSection) {
        accentSection.style.display = 'none';
    }
    
    // Reset custom accent selection
    const customAccentRadios = document.querySelectorAll('input[name="customAccent"]');
    customAccentRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // Remove selection styling from custom accents
    const allCustomAccents = document.querySelectorAll('#customAccentSection .accent-selection');
    allCustomAccents.forEach(box => {
        box.classList.remove('is-selected');
    });
}
