document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       THEME SWITCHER
       ========================================================================== */
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check system preference or stored preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
        htmlElement.setAttribute('data-theme', storedTheme);
    } else {
        htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    /* ==========================================================================
       SCROLL INTERACTIONS
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar scrolled compact styling
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Active Navigation Highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Nav height offset
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    /* ==========================================================================
       TYPEWRITER EFFECT
       ========================================================================== */
    const typewriterElement = document.getElementById('typewriter');
    const words = [
        "a Fullstack Developer.",
        "a Frontend Specialist.",
        "an Open Source Contributor.",
        "a Clean Code Advocate."
    ];
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Delete character
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deleting is faster
        } else {
            // Type character
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        // Cycle control
        if (!isDeleting && charIndex === currentWord.length) {
            // Word fully typed, pause before deleting
            typingSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Word deleted, move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before typing next word
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();

    /* ==========================================================================
       GITHUB REPOS FETCHING
       ========================================================================== */
    const githubUsernameInput = document.getElementById('githubUsernameInput');
    const fetchGithubBtn = document.getElementById('fetchGithubBtn');
    const projectsGrid = document.getElementById('projectsGrid');
    const projectsLoader = document.getElementById('projectsLoader');

    // Default placeholder static portfolio projects content
    const defaultProjectsHTML = projectsGrid.innerHTML;

    // Load previously searched username if exists
    const savedUsername = localStorage.getItem('github_username');
    if (savedUsername) {
        githubUsernameInput.value = savedUsername;
        fetchGitHubRepos(savedUsername);
    }

    fetchGithubBtn.addEventListener('click', () => {
        const username = githubUsernameInput.value.trim();
        if (username) {
            localStorage.setItem('github_username', username);
            fetchGitHubRepos(username);
        } else {
            alert('Please enter a valid GitHub username.');
        }
    });

    async function fetchGitHubRepos(username) {
        // Show loader and clear grid
        projectsLoader.classList.add('active');
        projectsGrid.style.opacity = '0.3';

        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            
            if (!response.ok) {
                throw new Error('User not found or GitHub API limit reached');
            }

            const repos = await response.json();
            
            if (repos.length === 0) {
                projectsGrid.innerHTML = `
                    <div class="glass-panel" style="grid-column: 1/-1; padding: 3rem; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
                        <p>No public repositories found for user: <strong>${username}</strong>.</p>
                    </div>
                `;
            } else {
                renderRepos(repos);
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
            // Revert to static projects and show an inline alert in container
            projectsGrid.innerHTML = defaultProjectsHTML;
            alert(`Could not load live projects: ${error.message}. Loaded static concept projects instead.`);
        } finally {
            projectsLoader.classList.remove('active');
            projectsGrid.style.opacity = '1';
        }
    }

    function renderRepos(repos) {
        projectsGrid.innerHTML = '';

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            
            // Map common programming languages to specific icons or fallback
            let langIcon = 'fa-code';
            if (repo.language) {
                const lang = repo.language.toLowerCase();
                if (lang.includes('javascript') || lang.includes('js')) langIcon = 'fa-js-square';
                else if (lang.includes('html')) langIcon = 'fa-html5';
                else if (lang.includes('css')) langIcon = 'fa-css3-alt';
                else if (lang.includes('python')) langIcon = 'fa-python';
                else if (lang.includes('react')) langIcon = 'fa-react';
            }

            card.innerHTML = `
                <div class="project-badge">Repository</div>
                <div class="project-image-fallback">
                    <i class="fas ${langIcon}"></i>
                </div>
                <div class="project-details">
                    <div class="project-tech">
                        <span class="tech-tag">${repo.language || 'HTML/CSS'}</span>
                        <span class="tech-tag"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    </div>
                    <h3>${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
                    <p>${repo.description || 'No description provided. Click below to inspect code and details directly.'}</p>
                    <div class="project-links">
                        <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-github"></i> Source Code
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" class="project-link" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
            projectsGrid.appendChild(card);
        });
    }

    /* ==========================================================================
       CONTACT FORM VALIDATION
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const fields = ['Name', 'Email', 'Subject', 'Message'];

        fields.forEach(field => {
            const input = document.getElementById(`form${field}`);
            const group = input.closest('.form-group');
            
            // Basic required validation
            if (!input.value.trim()) {
                group.classList.add('invalid');
                isValid = false;
            } else {
                group.classList.remove('invalid');
            }

            // Custom email format validation
            if (field === 'Email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    group.classList.add('invalid');
                    isValid = false;
                } else {
                    group.classList.remove('invalid');
                }
            }
        });

        if (isValid) {
            // Simulate sending message
            formSubmitBtn.disabled = true;
            const originalBtnText = formSubmitBtn.innerHTML;
            formSubmitBtn.innerHTML = `<span>Sending...</span> <i class="fas fa-circle-notch fa-spin"></i>`;
            formStatus.className = 'form-status';
            formStatus.style.display = 'none';

            setTimeout(() => {
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = originalBtnText;
                
                // Show success status
                formStatus.textContent = "Thank you! Your message has been sent successfully.";
                formStatus.className = 'form-status success';
                
                // Reset form fields
                contactForm.reset();
            }, 1800);
        } else {
            // Show error status
            formStatus.textContent = "Please fill in all required fields with valid input.";
            formStatus.className = 'form-status error';
        }
    });

    // Clear validation error borders when users edit the inputs
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (input.value.trim()) {
                group.classList.remove('invalid');
            }
        });
    });
});
