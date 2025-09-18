
let nextBtn = document.querySelector('.next')
let prevBtn = document.querySelector('.prev')

let slider = document.querySelector('.slider')
let sliderList = slider.querySelector('.slider .list')
let thumbnail = document.querySelector('.slider .thumbnail')
let thumbnailItems = thumbnail.querySelectorAll('.item')

thumbnail.appendChild(thumbnailItems[0])

let autoSlideInterval = 3000; // 3 seconds
let autoSlideTimer;

// Dots pagination setup
let dotsContainer = document.createElement('div');
dotsContainer.className = 'dots';
slider.appendChild(dotsContainer);

function getSlides() {
    return sliderList.querySelectorAll('.item');
}

let currentIndex = 0;

function renderDots() {
    dotsContainer.innerHTML = '';
    let slides = getSlides();
    slides.forEach((_, i) => {
        let dot = document.createElement('span');
        dot.className = 'dot' + (i === currentIndex ? ' active' : '');
        dot.dataset.index = String(i);
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    });
}

function updateActiveDot() {
    let dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((d, i) => {
        if (i === currentIndex) d.classList.add('active');
        else d.classList.remove('active');
    });
}

function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
        moveSlider('next');
    }, autoSlideInterval);
}

function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
}

// Function for next button 
nextBtn.onclick = function() {
    moveSlider('next');
    resetAutoSlide();
}

// Function for prev button 
prevBtn.onclick = function() {
    moveSlider('prev');
    resetAutoSlide();
}

function moveSlider(direction) {
    let sliderItems = sliderList.querySelectorAll('.item')
    let thumbnailItems = document.querySelectorAll('.thumbnail .item')
    
    if(direction === 'next'){
        sliderList.appendChild(sliderItems[0])
        thumbnail.appendChild(thumbnailItems[0])
        slider.classList.add('next')
        currentIndex = (currentIndex + 1) % getSlides().length;
    } else {
        sliderList.prepend(sliderItems[sliderItems.length - 1])
        thumbnail.prepend(thumbnailItems[thumbnailItems.length - 1])
        slider.classList.add('prev')
        currentIndex = (currentIndex - 1 + getSlides().length) % getSlides().length;
    }


    slider.addEventListener('animationend', function() {
        if(direction === 'next'){
            slider.classList.remove('next')
        } else {
            slider.classList.remove('prev')
        }
        updateActiveDot();
    }, {once: true}) // Remove the event listener after it's triggered once
}

// Start auto slide when page loads
startAutoSlide();

// Initialize dots after DOM is ready
renderDots();
updateActiveDot();

function goToSlide(targetIndex){
    let total = getSlides().length;
    if (targetIndex === currentIndex) return;
    // choose shortest direction
    let forwardSteps = (targetIndex - currentIndex + total) % total;
    let backwardSteps = (currentIndex - targetIndex + total) % total;
    clearInterval(autoSlideTimer);
    let steps = Math.min(forwardSteps, backwardSteps);
    let dir = forwardSteps <= backwardSteps ? 'next' : 'prev';
    for (let s = 0; s < steps; s++) {
        setTimeout(() => {
            moveSlider(dir);
            if (s === steps - 1) {
                resetAutoSlide();
            }
        }, s * 520); // align with 0.5s animations
    }
}

