/**
 * SeniorSitters - JavaScript
 * Form behavior and interactions
 */

// Supabase Configuration
const SUPABASE_URL = "https://zyoozdgdiwopgwstiugu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b296ZGdkaXdvcGd3c3RpdWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzAyNDMsImV4cCI6MjA5MzYwNjI0M30.T32uwCGaZo1YkqzIaRN_7eyjzPshXdmcHPFDdM7MH7w";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

      const isOpen = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.textContent = isOpen ? '×' : '☰';
    });

    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
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
    
    // Handle checkbox validation
    if (field.type === 'checkbox') {
      const checkboxContainer = field.closest('.form-field-checkbox');
      if (!field.checked) {
        field.classList.add('input-error');
        if (checkboxContainer) {
          checkboxContainer.classList.add('has-error');
          // Add error message if not already present
          if (!checkboxContainer.querySelector('.checkbox-error-text')) {
            const errorMsg = document.createElement('span');
            errorMsg.className = 'checkbox-error-text';
            errorMsg.textContent = 'You must agree to the Terms & Conditions and Privacy Policy to proceed.';
            checkboxContainer.appendChild(errorMsg);
          }
        }
        isValid = false;
      } else {
        if (checkboxContainer) {
          checkboxContainer.classList.remove('has-error');
          const errorMsg = checkboxContainer.querySelector('.checkbox-error-text');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      }
      return;
    }
    
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
  
  // Add live validation for checkbox
  const agreeCheckbox = form.querySelector('input[name="agreeToTerms"]');
  if (agreeCheckbox) {
    agreeCheckbox.addEventListener('change', function() {
      const checkboxContainer = this.closest('.form-field-checkbox');
      if (this.checked) {
        this.classList.remove('input-error');
        if (checkboxContainer) {
          checkboxContainer.classList.remove('has-error');
          const errorMsg = checkboxContainer.querySelector('.checkbox-error-text');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      }
    });
  }
  
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
    // Prepare data for Supabase
    const supabaseData = {
      full_name: data.fullName || "",
      phone: data.phone || "",
      email: data.email || "",
      city: data.location || "",
      availability: data.availability || "",
      transportation: data.transportation === "yes",
      willing_outings: data.willingOutings === "yes",
      experience: data.driversLicense === "yes",
      why_work_with_seniors: data.whyJoin || "",
      status: "new"
    };

    // Insert into Supabase
    const { error: supabaseError } = await supabaseClient
      .from("applications")
      .insert([supabaseData]);

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      // Continue with Google Sheets submission even if Supabase fails
    }

    // Also submit to Google Apps Script (for legacy support)
    const formData = new FormData();
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
// Request Care Form
// Request Care Form
const form = document.getElementById("requestCareForm");

document.querySelectorAll("input[name='level']").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      document.querySelectorAll("input[name='level']").forEach(cb => {
        if (cb !== this) cb.checked = false;
      });
    }
  });
});

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("requestSubmitBtn");

    // Agreement check
    const agree = document.getElementById("agreeToTerms");
    if (!agree.checked) {
      alert("You must agree to the Terms & Privacy Policy.");
      return;
    }

    // Support types
    const supportTypes = Array.from(
      document.querySelectorAll("input[name='support[]']:checked")
    ).map(el => el.value);

    if (supportTypes.length === 0) {
      alert("Please select at least one type of support.");
      return;
    }

    // Level of care
    const levels = Array.from(
      document.querySelectorAll("input[name='level']:checked")
    ).map(el => el.value);

    if (levels.length === 0) {
      alert("Please select a level of support.");
      return;
    }

    // Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Requesting...";
    }

    const days = document.getElementById("days").value;
    const time = document.getElementById("time").value;

    try {
      // Prepare data for Supabase
      const supabaseData = {
        requester_name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        care_for: document.getElementById("careFor").value,
        location: document.getElementById("location").value,
        best_time_to_contact: document.getElementById("bestTimeToContact").value,
        start_timeframe: document.getElementById("startTimeframe").value,
        preferred_days: days,
        preferred_time: time,
        support_types: supportTypes.join(", "),
        level_of_care: levels.join(", "),
        mobility_notes: document.getElementById("mobilityNotes").value,
        lives_alone: document.getElementById("livesAlone").value,
        pets_in_home: document.getElementById("petsInHome").value,
        main_concern: document.getElementById("mainConcern").value,
        notes: document.getElementById("notes").value,
        status: "new"
      };

      // Insert into Supabase
      const { error: supabaseError } = await supabaseClient
        .from("care_requests")
        .insert([supabaseData]);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Continue with Google Sheets submission even if Supabase fails
      }

      // Also submit to Google Apps Script (for legacy support)
      const data = new FormData();
      // New field names for care_requests mapping
      data.append("requester_name", document.getElementById("name").value);
      data.append("phone", document.getElementById("phone").value);
      data.append("email", document.getElementById("email").value);
      data.append("care_for", document.getElementById("careFor").value);
      data.append("location", document.getElementById("location").value);
      data.append("best_time_to_contact", document.getElementById("bestTimeToContact").value);
      data.append("start_timeframe", document.getElementById("startTimeframe").value);
      data.append("preferred_days", days);
      data.append("preferred_time", time);
      data.append("support_types", supportTypes.join(", "));
      data.append("level_of_care", levels.join(", "));
      data.append("mobility_notes", document.getElementById("mobilityNotes").value);
      data.append("lives_alone", document.getElementById("livesAlone").value);
      data.append("pets_in_home", document.getElementById("petsInHome").value);
      data.append("main_concern", document.getElementById("mainConcern").value);
      data.append("notes", document.getElementById("notes").value);
      data.append("status", "new");
      // Legacy field names for existing Apps Script compatibility
      data.append("name", document.getElementById("name").value);
      data.append("careFor", document.getElementById("careFor").value);
      data.append("cityZip", document.getElementById("location").value);
      data.append("supportType", supportTypes.join(", "));
      data.append("levelOfCare", levels.join(", "));
      data.append("schedule", `${days} - ${time}`);

      await fetch("https://script.google.com/macros/s/AKfycbxZVW6aVvPIHrl1qqzNExa3liFEs7xsmvbWkDgq_GU5zsAjpUFzr3SWP0_Q63av-G1p/exec", {
        method: "POST",
        mode: "no-cors",
        body: data
      });

      form.reset();
      showSuccess(form);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Request Care";
      }
    }
  });
}

// Contact Form
// Contact Form
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("contactSubmitBtn");

    // Agreement check
    const agree = document.getElementById("agreeToTerms");
    if (!agree.checked) {
      alert("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    // Get values (match your HTML exactly)
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    // 🔄 Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      // Prepare data for Supabase
      const supabaseData = {
        name: name,
        email: email,
        phone: phone,
        message: message,
        status: "new"
      };

      // Insert into Supabase
      const { error: supabaseError } = await supabaseClient
        .from("contacts")
        .insert([supabaseData]);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Continue with Google Sheets submission even if Supabase fails
      }

      // Also submit to Google Apps Script (for legacy support)
      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("phone", phone);
      data.append("message", message);

      await fetch("https://script.google.com/macros/s/AKfycbwUzOH8N9YDhSLIUf_AVUvBtDe5ARAndTBu0TQ5wMxpgMSAkPdEp9Sjz41F0W8kuedw/exec", {
        method: "POST",
        mode: "no-cors",
        body: data
      });

      // Reset form
      contactForm.reset();

      // Show success message (your built-in one)
      const successDiv = document.getElementById("formSuccess");
      contactForm.style.display = "none";
      if (successDiv) {
        successDiv.style.display = "block";
        successDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      }

    } catch (error) {
      console.error("Contact form error:", error);
      alert("Something went wrong. Please try again.");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}
