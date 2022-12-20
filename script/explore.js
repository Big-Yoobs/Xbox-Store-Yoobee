getRandomGames();

window.onhashchange = () => { handleFilters(location.hash) }; // call handleFilters() when the page hash changes

document.getElementsByClassName("filters-container")[0].innerHTML = generateFiltersHtml(); // tells utils to generate filters html, must be called before handleFilters()

handleFilters(location.hash); // call handleFilters() when the page loads

function reloadLibrary() { // reload library html when filters update
	document.getElementsByClassName("library-container")[0].innerHTML = generateLibraryHtmlList(sortList(matchesQuery(applyLibraryFilters(currentFilters), document.getElementsByClassName("searchbox")[0].value)));
}
document.getElementsByClassName("searchbox")[0].value = "";



var container = document.getElementsByClassName("page-explore-slideshow")[0];

var topSlideshow = initializeStandardSlideshow("id", document.getElementsByClassName("page-explore-slideshow")[0]);