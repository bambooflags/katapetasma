// Image carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

// Initialize carousel
function initCarousel() {
    if (slides.length > 0) {
        slides[0].classList.add('active');
        startAutoSlide();
    }
}

// Change slide function
function changeSlide(direction) {
    slides[currentSlide].classList.remove('active');
    
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    slides[currentSlide].classList.add('active');
}

// Auto slide functionality
function autoSlide() {
    changeSlide(1);
}

let slideInterval;

function startAutoSlide() {
    slideInterval = setInterval(autoSlide, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    clearInterval(slideInterval);
}

// Pause auto slide on hover
document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        initCarousel();
        
        heroSection.addEventListener('mouseenter', stopAutoSlide);
        heroSection.addEventListener('mouseleave', startAutoSlide);
    }
});

// Mobile navigation toggle (for future mobile menu implementation)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    for (const link of links) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            const offsetTop = document.querySelector(href).offsetTop;
            
            scroll({
                top: offsetTop - 70, // Account for fixed navbar
                behavior: "smooth"
            });
        });
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(function() {
        document.body.style.opacity = '1';
    }, 100);
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply scroll animation to elements
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.tradition-section, .category, .approach-item, .video-placeholder, .performance-card, .highlight-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add hover effects to interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.video-placeholder, .performance-card, .category, .approach-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Keyboard navigation for carousel
document.addEventListener('keydown', function(e) {
    if (document.querySelector('.hero')) {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        }
    }
});

// MediaManager class for Google Sheets integration
class MediaManager {
    constructor() {
        this.sheetId = '1yYYd5tSX8cueBMhoVt20dQODeHoR62vE0pGTV0gGqx4'; // Replace with your actual Sheet ID
        this.sheetName = 'videos';
        this.init();
    }

    async init() {
        try {
            await this.loadVideos();
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showError();
        }
    }

    async loadVideos() {
        const url = `https://opensheet.elk.sh/${this.sheetId}/${this.sheetName}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.processVideos(data);
    }

    processVideos(data) {
        const videos = [];

        // Process each row from Google Sheets
        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            if (row && row.Title && row.Link) {
                // Clean up data (remove quotes if present)
                const title = row.Title.replace(/"/g, '');
                const description = row.Description ? row.Description.replace(/"/g, '') : '';
                const link = row.Link.replace(/"/g, '');

                // Extract YouTube video ID from URL
                const videoId = this.extractVideoId(link);

                if (videoId) {
                    videos.push({
                        title,
                        description,
                        link,
                        videoId,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    });
                }
            }
        }

        this.renderVideos(videos);
    }

    extractVideoId(url) {
        // Extract YouTube video ID from various URL formats
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    renderVideos(videos) {
        const container = document.getElementById('dynamic-video-list');
        if (!container) return;

        if (videos.length === 0) {
            container.innerHTML = '<div class="no-videos">No videos available</div>';
            return;
        }

        const videosHTML = videos.map((video, index) => `
            <div class="video-item">
                <div class="video-embed">
                    <iframe
                        src="https://www.youtube.com/embed/${video.videoId}?rel=0"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = videosHTML;
    }

    showError() {
        const container = document.getElementById('dynamic-video-list');
        if (container) {
            container.innerHTML = '<div class="error">Unable to load videos. Please check back later.</div>';
        }
    }
}

// Initialize MediaManager when DOM loads (only on media page)
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dynamic-video-list')) {
        new MediaManager();
    }
});