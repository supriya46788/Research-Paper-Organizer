document.getElementById("clearFiltersBtn").addEventListener("click", function () {
  document.getElementById("searchInput").value = "";
  document.getElementById("topicFilter").selectedIndex = 0;
  document.getElementById("minYear").selectedIndex = 0;
  document.getElementById("favoriteFilter").selectedIndex = 0;
  document.getElementById("ratingFilter").selectedIndex = 0;
  document.getElementById("sortFilter").selectedIndex = 0;

  filterPapers();
});
