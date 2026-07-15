document.addEventListener("DOMContentLoaded", () => {
  const newsContainer = document.getElementById("news-container");

  // Demo research news (API-safe & free)
  const researchNews = [
    {
      title: "AI Revolution in Academic Research",
      description:
        "Researchers are leveraging AI to automate literature reviews and data analysis.",
      url: "https://www.nature.com"
    },
    {
      title: "New Advances in Medical Research Papers",
      description:
        "Recent studies show promising breakthroughs in cancer treatment research.",
      url: "https://www.sciencedaily.com"
    },
    {
      title: "Sustainable Technology Research Trends 2025",
      description:
        "Green energy and sustainability are dominating recent research publications.",
      url: "https://www.springer.com"
    }
  ];

  newsContainer.innerHTML = "";

  researchNews.forEach(news => {
    const card = document.createElement("div");
    card.classList.add("news-card");

    card.innerHTML = `
      <h3>${news.title}</h3>
      <p>${news.description}</p>
      <a href="${news.url}" target="_blank">Read More →</a>
    `;

    newsContainer.appendChild(card);
  });
});
