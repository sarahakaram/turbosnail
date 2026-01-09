document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Add smooth scrolling to registration section
    addSmoothScrolling();
});

function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'newsletter') {
            data[key] = true;
        } else {
            data[key] = value;
        }
    }

    // Add newsletter field if checkbox wasn't checked
    if (!data.newsletter) {
        data.newsletter = false;
    }

    // Validate required fields
    if (!validateForm(data)) {
        return;
    }

    // Store registration data in localStorage
    localStorage.setItem('registrationData', JSON.stringify(data));
    localStorage.setItem('registrationTime', new Date().toISOString());

    // Show loading state
    const submitButton = event.target.querySelector('.btn-primary');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        console.log('Registration submitted:', data);

        // Redirect to thank you page
        window.location.href = 'thank-you.html';
    }, 1000);
}

function validateForm(data) {
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'title', 'interests'];
    const errors = [];

    // Check required fields
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            errors.push(field);
        }
    }

    // Validate email format
    if (data.email && !isValidEmail(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate phone if provided
    if (data.phone && data.phone.trim() !== '' && !isValidPhone(data.phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    if (errors.length > 0) {
        alert('Please fill in all required fields marked with *');

        // Focus on first error field
        const firstErrorField = document.getElementById(errors[0]);
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function addSmoothScrolling() {
    // Add smooth scrolling for any internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add input validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#e53e3e';
            } else {
                this.style.borderColor = '';
            }
        });

        emailInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(229, 62, 62)' && isValidEmail(this.value)) {
                this.style.borderColor = '';
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !isValidPhone(this.value)) {
                this.style.borderColor = '#e53e3e';
            } else {
                this.style.borderColor = '';
            }
        });

        phoneInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(229, 62, 62)' && isValidPhone(this.value)) {
                this.style.borderColor = '';
            }
        });
    }
});

// Add animation on scroll for elements
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.about-item, .highlights-list li').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Run animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateOnScroll);
} else {
    animateOnScroll();
}
