var topSlideshow = initializeStandardSlideshow("id", document.getElementsByClassName("split-section-section")[1], [], slideshowChangeCallback);

var links = topSlideshow.links;
for (let i = 0; i < links.length; i++) {
	let preloader = new Image();
	let slug = links[i].split("?p=")[links[i].split("?p=").length - 1];
	preloader.src = "./assets/game-covers/" + getGameBySlug(slug).cover;
}


function slideshowChangeCallback(url) {
	url = url.split("?p=")[url.split("?p=").length - 1];
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