var topSlideshow = initializeStandardSlideshow("id", document.getElementsByClassName("split-section-section")[1], [], slideshowChangeCallback);

var links = topSlideshow.links;
for (let i = 0; i < links.length; i++) {
	let preloader = new Image();
	let slug = links[i].split("?p=")[links[i].split("?p=").length - 1];
	preloader.src = "./assets/game-covers/" + getGameBySlug(slug).cover;
}

function slideshowChangeCallback(url) {
	url = url.split("?p=")[url.split("?p=").length - 1];
	console.log(url);
	var game = getGameBySlug(url);
	var thumbnail = document.getElementsByClassName("slideshow-thumbnail")[0];
	thumbnail.style.opacity = 0;
	setTimeout(() => {
		thumbnail.style.backgroundImage = `url("./assets/game-covers/${game.cover}")`;
		setTimeout(() => {
			thumbnail.style.opacity = 1;
		}, 100);
	}, 400);
}


window.onhashchange = () => { handleFilters(location.hash) }; // call handleFilters() when the page hash changes

document.getElementsByClassName("filters-container")[0].innerHTML = generateFiltersHtml(); // tells utils to generate filters html, must be called before handleFilters()

handleFilters(location.hash); // call handleFilters() when the page loads

function reloadLibrary() { // reload library html when filters update
	var out = [];
	var lib = applyLibraryFilters(currentFilters);
	for (let i = 0; i < lib.length; i++) {
		if (lib[i].gamePass) out.push(lib[i]);
	}
	document.getElementsByClassName("library-container")[0].innerHTML = generateLibraryHtmlList(matchesQuery(sortList(out), document.getElementsByClassName("searchbox")[0].value));
}
document.getElementsByClassName("searchbox")[0].value = "";


window.onload = function() {
	setTimeout(function() {
		populateIndexPage();
	}, 1000);
}