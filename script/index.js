var topSlideshow = initializeStandardSlideshow("id", document.getElementsByClassName("page-index-slideshow")[0], getSlugs(getRandomGames(12)), slideshowChangeCallback);

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
		thumbnail.getElementsByClassName("slideshow-description")[0].innerHTML = game.description;
		thumbnail.getElementsByClassName("slideshow-platforms")[0].innerHTML = platformsHtml(game.platforms, url);
		setTimeout(() => {
			thumbnail.style.opacity = 1;
		}, 100);
	}, 400);
}

function generateNewLibraryHtml(data) {
	return `<div class="library-game">
        <div class="library-game-cover" onmouseover="libraryMouseOver(this, true, '${data.slug}')"
          onmouseout="libraryMouseOver(this, false)" style="background-image: url('./assets/game-covers/${data.cover}')"><a
            href="./product.html?p=${data.slug}">
            <div class="library-game-video">
              <video muted="" loop=""></video>
              <div class="library-game-vignette"></div>
            </div>
          </a>
          <div class="library-game-icons">${platformsHtml(data.platforms, data.slug)}</div>
          ${gamePassBanner(data.gamePass)}
        </div>
        <div>
          <a href="./product.html?p=${data.slug}">
            <div class="library-game-title">${data.name}</div>
          </a>
          <a href="./explore#publisher=${data.publisher}">
            <div class="library-game-devname">${data.publisher}</div>
          </a>
          <div class="library-game-tags">${tagsHtml(data.tags)}</div>
          <div class="page-index-showcase-description">${data.description}</div>
          <div class="library-game-price">${formatPrice(data.price)}</div>
        </div>
      </div>`;
}

function populateIndexPage() {
	var properties = ["sold", "date", "rating"];
	var endLinks = ["Top_Selling", "New_And_Trending", "Top_Rated"];
	for (let a = 0; a < 3; a++) {
		let list = sortBy(library, properties[a]);
		var html = "";
		for (let i = 0; i < 5 && i < list.length; i++) {
			html += generateNewLibraryHtml(list[i]);
		}
		html += `<a class="page-index-showcase-more" href="./explore.html#sort=${endLinks[a]}">See More</a>`
		document.getElementsByClassName("page-index-showcase-column")[a].innerHTML += html;
	}
}
window.onload = function() {
	setTimeout(function() {
		populateIndexPage();
	}, 1000);
}