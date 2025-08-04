/*!
    * Portfolio Website Scripts
    * Enhanced with comprehensive error handling, performance optimizations, and form validation
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
    */
(function ($) {
    "use strict"; // Start of use strict

    // Configuration constants
    const CONFIG = {
        NAVBAR_OFFSET: 72,
        SCROLLSPY_OFFSET: 74,
        NAVBAR_SHRINK_THRESHOLD: 100,
        SCROLL_DURATION: 1000,
        THROTTLE_DELAY: 16, // ~60fps
        DEBOUNCE_DELAY: 300,
        FORM_MESSAGE_AUTO_HIDE: 5000
    };

    // Utility function for throttling
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Utility function for debouncing
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Safe animate with easing fallback
    function safeAnimate($element, properties, duration, easing) {
        try {
            // Check if jQuery easing plugin is available and the specific easing function exists
            if ($.easing && typeof $.easing[easing] === 'function') {
                return $element.animate(properties, duration, easing);
            } else {
                console.warn(`Easing function '${easing}' not available, using default`);
                return $element.animate(properties, duration);
            }
        } catch (error) {
            console.error('Animation error:', error);
            // Fallback to instant scroll
            $element.css(properties);
            return $element;
        }
    }

    // Check if jQuery is available
    if (typeof $ === 'undefined') {
        console.error('jQuery is required but not loaded');
        return;
    }

    // Wait for DOM to be ready
    $(document).ready(function() {
        try {
            initSmoothScrolling();
            initNavbarCollapse();
            initScrollSpy();
            initContactForm();
        } catch (error) {
            console.error('Error initializing website scripts:', error);
        }
    });

    // Smooth scrolling using jQuery easing
    function initSmoothScrolling() {
        try {
            $('a.js-scroll-trigger[href*="#"]:not([href="#"])').on('click', function (e) {
                // Always prevent default to avoid browser jump
                e.preventDefault();
                
                try {
                    if (
                        location.pathname.replace(/^\//, "") ===
                            this.pathname.replace(/^\//, "") &&
                        location.hostname === this.hostname
                    ) {
                        const target = getScrollTarget(this.hash);
                        if (target && target.length) {
                            safeAnimate(
                                $("html, body"),
                                { scrollTop: target.offset().top - CONFIG.NAVBAR_OFFSET },
                                CONFIG.SCROLL_DURATION,
                                "easeInOutExpo"
                            );
                            return false;
                        }
                    }
                } catch (error) {
                    console.error('Error in smooth scrolling:', error);
                }
                
                return false;
            });

            // Close responsive menu when a scroll trigger link is clicked
            $(".js-scroll-trigger").on('click', function () {
                try {
                    const navbarCollapse = $(".navbar-collapse");
                    if (navbarCollapse.length && navbarCollapse.hasClass('show')) {
                        // Bootstrap 5 compatible
                        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse[0]);
                            if (bsCollapse) {
                                bsCollapse.hide();
                            }
                        } else {
                            // Fallback to jQuery method
                            navbarCollapse.collapse("hide");
                        }
                    }
                } catch (error) {
                    console.error('Error closing navbar:', error);
                }
            });
        } catch (error) {
            console.error('Error initializing smooth scrolling:', error);
        }
    }

    // Get scroll target element with proper attribute selector
    function getScrollTarget(hash) {
        try {
            let target = $(hash);
            if (!target.length) {
                // Fix: properly quote the attribute value to handle special characters
                const targetName = hash.slice(1);
                target = $(`[name='${targetName}']`);
            }
            return target;
        } catch (error) {
            console.error('Error getting scroll target:', error);
            return $();
        }
    }

    // Initialize navbar collapse functionality
    function initNavbarCollapse() {
        try {
            const navbar = $("#mainNav");
            if (!navbar.length) {
                console.warn('Navbar element not found');
                return;
            }

            // Navbar collapse function
            const navbarCollapse = function () {
                try {
                    const scrollTop = $(window).scrollTop();
                    if (scrollTop > CONFIG.NAVBAR_SHRINK_THRESHOLD) {
                        navbar.addClass("navbar-shrink");
                    } else {
                        navbar.removeClass("navbar-shrink");
                    }
                } catch (error) {
                    console.error('Error in navbar collapse:', error);
                }
            };

            // Initial check
            navbarCollapse();

            // Throttled scroll event listener
            const throttledNavbarCollapse = throttle(navbarCollapse, CONFIG.THROTTLE_DELAY);
            $(window).on('scroll', throttledNavbarCollapse);

        } catch (error) {
            console.error('Error initializing navbar collapse:', error);
        }
    }

    // Initialize Bootstrap ScrollSpy (Bootstrap 5 compatible)
    function initScrollSpy() {
        try {
            const body = $("body");
            const navbar = $("#mainNav");
            
            if (body.length && navbar.length) {
                // Check for Bootstrap 5
                if (typeof bootstrap !== 'undefined' && bootstrap.ScrollSpy) {
                    try {
                        new bootstrap.ScrollSpy(document.body, {
                            target: '#mainNav',
                            offset: CONFIG.SCROLLSPY_OFFSET
                        });
                    } catch (scrollSpyError) {
                        console.warn('Bootstrap 5 ScrollSpy failed, trying jQuery fallback:', scrollSpyError);
                        // Fallback to jQuery method
                        body.scrollspy({
                            target: "#mainNav",
                            offset: CONFIG.SCROLLSPY_OFFSET,
                        });
                    }
                } else {
                    // Bootstrap 4 or jQuery method
                    body.scrollspy({
                        target: "#mainNav",
                        offset: CONFIG.SCROLLSPY_OFFSET,
                    });
                }
            } else {
                console.warn('ScrollSpy elements not found');
            }
        } catch (error) {
            console.error('Error initializing ScrollSpy:', error);
        }
    }

    // Initialize contact form functionality
    function initContactForm() {
        try {
            const contactForm = $("#contactForm");
            if (!contactForm.length) {
                return; // Contact form not present, skip initialization
            }

            contactForm.on('submit', function(e) {
                e.preventDefault();
                handleFormSubmission(this);
            });

            // Debounced real-time validation
            const validateDebounced = debounce(function($field) {
                validateField($field);
            }, CONFIG.DEBOUNCE_DELAY);

            contactForm.find('input, textarea').on('blur', function() {
                validateDebounced($(this));
            });

        } catch (error) {
            console.error('Error initializing contact form:', error);
        }
    }

    // Handle form submission with AJAX stub
    function handleFormSubmission(form) {
        try {
            const $form = $(form);
            const isValid = validateForm($form);

            if (isValid) {
                // Show loading state
                const submitBtn = $form.find('#submitButton');
                const originalText = submitBtn.html();
                submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Sending...');

                // AJAX submission stub - replace with real endpoint
                const formData = {
                    name: $form.find('#name').val(),
                    email: $form.find('#email').val(),
                    phone: $form.find('#phone').val(),
                    subject: $form.find('#subject').val(),
                    message: $form.find('#message').val()
                };

                // Simulate AJAX call - replace with real implementation
                setTimeout(() => {
                    try {
                        // TODO: Replace with actual AJAX call
                        // $.ajax({
                        //     url: '/api/contact',
                        //     method: 'POST',
                        //     data: formData,
                        //     success: function(response) {
                        //         showFormMessage('success', 'Thank you! Your message has been sent successfully.');
                        //         $form[0].reset();
                        //         $form.find('.form-control').removeClass('is-invalid is-valid');
                        //     },
                        //     error: function(xhr, status, error) {
                        //         showFormMessage('error', 'Sorry, there was an error sending your message. Please try again.');
                        //     }
                        // });

                        // Temporary success simulation
                        showFormMessage('success', 'Thank you! Your message has been received. (Note: This is a demo - no actual email was sent)');
                        $form[0].reset();
                        $form.find('.form-control').removeClass('is-invalid is-valid');
                    } catch (error) {
                        showFormMessage('error', 'An error occurred. Please try again.');
                        console.error('Form submission error:', error);
                    } finally {
                        // Restore button state
                        submitBtn.prop('disabled', false).html(originalText);
                    }
                }, 1500); // Simulate network delay

            } else {
                showFormMessage('error', 'Please correct the errors below.');
            }
        } catch (error) {
            console.error('Error handling form submission:', error);
            showFormMessage('error', 'An error occurred. Please try again.');
        }
    }

    // Validate entire form
    function validateForm($form) {
        let isValid = true;
        const requiredFields = $form.find('[required]');

        requiredFields.each(function() {
            const $field = $(this);
            if (!validateField($field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Validate individual field with improved validation
    function validateField($field) {
        const value = $field.val().trim();
        const fieldType = $field.attr('type');
        const isRequired = $field.prop('required');
        let isValid = true;

        // Check if required field is empty
        if (isRequired && !value) {
            isValid = false;
        }

        // Enhanced email validation
        if (fieldType === 'email' && value) {
            // Use browser's built-in validation if available
            if ($field[0].checkValidity && typeof $field[0].checkValidity === 'function') {
                isValid = $field[0].checkValidity();
            } else {
                // Fallback to improved regex pattern
                const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                isValid = emailRegex.test(value);
            }
        }

        // Phone number basic validation (optional field)
        if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            isValid = phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }

        // Apply validation classes
        if (isValid) {
            $field.removeClass('is-invalid').addClass('is-valid');
        } else {
            $field.removeClass('is-valid').addClass('is-invalid');
        }

        return isValid;
    }

    // Show form message with scoped removal
    function showFormMessage(type, message) {
        try {
            // Remove existing messages only from this form (scoped removal)
            $('#contactForm .form-message').remove();

            const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
            
            const messageHtml = `
                <div class="alert ${alertClass} form-message mt-3" role="alert">
                    <i class="fas ${icon} me-2" aria-hidden="true"></i>
                    ${message}
                </div>
            `;

            $('#contactForm').append(messageHtml);

            // Auto-hide message after configured time
            setTimeout(() => {
                $('#contactForm .form-message').fadeOut(400, function() {
                    $(this).remove();
                });
            }, CONFIG.FORM_MESSAGE_AUTO_HIDE);

        } catch (error) {
            console.error('Error showing form message:', error);
        }
    }

    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global JavaScript error:', e.error);
    });

    // Handle jQuery AJAX errors
    $(document).ajaxError(function(event, xhr, settings, error) {
        console.error('AJAX error:', {
            url: settings.url,
            status: xhr.status,
            error: error
        });
    });

    // Expose public API for external use if needed
    window.PortfolioScripts = {
        scrollToSection: function(sectionId) {
            const target = getScrollTarget('#' + sectionId);
            if (target && target.length) {
                safeAnimate(
                    $("html, body"),
                    { scrollTop: target.offset().top - CONFIG.NAVBAR_OFFSET },
                    CONFIG.SCROLL_DURATION,
                    "easeInOutExpo"
                );
            }
        }
    };

})(jQuery); // End of use strict