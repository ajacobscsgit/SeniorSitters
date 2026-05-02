/**
 * SeniorSitters - JavaScript
 * Form behavior and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile navigation
  initMobileNav();
  
  // Initialize character counters
  initCharCounters();
  
  // Initialize form submissions
  initForms();
});

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      
      // Animate hamburger to X
      const spans = navToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
    
    // Close nav when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }
}

/**
 * Character Counters for Textareas
 */
function initCharCounters() {
  // Find all textareas with character counters
  const textareas = document.querySelectorAll('textarea');
  
  textareas.forEach(function(textarea) {
    const counterSpan = textarea.nextElementSibling;
    if (counterSpan && counterSpan.classList.contains('char-counter')) {
      const countSpan = counterSpan.querySelector('span');
      const maxLength = textarea.getAttribute('maxlength') || 500;
      
      // Set initial count
      if (countSpan) {
        countSpan.textContent = textarea.value.length;
      }
      
      // Update on input
      textarea.addEventListener('input', function() {
        const length = this.value.length;
        if (countSpan) {
          countSpan.textContent = length;
        }
        
        // Visual warning when approaching limit
        if (length > maxLength * 0.9) {
          counterSpan.style.color = '#dc2626';
        } else {
          counterSpan.style.color = '';
        }
      });
    }
  });
}

/**
 * Form Submissions
 */
function initForms() {
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    attachFieldListeners(contactForm);
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm(this)) {
        showSuccess(this);
      }
    });
  }
  
  // Eligibility Form
  const eligibilityForm = document.getElementById('eligibilityForm');
  if (eligibilityForm) {
    attachFieldListeners(eligibilityForm);
    eligibilityForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm(this)) {
        showSuccess(this);
      }
    });
  }
  
  // Career Form
  const careerForm = document.getElementById('careerForm');
  if (careerForm) {
    attachFieldListeners(careerForm);
    careerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validateForm(this)) {
        return;
      }

      const submitButton = this.querySelector("button[type='submit']");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      const formData = new FormData(this);
      const resumeFile = document.getElementById("resume")?.files[0];
      const data = Object.fromEntries(formData.entries());

      if (resumeFile) {
        const reader = new FileReader();
        reader.onload = async function() {
          data.resumeFileName = resumeFile.name;
          data.resumeMimeType = resumeFile.type;
          data.resumeBase64 = reader.result.split(",")[1];
          await submitCareerApplication(data, submitButton, careerForm);
        };
        reader.readAsDataURL(resumeFile);
      } else {
        await submitCareerApplication(data, submitButton, careerForm);
      }
    });
  }
}

function attachFieldListeners(form) {
  form.querySelectorAll('input, textarea, select').forEach(function(field) {
    field.addEventListener('input', function() {
      this.classList.remove('input-error');
    });
  });
}

/**
 * Basic Form Validation
 */
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(function(field) {
    // Reset previous error state
    field.classList.remove('input-error');
    
    // Check if empty
    if (!field.value.trim()) {
      field.classList.add('input-error');
      isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.classList.add('input-error');
        isValid = false;
      }
    }
    
    // Phone validation (basic)
    if (field.type === 'tel' && field.value) {
      const phoneRegex = /^[\d\s\-()]+$/;
      if (!phoneRegex.test(field.value)) {
        field.classList.add('input-error');
        isValid = false;
      }
    }
  });
  
  return isValid;
}

/**
 * Show Success Message
 */
function showSuccess(form) {
  // Hide form
  form.style.display = 'none';
  
  // Show success message
  const successDiv = form.nextElementSibling;
  if (successDiv && successDiv.classList.contains('form-success')) {
    successDiv.style.display = 'block';
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function submitCareerApplication(data, submitButton, form) {
  try {
    const formData = new FormData();

    // Add all fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    await fetch("https://script.google.com/macros/s/AKfycbxqdNYBlU40FwYbR2f2-VOViEJmjpLpgB6cNH-mdKniOjN7c0od9B_v9W3h0X39x4MQ/exec", {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    if (form) {
      showSuccess(form);
    }

  } catch (error) {
    console.error("Submission error:", error);

    alert("Something went wrong. Please try again or email careers@seniorsittersco.com.");

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Application";
    }
  }
}

/**
 * Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
