/**
 * ST. THOMAS MAR THOMA CHURCH - MAIN JAVASCRIPT
 * Editorial Text-Only Chapter Navigation Controller (Consistent Background #F4F4F1, Pulsating Active Underline, 700ms Crossfade), Stay Connected Magazine Carousel (#D89169 Terracotta Background, #F6F4EF Cards, 1-Card Controls), Hero Showcase Carousel, Vicar Profile & Dark Mode Toggle.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     0. DARK MODE TOGGLE CONTROLLER
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  /* --------------------------------------------------------------------------
     1. NAVIGATION & MOBILE HAMBURGER MENU
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');

  if (hamburgerBtn && mobileMenuDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenuDrawer.classList.contains('open');
      if (isOpen) {
        mobileMenuDrawer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.setAttribute('aria-label', 'Open navigation');
      } else {
        mobileMenuDrawer.classList.add('open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        hamburgerBtn.setAttribute('aria-label', 'Close navigation');
      }
    });

    mobileMenuDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuDrawer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  /* --------------------------------------------------------------------------
     1.5. FEATURED EXHIBITION SHOWCASE CAROUSEL CONTROLLER
     -------------------------------------------------------------------------- */
  const heroEventsViewport = document.getElementById('heroEventsViewport');
  const heroEventsTrack = document.getElementById('heroEventsTrack');
  const heroEventsPrev = document.getElementById('heroEventsPrev');
  const heroEventsNext = document.getElementById('heroEventsNext');
  const heroCurrentSlideIndex = document.getElementById('heroCurrentSlideIndex');
  const heroProgressFillBar = document.getElementById('heroProgressFillBar');
  const heroCards = document.querySelectorAll('.hero-event-card');

  let currentHeroSlide = 0;
  const totalHeroSlides = heroCards.length || 4;
  let heroAutoRotationTimer = null;

  function updateHeroEventsCarousel() {
    if (!heroEventsTrack || heroCards.length === 0) return;
    
    const firstCard = heroCards[0];
    const cardWidth = firstCard.offsetWidth;
    let slideStep;
    if (window.innerWidth < 768) {
      slideStep = cardWidth;
    } else {
      const computedStyle = window.getComputedStyle(heroEventsTrack);
      const gap = parseFloat(computedStyle.gap) || 32;
      slideStep = cardWidth + gap;
    }
    
    const slideOffset = currentHeroSlide * slideStep;
    heroEventsTrack.style.transform = `translateX(-${slideOffset}px)`;
    
    heroCards.forEach((card, idx) => {
      card.classList.remove('active-center', 'preview-next', 'passed-prev');
      if (idx === currentHeroSlide) {
        card.classList.add('active-center');
      } else if (idx > currentHeroSlide) {
        card.classList.add('preview-next');
      } else {
        card.classList.add('passed-prev');
      }
    });

    if (heroCurrentSlideIndex) {
      heroCurrentSlideIndex.textContent = String(currentHeroSlide + 1).padStart(2, '0');
    }
    if (heroProgressFillBar) {
      const progressPercent = ((currentHeroSlide + 1) / totalHeroSlides) * 100;
      heroProgressFillBar.style.width = `${progressPercent}%`;
    }
  }

  function nextHeroSlide() {
    currentHeroSlide = (currentHeroSlide + 1) % totalHeroSlides;
    updateHeroEventsCarousel();
  }

  function prevHeroSlide() {
    currentHeroSlide = (currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides;
    updateHeroEventsCarousel();
  }

  if (heroEventsPrev) heroEventsPrev.addEventListener('click', () => { prevHeroSlide(); resetHeroAutoRotation(); });
  if (heroEventsNext) heroEventsNext.addEventListener('click', () => { nextHeroSlide(); resetHeroAutoRotation(); });

  // 6-Second Auto Rotation & Pause on Hover
  function startHeroAutoRotation() {
    if (!heroAutoRotationTimer) {
      heroAutoRotationTimer = setInterval(nextHeroSlide, 6000);
    }
  }

  function stopHeroAutoRotation() {
    if (heroAutoRotationTimer) {
      clearInterval(heroAutoRotationTimer);
      heroAutoRotationTimer = null;
    }
  }

  function resetHeroAutoRotation() {
    stopHeroAutoRotation();
    startHeroAutoRotation();
  }

  if (heroEventsViewport) {
    heroEventsViewport.addEventListener('mouseenter', stopHeroAutoRotation);
    heroEventsViewport.addEventListener('mouseleave', startHeroAutoRotation);

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    heroEventsViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopHeroAutoRotation();
    }, { passive: true });

    heroEventsViewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextHeroSlide();
      } else if (touchEndX - touchStartX > 50) {
        prevHeroSlide();
      }
      startHeroAutoRotation();
    }, { passive: true });
  }

  // Keyboard Navigation Support for Hero Section
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.closest('#hero')) {
      if (e.key === 'ArrowRight') {
        nextHeroSlide();
        resetHeroAutoRotation();
      } else if (e.key === 'ArrowLeft') {
        prevHeroSlide();
        resetHeroAutoRotation();
      }
    }
  });

  window.addEventListener('resize', updateHeroEventsCarousel);
  setTimeout(updateHeroEventsCarousel, 50);
  startHeroAutoRotation();

  /* --------------------------------------------------------------------------
     2. EVENT MODAL POPUP MANAGER
     -------------------------------------------------------------------------- */
  const eventModal = document.getElementById('eventModal');
  const eventModalClose = document.getElementById('eventModalClose');
  const eventModalImage = document.getElementById('eventModalImage');
  const eventModalTitle = document.getElementById('eventModalTitle');
  const eventModalDate = document.getElementById('eventModalDate');
  const eventModalTime = document.getElementById('eventModalTime');
  const eventModalVenue = document.getElementById('eventModalVenue');
  const eventModalDesc = document.getElementById('eventModalDesc');

  const eventsData = {
    "1": {
      title: "Youth Fellowship Meet",
      date: "25 May 2026",
      time: "4:00 PM - 6:00 PM",
      venue: "Church Auditorium",
      image: "./assets/youth_event_1785997975934.jpg",
      desc: "<p>Join us for our monthly Youth Fellowship gathering featuring praise & worship, engaging biblical group discussion, dynamic games, and evening refreshments. All young adults aged 15-35 are warmly welcome!</p>"
    },
    "2": {
      title: "Holy Communion Service",
      date: "01 June 2026",
      time: "8:00 AM - 10:15 AM",
      venue: "Main Sanctuary",
      image: "./assets/church_interior_1785997991930.jpg",
      desc: "<p>Solemn Divine Liturgy (Holy Qurbana) in traditional Malayalam liturgy celebrated by the Parish Vicar Rev. John Mathew. Special intercessory prayers for students preparing for exams.</p>"
    },
    "3": {
      title: "Choir Sunday & Worship",
      date: "08 June 2026",
      time: "9:30 AM - 11:30 AM",
      venue: "Main Sanctuary",
      image: "./assets/church_interior_1785997991930.jpg",
      desc: "<p>A joyful Sunday service featuring special musical renditions by the Senior and Junior Parish Choirs in celebration of Choir Sunday. Followed by fellowship tea in the church hall.</p>"
    },
    "4": {
      title: "Community Outreach Drive",
      date: "15 June 2026",
      time: "10:00 AM - 2:00 PM",
      venue: "St. Thomas Community Hall",
      image: "./assets/youth_event_1785997975934.jpg",
      desc: "<p>Parish outreach initiative distributing educational kits to local children and organizing a free health screening camp. Volunteers are invited to participate.</p>"
    }
  };

  document.querySelectorAll('.btn-read-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-event-id');
      const data = eventsData[id];
      if (data && eventModal) {
        eventModalImage.src = data.image;
        eventModalImage.alt = data.title;
        eventModalTitle.textContent = data.title;
        eventModalDate.textContent = data.date;
        eventModalTime.textContent = data.time;
        eventModalVenue.textContent = data.venue;
        eventModalDesc.innerHTML = data.desc;
        eventModal.classList.add('open');
      }
    });
  });

  if (eventModalClose) {
    eventModalClose.addEventListener('click', () => {
      eventModal.classList.remove('open');
    });
  }

  if (eventModal) {
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) {
        eventModal.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. ORGANIZATION MODAL POPUP MANAGER
     -------------------------------------------------------------------------- */
  const orgModal = document.getElementById('orgModal');
  const orgModalClose = document.getElementById('orgModalClose');
  const orgModalTag = document.getElementById('orgModalTag');
  const orgModalTitle = document.getElementById('orgModalTitle');
  const orgModalMeta = document.getElementById('orgModalMeta');
  const orgModalDesc = document.getElementById('orgModalDesc');

  const orgsData = {
    edavaka: {
      tag: "Parish Fellowship",
      title: "Edavaka Sangham",
      meta: "<div><strong>Meetings:</strong> Monthly General Body</div><div><strong>Focus:</strong> Parish Fellowship</div>",
      desc: "<p>A fellowship that brings parish members together for worship, service, spiritual growth and active participation in the life of the church.</p>"
    },
    sundayschool: {
      tag: "Children Ministry",
      title: "Sunday School",
      meta: "<div><strong>Age Group:</strong> 4 - 17 Years</div><div><strong>Timings:</strong> Sundays, 8:00 AM</div>",
      desc: "<p>A nurturing space where children learn Scripture, faith values, worship practices and Christian living through engaging lessons and activities.</p>"
    },
    choir: {
      tag: "Worship Ministry",
      title: "Parish Choir",
      meta: "<div><strong>Rehearsals:</strong> Saturdays, 6:00 PM</div><div><strong>Liturgy:</strong> Malayalam & English</div>",
      desc: "<p>A dedicated group that leads the congregation in worship through music, hymns and meaningful participation in church services.</p>"
    },
    youth: {
      tag: "Youth Fellowship",
      title: "Youth League (Yuvajana Sakhyam)",
      meta: "<div><strong>Meetings:</strong> 1st & 3rd Sundays</div><div><strong>Activities:</strong> Retreats, Outreach</div>",
      desc: "<p>A vibrant fellowship for young people to grow in faith, leadership, service and community through worship, learning and activities.</p>"
    },
    sevikasangham: {
      tag: "Women Ministry",
      title: "Sevika Sangham",
      meta: "<div><strong>Meetings:</strong> Tuesdays, 4:00 PM</div><div><strong>Focus:</strong> Prayer & Charity</div>",
      desc: "<p>A fellowship focused on prayer, service, spiritual growth and active support for church ministries and community care.</p>"
    },
    senior: {
      tag: "Senior Ministry",
      title: "Senior Citizen Fellowship",
      meta: "<div><strong>Meetings:</strong> Monthly 2nd Saturday</div><div><strong>Focus:</strong> Spiritual Care</div>",
      desc: "<p>A warm fellowship for senior members to gather in prayer, encouragement, companionship and continued participation in church life.</p>"
    }
  };

  document.querySelectorAll('.btn-org-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orgId = btn.getAttribute('data-org-id');
      const data = orgsData[orgId];
      if (data && orgModal) {
        orgModalTag.textContent = data.tag;
        orgModalTitle.textContent = data.title;
        orgModalMeta.innerHTML = data.meta;
        orgModalDesc.innerHTML = data.desc;
        orgModal.classList.add('open');
      }
    });
  });

  if (orgModalClose) {
    orgModalClose.addEventListener('click', () => {
      orgModal.classList.remove('open');
    });
  }

  if (orgModal) {
    orgModal.addEventListener('click', (e) => {
      if (e.target === orgModal) {
        orgModal.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. VICAR & OFFICE BEARERS PROFILE MODAL MANAGER
     -------------------------------------------------------------------------- */
  const vicarModal = document.getElementById('vicarModal');
  const vicarModalClose = document.getElementById('vicarModalClose');

  document.querySelectorAll('.btn-view-vicar-profile').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (vicarModal) vicarModal.classList.add('open');
    });
  });

  if (vicarModalClose) {
    vicarModalClose.addEventListener('click', () => {
      if (vicarModal) vicarModal.classList.remove('open');
    });
  }

  if (vicarModal) {
    vicarModal.addEventListener('click', (e) => {
      if (e.target === vicarModal) {
        vicarModal.classList.remove('open');
      }
    });
  }

  // Office Bearers Profiles Data & Controller
  const bearerModal = document.getElementById('bearerModal');
  const bearerModalClose = document.getElementById('bearerModalClose');
  const bearerModalImage = document.getElementById('bearerModalImage');
  const bearerModalRole = document.getElementById('bearerModalRole');
  const bearerModalTitle = document.getElementById('bearerModalTitle');
  const bearerModalMeta = document.getElementById('bearerModalMeta');
  const bearerModalDesc = document.getElementById('bearerModalDesc');
  const bearerModalContact = document.getElementById('bearerModalContact');

  const bearersData = {
    george: {
      name: "Mr. George Varghese",
      role: "PARISH SECRETARY",
      image: "./assets/bearer_george.jpg",
      phone: "+91 98765 43211",
      email: "secretary@jmtchebbal.org",
      meta: "<div><strong>Office:</strong> Parish Secretary</div><div><strong>Term:</strong> 2024 - Present</div><div><strong>Phone:</strong> +91 98765 43211</div>",
      desc: "<p>Mr. George Varghese serves as the Parish Secretary for Jerusalem Mar Thoma Church, Hebbal. He oversees administrative operations, parish council documentation, communication with the Mar Thoma Diocese, and coordination between parish organizations.</p><p>Dedicated to transparent governance and member communication, he can be reached for administrative inquiries and parish office records.</p>"
    },
    thomas: {
      name: "Mr. Thomas Kurian",
      role: "PARISH TRUSTEE",
      image: "./assets/bearer_thomas.jpg",
      phone: "+91 98765 43212",
      email: "trustee@jmtchebbal.org",
      meta: "<div><strong>Office:</strong> Parish Trustee (Finance)</div><div><strong>Term:</strong> 2024 - Present</div><div><strong>Phone:</strong> +91 98765 43212</div>",
      desc: "<p>Mr. Thomas Kurian serves as the Trustee of Jerusalem Mar Thoma Church, Hebbal. He manages the financial administration, asset maintenance, annual parish budget, and statutory audit reporting of the church.</p><p>With years of professional experience, he ensures faithful financial stewardship of all tithes, offerings, and project funds of the parish.</p>"
    },
    lissy: {
      name: "Mrs. Lissy Abraham",
      role: "LAY LEADER",
      image: "./assets/bearer_lissy.jpg",
      phone: "+91 98765 43213",
      email: "layleader@jmtchebbal.org",
      meta: "<div><strong>Office:</strong> Lay Leader</div><div><strong>Term:</strong> 2024 - Present</div><div><strong>Phone:</strong> +91 98765 43213</div>",
      desc: "<p>Mrs. Lissy Abraham serves as Lay Leader at Jerusalem Mar Thoma Church, Hebbal. She coordinates lay participation in Sunday divine services, Bible study groups, and prayer cell fellowship meetings.</p><p>She is actively involved in Sevika Sangham and parish care ministries, encouraging spiritual growth and community care.</p>"
    },
    elizabeth: {
      name: "Dr. Elizabeth Samuel",
      role: "COMMITTEE MEMBER",
      image: "./assets/bearer_elizabeth.jpg",
      phone: "+91 98765 43214",
      email: "committee@jmtchebbal.org",
      meta: "<div><strong>Office:</strong> Executive Committee Member</div><div><strong>Term:</strong> 2024 - Present</div><div><strong>Phone:</strong> +91 98765 43214</div>",
      desc: "<p>Dr. Elizabeth Samuel serves as an Executive Committee Member representing parish families. She leads parish health initiatives, medical camps, and community welfare programs.</p><p>Her work focuses on extending practical Christian care, medical aid support, and educational assistance to families in need.</p>"
    }
  };

  document.querySelectorAll('.btn-view-bearer-profile').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const bearerId = link.getAttribute('data-bearer-id');
      const data = bearersData[bearerId];
      if (data && bearerModal) {
        if (bearerModalImage) { bearerModalImage.src = data.image; bearerModalImage.alt = data.name; }
        if (bearerModalRole) bearerModalRole.textContent = data.role;
        if (bearerModalTitle) bearerModalTitle.textContent = data.name;
        if (bearerModalMeta) bearerModalMeta.innerHTML = data.meta;
        if (bearerModalDesc) bearerModalDesc.innerHTML = data.desc;
        if (bearerModalContact) bearerModalContact.href = `mailto:${data.email}`;
        bearerModal.classList.add('open');
      }
    });
  });

  if (bearerModalClose) {
    bearerModalClose.addEventListener('click', () => {
      if (bearerModal) bearerModal.classList.remove('open');
    });
  }

  if (bearerModal) {
    bearerModal.addEventListener('click', (e) => {
      if (e.target === bearerModal) {
        bearerModal.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. CHURCH LIFE & MINISTRIES SHOWCASE CAROUSEL CONTROLLER
     -------------------------------------------------------------------------- */
  const communityChapters = document.querySelectorAll('.community-story-chapter');
  const communityPrevBtn = document.getElementById('communityPrevBtn');
  const communityNextBtn = document.getElementById('communityNextBtn');
  const communityCounter = document.getElementById('communityCounter');

  let activeChapterIndex = 0;
  const totalCommunityChapters = communityChapters.length || 7;

  function switchCommunityChapter(targetIndex) {
    // Infinite looping navigation
    targetIndex = (targetIndex + totalCommunityChapters) % totalCommunityChapters;
    activeChapterIndex = targetIndex;

    // Toggle active slide visibility & 850ms cinematic transition
    communityChapters.forEach((chapter, idx) => {
      if (idx === targetIndex) {
        chapter.removeAttribute('hidden');
        setTimeout(() => chapter.classList.add('active-chapter'), 20);
      } else {
        chapter.classList.remove('active-chapter');
        setTimeout(() => {
          if (idx !== activeChapterIndex) chapter.setAttribute('hidden', '');
        }, 850);
      }
    });

    if (communityCounter) {
      communityCounter.textContent = `Slide ${targetIndex + 1} of ${totalCommunityChapters}`;
    }
  }

  if (communityPrevBtn) {
    communityPrevBtn.addEventListener('click', () => {
      switchCommunityChapter(activeChapterIndex - 1);
    });
  }

  if (communityNextBtn) {
    communityNextBtn.addEventListener('click', () => {
      switchCommunityChapter(activeChapterIndex + 1);
    });
  }

  // Touch Swipe Support for Community Section
  const communityViewport = document.getElementById('community');
  if (communityViewport) {
    let commTouchStartX = 0;
    let commTouchStartY = 0;

    communityViewport.addEventListener('touchstart', (e) => {
      commTouchStartX = e.changedTouches[0].screenX;
      commTouchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    communityViewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - commTouchStartX;
      const diffY = touchEndY - commTouchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX < 0) {
          switchCommunityChapter(activeChapterIndex + 1);
        } else {
          switchCommunityChapter(activeChapterIndex - 1);
        }
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     6. STAY CONNECTED MAGAZINE CAROUSEL CONTROLLER (#quick-access)
     -------------------------------------------------------------------------- */
  const stayConnectedMagTabs = document.querySelectorAll('.stay-connected-mag-tab');
  const stayConnectedMagPanels = {
    announcements: document.getElementById('panelAnnouncements'),
    resources: document.getElementById('panelResources'),
    gallery: document.getElementById('panelGallery')
  };

  function switchStayConnectedTab(targetTab) {
    if (!stayConnectedMagPanels[targetTab]) return;

    stayConnectedMagTabs.forEach(tab => {
      const key = tab.getAttribute('data-tab');
      if (key === targetTab) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    Object.keys(stayConnectedMagPanels).forEach(key => {
      const panel = stayConnectedMagPanels[key];
      if (panel) {
        if (key === targetTab) {
          panel.removeAttribute('hidden');
          setTimeout(() => panel.classList.add('active-panel'), 20);
        } else {
          panel.classList.remove('active-panel');
          setTimeout(() => {
            if (key !== targetTab) panel.setAttribute('hidden', '');
          }, 350);
        }
      }
    });
  }

  stayConnectedMagTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-tab');
      switchStayConnectedTab(key);
    });
  });

  // Carousel 1-Card Step Controllers (Announcements, Resources, Gallery)
  function initMagCarousel(viewportId, trackId, prevBtnId, nextBtnId) {
    const viewport = document.getElementById(viewportId);
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!viewport || !track || !prevBtn || !nextBtn) return;

    let currentSlide = 0;

    function getSlideStep() {
      const firstCard = track.querySelector('.mag-content-card');
      if (!firstCard) return 335;
      const cardWidth = firstCard.offsetWidth;
      const gap = 30; // 1.85rem
      return cardWidth + gap;
    }

    function getMaxSlides() {
      const cards = track.querySelectorAll('.mag-content-card');
      const visibleCount = Math.floor(viewport.offsetWidth / getSlideStep()) || 1;
      return Math.max(0, cards.length - visibleCount);
    }

    function updateCarouselPosition() {
      const step = getSlideStep();
      const offset = currentSlide * step;
      track.style.transform = `translateX(-${offset}px)`;
    }

    nextBtn.addEventListener('click', () => {
      const maxSlides = getMaxSlides();
      if (currentSlide < maxSlides) {
        currentSlide++;
      } else {
        currentSlide = 0; // Wrap around smoothly
      }
      updateCarouselPosition();
    });

    prevBtn.addEventListener('click', () => {
      const maxSlides = getMaxSlides();
      if (currentSlide > 0) {
        currentSlide--;
      } else {
        currentSlide = maxSlides;
      }
      updateCarouselPosition();
    });

    // Touch Swipe Gesture Support for Magazine Carousels
    let magTouchStartX = 0;
    let magTouchStartY = 0;

    viewport.addEventListener('touchstart', (e) => {
      magTouchStartX = e.changedTouches[0].screenX;
      magTouchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - magTouchStartX;
      const diffY = touchEndY - magTouchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        const maxSlides = getMaxSlides();
        if (diffX < 0) {
          if (currentSlide < maxSlides) currentSlide++;
          else currentSlide = 0;
        } else {
          if (currentSlide > 0) currentSlide--;
          else currentSlide = maxSlides;
        }
        updateCarouselPosition();
      }
    }, { passive: true });

    window.addEventListener('resize', updateCarouselPosition);
  }

  initMagCarousel('announcementsViewport', 'announcementsTrack', 'announcementsPrev', 'announcementsNext');
  initMagCarousel('resourcesViewport', 'resourcesTrack', 'resourcesPrev', 'resourcesNext');
  initMagCarousel('galleryViewport', 'galleryTrack', 'galleryPrev', 'galleryNext');

  /* --------------------------------------------------------------------------
     6.5. LEADERSHIP COMMITTEE MOBILE SWIPABLE CAROUSEL CONTROLLER (< 768px)
     -------------------------------------------------------------------------- */
  const bearersGrid = document.getElementById('bearersGrid');
  const bearersPrevBtn = document.getElementById('bearersPrevBtn');
  const bearersNextBtn = document.getElementById('bearersNextBtn');
  const bearersCounter = document.getElementById('bearersCounter');

  if (bearersGrid) {
    const bearerCards = bearersGrid.querySelectorAll('.bearer-card');
    const totalBearers = bearerCards.length || 4;

    function updateBearersMobileCounter() {
      const scrollLeft = bearersGrid.scrollLeft;
      const cardWidth = bearersGrid.offsetWidth || 300;
      const activeIdx = Math.round(scrollLeft / cardWidth);
      const safeIdx = Math.min(Math.max(0, activeIdx), totalBearers - 1);

      if (bearersCounter) {
        bearersCounter.textContent = `${String(safeIdx + 1).padStart(2, '0')} / ${String(totalBearers).padStart(2, '0')}`;
      }
    }

    bearersGrid.addEventListener('scroll', updateBearersMobileCounter, { passive: true });

    if (bearersPrevBtn) {
      bearersPrevBtn.addEventListener('click', () => {
        const cardWidth = bearersGrid.offsetWidth || 300;
        bearersGrid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });
    }

    if (bearersNextBtn) {
      bearersNextBtn.addEventListener('click', () => {
        const cardWidth = bearersGrid.offsetWidth || 300;
        bearersGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
      });
    }
  }

  /* --------------------------------------------------------------------------
     8. GLOBAL PULSATING MOUSE FOLLOWER GRADIENT
     -------------------------------------------------------------------------- */
  const globalCursorGlow = document.getElementById('globalCursorGlow');

  if (globalCursorGlow && window.matchMedia('(min-width: 768px)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMouseMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMouseMoving) {
        isMouseMoving = true;
        globalCursorGlow.style.opacity = '0.85';
      }
    }, { passive: true });

    // Smooth Lerp (Linear Interpolation for silky smooth cursor tracking)
    function animateCursorGlow() {
      currentX += (mouseX - currentX) * 0.10;
      currentY += (mouseY - currentY) * 0.10;

      globalCursorGlow.style.left = `${currentX.toFixed(2)}px`;
      globalCursorGlow.style.top = `${currentY.toFixed(2)}px`;

      requestAnimationFrame(animateCursorGlow);
    }

    requestAnimationFrame(animateCursorGlow);
  }

  /* --------------------------------------------------------------------------
     7. TOAST NOTIFICATION HELPER
     -------------------------------------------------------------------------- */
  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
