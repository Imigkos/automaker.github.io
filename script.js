/* --------------------------------------------------
   1. Tailwind Configuration
   -------------------------------------------------- */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: '#D10000', // Professional Automotive Red
                dark: '#0f172a',  // Deep Blue/Grey 
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Select all elements with the class 'container'
    const containers = document.querySelectorAll('.container');


    containers.forEach(container => {
        const slider = container.querySelector('.slider');
        
        // Safety check: does the slider input exist?
        if(!slider) return; 

        slider.addEventListener('input', (e) => {
            // Update the CSS variable
            container.style.setProperty('--position', `${e.target.value}%`);
        });
    });

});

/* --------------------------------------------------
   3. Modal Logic (Popup Images)
   -------------------------------------------------- */
// Function to close the modal (must be global for onclick="closeModal()")
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.add('hidden');
}

// Wait for the page to load before attaching click listeners to gallery items
document.addEventListener('DOMContentLoaded', () => {
    // Get the modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');

    // Select all gallery items (the containers that hold your images)
    const items = document.querySelectorAll('.gallery-item');

    // Add a click listener to each gallery item
    items.forEach(item => {
        item.addEventListener('click', function() {
            // Find the image inside the clicked item
            const img = this.querySelector('img');
            if (img) {
                modal.classList.remove('hidden'); // Show the modal
                modalImg.src = img.src;           // Set the modal image to the clicked image
            }
        });
    });
});

/* --------------------------------------------------
   Dynamic Gallery Slider Logic
   -------------------------------------------------- */

// 1. Add all your photo filenames here! 
// The program will automatically grab them and build the slider.
const galleryImages = [
    'photo1.JPG',
    'photo2.JPG',
    'photo3.JPG',
    'photo4.JPG',
    'photo5.JPG',
    'photo6.JPG',
    '1000022340.jpg',
    '1000022346.jpg',
    '1000022360.jpg',
    '1000022366.jpg',
    '1000022367.jpg'
];

let currentSlide = 0;
let slideInterval;
// Show 3 images on desktop (screens wider than 768px), 1 on mobile
let slidesVisible = window.innerWidth >= 768 ? 3 : 1; 

function initGallery() {
    const track = document.getElementById('gallery-track');
    if (!track) return;

    track.innerHTML = ''; // Clear out anything inside

    // 2. Loop through your list and build the HTML for each image
    galleryImages.forEach(src => {
        const slide = document.createElement('div');
        // w-full makes it 100% width on mobile. md:w-1/3 makes it 33.33% on desktop.
        slide.className = 'gallery-slide flex-shrink-0 w-full md:w-1/3 px-2 cursor-pointer';
        
        slide.innerHTML = `
            <div class="h-64 rounded-xl overflow-hidden shadow-md group relative bg-gray-200">
                <img src="${src}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="Auto Maker Work">
            </div>
        `;
        
        // Connect the click to your existing full-screen Modal
        slide.addEventListener('click', function() {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.classList.remove('hidden');
            modalImg.src = src;
        });

        track.appendChild(slide);
    });

    // Recalculate if the user rotates their phone or resizes the browser
    window.addEventListener('resize', () => {
        slidesVisible = window.innerWidth >= 768 ? 3 : 1;
        updateSlider(); 
    });

    startAutoPlay();
}

function updateSlider() {
    const track = document.getElementById('gallery-track');
    if (!track) return;
    const totalSlides = galleryImages.length;
    
    // Stop the slider from scrolling into empty space
    const maxSlide = Math.max(0, totalSlides - slidesVisible);
    if (currentSlide > maxSlide) currentSlide = maxSlide;
    if (currentSlide < 0) currentSlide = 0;

    // Calculate how far to push the track to the left
    const movePercentage = currentSlide * (100 / slidesVisible);
    track.style.transform = `translateX(-${movePercentage}%)`;
}

function moveSlide(direction) {
    const totalSlides = galleryImages.length;
    const maxSlide = Math.max(0, totalSlides - slidesVisible);
    
    currentSlide += direction;
    
    // Auto-loop logic: if you go past the end, jump to start. If you go past the start, jump to end.
    if (currentSlide > maxSlide) {
        currentSlide = 0; 
    } else if (currentSlide < 0) {
        currentSlide = maxSlide; 
    }
    
    updateSlider();
    resetAutoPlay(); // Reset the timer so it doesn't double-jump if you manually click
}

function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => moveSlide(1), 4000); // Changes every 4 seconds automatically
}

function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
}

// Start everything up when the page loads
document.addEventListener('DOMContentLoaded', initGallery);