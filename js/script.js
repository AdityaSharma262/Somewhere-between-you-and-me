/* =========================================================
   IMAGE PRELOADER
========================================================= */
const loadingOverlay = document.getElementById('loadingOverlay');
if (loadingOverlay) {
    const bgImgObj = new Image();
    bgImgObj.src = 'assets/photos/background.webp';
    
    function hideLoader() {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500); // Small delay to let heart beat once
    }

    bgImgObj.onload = hideLoader;
    bgImgObj.onerror = hideLoader; // Fail gracefully

    // Failsafe: always hide after 5s max
    setTimeout(() => {
        if (!loadingOverlay.classList.contains('hidden')) hideLoader();
    }, 5000);
}

/* =========================================================
   SECRET PASSWORD
========================================================= */

/*
    CHANGE THIS.

    Example:

    const SECRET_PASSWORD = "ourfirstdate";

    The person will need to type this
    to unlock the letter.
*/

const SECRET_PASSWORD = "our";


/* =========================================================
   GET ELEMENTS
========================================================= */

const passwordInput =
    document.getElementById("passwordInput");

const unlockButton =
    document.getElementById("unlockButton");

const wrongPassword =
    document.getElementById("wrongPassword");

const bgImage =
    document.getElementById("bgImage");

const celebrationContainer =
    document.getElementById("celebrationContainer");

const bottomText =
    document.querySelector(".bottom-text");

const letterScreen =
    document.getElementById("letterScreen");

const whiteTransition =
    document.getElementById("whiteTransition");

const introScreen =
    document.getElementById("introScreen");

const introContinueBtn =
    document.getElementById("introContinueBtn");

const birthdayPage =
    document.getElementById("birthdayPage");


/* =========================================================
   UNLOCK FUNCTION
========================================================= */

function unlockLetter() {

    const enteredPassword =
        passwordInput.value
            .trim()
            .toLowerCase();


    /* -----------------------------------------
       WRONG PASSWORD
    ----------------------------------------- */

    if (
        enteredPassword !==
        SECRET_PASSWORD.toLowerCase()
    ) {

        wrongPassword.classList.add("show");


        /* Small shake animation */

        passwordInput.animate(

            [
                {
                    transform: "translateX(-6px)"
                },

                {
                    transform: "translateX(6px)"
                },

                {
                    transform: "translateX(-4px)"
                },

                {
                    transform: "translateX(4px)"
                },

                {
                    transform: "translateX(0)"
                }
            ],

            {
                duration: 350
            }

        );


        return;

    }


    /* -----------------------------------------
       CORRECT PASSWORD
    ----------------------------------------- */

    wrongPassword.classList.remove("show");


    passwordInput.disabled = true;
    unlockButton.disabled = true;

    /*
        STEP 1
        Hide input and spawn celebration.
    */
    const passwordArea = document.getElementById('passwordArea');
    if (passwordArea) passwordArea.classList.add('hidden');

    if (bottomText) bottomText.style.opacity = "0";

    for (let i = 0; i < 35; i++) {
        const particle = document.createElement('div');
        particle.classList.add('romantic-particle');
        particle.innerHTML = ['♥', '✨', '🌸', '💖'][Math.floor(Math.random() * 4)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = (Math.random() * 1.5) + 's';
        particle.style.fontSize = (16 + Math.random() * 24) + 'px';
        if (celebrationContainer) celebrationContainer.appendChild(particle);
    }

    /*
        STEP 2
        Zoom into the background image.
    */
    setTimeout(() => {
        if (bgImage) bgImage.classList.add("zoom");
    }, 500);

    /*
        STEP 3
        Flash white light.
    */
    setTimeout(() => {
        whiteTransition.classList.add("active");
    }, 2800);

    /*
        STEP 4
        Switch screens while the screen is white.
    */
    setTimeout(() => {
        letterScreen.style.display = "none";
        introScreen.classList.add("show");
    }, 3100);

    /*
        STEP 5
        Reveal the intro screen.
    */
    setTimeout(() => {
        whiteTransition.classList.remove("active");
    }, 3200);
}

/* =========================================================
   INTRO SCREEN TO BOOK REVEAL
========================================================= */

if (introContinueBtn && introScreen && birthdayPage) {
    introContinueBtn.addEventListener("click", () => {
        // 1. Show birthday page immediately behind the intro screen
        birthdayPage.classList.add("show");
        
        // Brief timeout to ensure display: flex is applied before opacity transition
        setTimeout(() => {
            birthdayPage.style.opacity = "1";
        }, 10);

        // 2. Start fading out intro screen
        introScreen.style.opacity = "0";

        // 3. Wait for fade out, then hide it
        setTimeout(() => {
            introScreen.style.display = "none";
        }, 1800); // 1.8s romantic fade matches CSS transition
    });
}


/* =========================================================
   BUTTON
========================================================= */

unlockButton.addEventListener(
    "click",
    unlockLetter
);


/* =========================================================
   ENTER KEY
========================================================= */

passwordInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            unlockLetter();

        }

    }
);

/* =========================================================
   BOOK OPENING LOGIC
========================================================= */

const bookCover = document.getElementById("bookCover");

let bookIsOpened = false;

if (bookCover && birthdayPage) {
    let startX = 0;
    let isDragging = false;

    // Remove CSS transition dynamically while dragging for instant response
    // Actually the 0.1s linear in CSS is fine for a slight smoothing

    bookCover.addEventListener("touchstart", (e) => {
        if (bookIsOpened) return;
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    bookCover.addEventListener("touchmove", (e) => {
        if (!isDragging || bookIsOpened) return;
        
        let currentX = e.touches[0].clientX;
        let diff = startX - currentX; // positive when swiping left
        
        if (diff > 0) {
            // Map drag to a -180deg rotation. Fully open if swiped half the screen
            let progress = diff / (window.innerWidth * 0.5);
            let degrees = Math.max(-180, Math.min(0, -(progress * 180)));
            bookCover.style.transform = `rotateY(${degrees}deg)`;
        }
    }, { passive: true });

    bookCover.addEventListener("touchend", (e) => {
        if (!isDragging || bookIsOpened) return;
        isDragging = false;
        
        let endX = e.changedTouches[0].clientX;
        let diff = startX - endX;

        // If swiped more than 25% of the screen width
        if (diff > window.innerWidth * 0.25) {
            bookIsOpened = true;
            // Clear inline style so the CSS class can take over
            bookCover.style.transform = ''; 
            birthdayPage.classList.add("book-is-open");
        } else {
            // Snap back closed
            bookCover.style.transform = '';
        }
    });
}

/* =========================================================
   GENERIC PAGE TURNING ENGINE
========================================================= */

const bookPagesStack = document.getElementById("bookPagesStack");
const pages = Array.from(document.querySelectorAll(".book-page")).reverse();
let activePageIndex = 0; // Starts at 0 (topmost visual page, last in HTML DOM)

if (bookPagesStack && pages.length > 0) {
    let pStartX = 0;
    let pIsDragging = false;

    // Attach unified swipe listener to the stack container
    bookPagesStack.addEventListener("touchstart", (e) => {
        if (!bookIsOpened) return; 
        pStartX = e.touches[0].clientX;
        pIsDragging = true;
    }, { passive: true });

    bookPagesStack.addEventListener("touchmove", (e) => {
        if (!pIsDragging || !bookIsOpened) return;
        
        let currentX = e.touches[0].clientX;
        let diff = pStartX - currentX; // Positive when swiping left (forward)
        
        if (diff > 0) { 
            // Swiping FORWARD (turning the current active page)
            if (pages[activePageIndex].classList.contains("locked-page")) return;
            
            if (activePageIndex < pages.length - 1) {
                let progress = diff / (window.innerWidth * 0.5);
                let degrees = Math.max(-180, Math.min(0, -(progress * 180)));
                pages[activePageIndex].style.transform = `rotateY(${degrees}deg)`;
            }
        } else {
            // Swiping BACKWARD (un-turning the previous page or closing the cover)
            let absDiff = Math.abs(diff);
            let progress = absDiff / (window.innerWidth * 0.5);
            let degrees = Math.max(-180, Math.min(0, -180 + (progress * 180)));
            
            if (activePageIndex > 0) {
                // Un-turn the previously turned page
                pages[activePageIndex - 1].style.transform = `rotateY(${degrees}deg)`;
            } else {
                // We are at the very first page! Un-turning means closing the book cover!
                bookCover.style.transform = `rotateY(${degrees}deg)`;
            }
        }
    }, { passive: true });

    bookPagesStack.addEventListener("touchend", (e) => {
        if (!pIsDragging || !bookIsOpened) return;
        pIsDragging = false;
        
        let endX = e.changedTouches[0].clientX;
        let diff = pStartX - endX;

        if (diff > window.innerWidth * 0.25) {
            // Swiped forward enough to completely turn the page
            if (pages[activePageIndex].classList.contains("locked-page")) return;

            if (activePageIndex < pages.length - 1) {
                pages[activePageIndex].style.transform = ''; 
                pages[activePageIndex].classList.add("turned");
                activePageIndex++; // Advance our position in the stack
            }
        } else if (diff < -(window.innerWidth * 0.25)) {
            // Swiped backward enough to un-turn a page
            if (activePageIndex > 0) {
                activePageIndex--; // Move back our position in the stack
                pages[activePageIndex].style.transform = ''; 
                pages[activePageIndex].classList.remove("turned");
            } else {
                // Close the book cover completely
                bookIsOpened = false;
                bookCover.style.transform = '';
                birthdayPage.classList.remove("book-is-open");
            }
        } else {
            // Snap back to current state (didn't swipe far enough)
            if (activePageIndex < pages.length) {
                pages[activePageIndex].style.transform = '';
            }
            if (activePageIndex > 0) {
                pages[activePageIndex - 1].style.transform = '';
            }
            bookCover.style.transform = '';
        }
    });
}

/* =========================================================
   QUIZ LOGIC
========================================================= */

const quizData = [
    {
        q: "On which date did our trip start?",
        opts: ["21 January", "22 January", "23 January", "24 January"],
        ans: "23 January"
    },
    {
        q: "In which month did you give me my first BJ?",
        opts: ["January", "February", "March", "April"],
        ans: "February"
    },
    {
        q: "What was the colour of the flowers in the bouquet I gave you on your 2024 birthday?",
        opts: ["Pink / White", "Yellow / White", "White / Red", "Red / Pink"],
        ans: "White / Red"
    },
    {
        q: "Meri job ki joining kis date ko thi?",
        opts: ["1 September", "2 September", "6 September", "10 September"],
        ans: "1 September"
    },
    {
        q: "When did we first hug?",
        opts: ["14 February", "15 February", "16 February", "18 February"],
        ans: "16 February"
    }
];

let currentQIndex = 0;
let quizScore = 0;
let selectedOpt = null;

const pageQuiz = document.getElementById("pageQuiz");
const quizContent = document.getElementById("quizContent");
const quizResult = document.getElementById("quizResult");
const quizProgress = document.getElementById("quizProgress");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizNextBtn = document.getElementById("quizNextBtn");

const quizResultTitle = document.getElementById("quizResultTitle");
const quizResultMessage = document.getElementById("quizResultMessage");
const quizScoreDisplay = document.getElementById("quizScoreDisplay");
const quizActionBtn = document.getElementById("quizActionBtn");

// Helper: Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    selectedOpt = null;
    quizNextBtn.disabled = true;
    quizNextBtn.innerHTML = "Next &rarr;";

    const data = quizData[currentQIndex];
    quizProgress.innerText = `Question ${currentQIndex + 1} of 5`;
    quizQuestion.innerText = data.q;

    // Clone and shuffle options so we don't mutate original array
    let options = [...data.opts];
    shuffleArray(options);

    quizOptions.innerHTML = "";
    options.forEach(opt => {
        const div = document.createElement("div");
        div.className = "quiz-option";
        div.innerText = opt;
        div.onclick = () => selectOption(div, opt);
        quizOptions.appendChild(div);
    });

    if (currentQIndex === 4) {
        quizNextBtn.innerHTML = "Finish &rarr;";
    }
}

function selectOption(el, opt) {
    const allOpts = document.querySelectorAll(".quiz-option");
    allOpts.forEach(o => o.classList.remove("selected"));
    el.classList.add("selected");
    selectedOpt = opt;
    quizNextBtn.disabled = false;
}

function handleNext() {
    if (!selectedOpt) return;

    if (selectedOpt === quizData[currentQIndex].ans) {
        quizScore += 2;
    }

    currentQIndex++;

    if (currentQIndex < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizContent.classList.add("hidden");
    quizResult.classList.remove("hidden");

    quizScoreDisplay.innerText = `Score: ${quizScore}/10`;

    // Remove old listeners from action btn
    quizActionBtn.onclick = null;

    if (quizScore >= 8) {
        quizResultTitle.innerText = "YOU REMEMBER USSSS ❤️";
        quizResultMessage.innerText = "Okayyy meri jaan… tum actually remember us. 🥹";
        quizActionBtn.innerText = "UNLOCK MY BIRTHDAY WISH 🎂❤️";
        
        // UNLOCK LOGIC
        pageQuiz.classList.remove("locked-page");

        quizActionBtn.onclick = () => {
            // Automatically turn the page for them!
            if (pageQuiz.classList.contains("book-page")) {
                pageQuiz.style.transform = ''; 
                pageQuiz.classList.add("turned");
                activePageIndex++;
            }
        };

    } else if (quizScore === 6) {
        quizResultTitle.innerText = "Almosttt meri jaan… 🥹❤️";
        quizResultMessage.innerText = "Thoda aur yaad karna padega…";
        quizActionBtn.innerText = "TRY AGAIN 🔄";
        quizActionBtn.onclick = resetQuiz;
    } else {
        quizResultTitle.innerText = "BESANNNN 😭";
        quizResultMessage.innerHTML = "Humari itni saari memories ke baad bhi itna kam score??<br><br>Jaao… phir se yaad karo 😭❤️";
        quizActionBtn.innerText = "TRY AGAIN 🔄";
        quizActionBtn.onclick = resetQuiz;
    }
}

function resetQuiz() {
    currentQIndex = 0;
    quizScore = 0;
    quizResult.classList.add("hidden");
    quizContent.classList.remove("hidden");
    loadQuestion();
}

if (quizNextBtn) {
    quizNextBtn.addEventListener("click", handleNext);
}

// Start quiz unconditionally every time the page loads
if (pageQuiz) {
    pageQuiz.classList.add("locked-page"); // ensure it's always locked initially
    loadQuestion();
}