const revealTargets = document.querySelectorAll("[data-reveal]");
const cursor = document.querySelector(".cursor-dot");
const switchButtons = document.querySelectorAll(".switch-button");
const panels = document.querySelectorAll(".profile-panel");
const moodCards = document.querySelectorAll(".mood-card");
const moodResult = document.querySelector(".mood-result");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealTargets.forEach((target) => observer.observe(target));

switchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextProfile = button.dataset.profile;

    switchButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === nextProfile);
    });
  });
});

const moodMessages = {
  "ごきげん": "今日のむぎとりっかはごきげん。おやつの音だけで、ふたり同時に集合します。",
  "おすまし": "今日のむぎとりっかはおすまし。並んで座れば、どこでも小さな撮影会です。",
  "ねむねむ": "今日のむぎとりっかはねむねむ。ふかふかの場所を見つけたら、もう動きません。"
};

moodCards.forEach((card) => {
  card.addEventListener("click", () => {
    moodCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    moodResult.textContent = moodMessages[card.dataset.mood];
  });
});

if (cursor) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
    item.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });
}
