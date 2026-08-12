(function () {
  "use strict";

  // 1. 상단 롤링 마퀴 배너 (rAF 기반 무한 스크롤)
  function initMarquee() {
    var track = document.getElementById("marqueeTrack");
    if (!track) return;

    var DURATION = 27000; // 한 바퀴(중복 절반) 기준 27초
    var halfWidth = track.scrollWidth / 2;
    var startTime = null;

    function frame(timestamp) {
      if (startTime === null) startTime = timestamp;
      var elapsed = (timestamp - startTime) % DURATION;
      var progress = elapsed / DURATION;
      track.style.transform = "translateX(" + -(progress * halfWidth) + "px)";
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    window.addEventListener("resize", function () {
      halfWidth = track.scrollWidth / 2;
    });
  }

  // 2. 헤더 스티키 + 스크롤 축소
  function initStickyHeader() {
    var header = document.getElementById("header");
    if (!header) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  // 3. 메인배너 자동 슬라이드
  function initMainSlider() {
    var slider = document.getElementById("mainSlider");
    if (!slider) return;

    var slides = slider.querySelectorAll(".slide");
    var dots = slider.querySelectorAll(".dot");
    var prevBtn = slider.querySelector(".slider_arrow.prev");
    var nextBtn = slider.querySelector(".slider_arrow.next");
    var current = 0;
    var timer = null;
    var INTERVAL = 4000;

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function play() {
      stop();
      timer = setInterval(next, INTERVAL);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        play();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        play();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);

    play();
  }

  // 4. 스크롤 페이드인 애니메이션
  function initScrollFade() {
    if (!("IntersectionObserver" in window)) return;

    var sections = document.querySelectorAll(".sub_ad, .best, .footer");
    var bestItems = document.querySelectorAll(".best_item li");

    sections.forEach(function (el) {
      el.classList.add("fade-init");
    });

    bestItems.forEach(function (li, i) {
      li.classList.add("fade-init");
      li.style.transitionDelay = i * 0.05 + "s";
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach(function (el) {
      observer.observe(el);
    });

    bestItems.forEach(function (li) {
      observer.observe(li);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMarquee();
    initStickyHeader();
    initMainSlider();
    initScrollFade();
  });
})();
