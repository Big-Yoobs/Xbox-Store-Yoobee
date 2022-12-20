var currentFilters = {};
var libraryMouseoverHandler = {};

function libraryMouseOver(element, enabled, slug) { // called when mouseover on game cover
	if (Object.keys(libraryMouseoverHandler).includes(element)) clearTimeout(libraryMouseoverHandler); // cancels any existing timers for this game cover
	if (enabled) {
		console.log(slug);
		var game = getGameBySlug(slug);
		element.getElementsByTagName("video")[0].src = `./assets/game-cover-videos/${game.coverVideo}`;
		element.getElementsByTagName("video")[0].load();
	}
	libraryMouseoverHandler[element] = setTimeout(function() { // starts new timer
		if (enabled) {
			element.getElementsByTagName("video")[0].currentTime = 0; // after 1 second, make video play from start
			element.getElementsByTagName("video")[0].play();
		} else {
			//element.getElementsByTagName("video")[0].pause();
		}
	}, enabled ? 500 : 1000);
}

var slideshows = {};

function formatPrice(price) {
	if (price == 0) return "FREE";
	price = Math.round(price * 100).toString();
	return "$" + price.slice(0, price.length - 2) + "." + price.slice(price.length - 2);
}

function formatReview(review) {
	review = Math.round(review * 10).toString();
	return review.slice(0, review.length - 1) + "." + review.slice(review.length - 1);
}

function formatNumber(number) {
	if (number >= 1000000) return (Math.floor(number / 100000) / 10) + "M";
	if (number >= 1000) return (Math.floor(number / 100) / 10) + "K";
	return number;
}

function initializeStandardSlideshow(id, container, games = [], callback = false) {
	if (!games || !games.length) games = getSlugs(getRandomGames());
	var images = [];
	var titles = [];
	var links = [];
	var tags = [];
	for (let i = 0; i < games.length; i++) {
		var game = getGameBySlug(games[i]);
		if (!game) continue;
		images.push("./assets/slideshow-images/" + games[i] + ".jpg");
		titles.push(game.name);
		links.push(`./product.html?p=${games[i]}`);
		tags.push(game.tags);
	}
	var options = {
		imageContainer: container.getElementsByClassName("slideshow-image")[0],
		imageContainer2: container.getElementsByClassName("slideshow-image2")[0],
		images: images,
		titles: titles,
		links: links,
		titleElement: container.getElementsByClassName("slideshow-title")[0],
		tags: tags,
		buttonsElement: container.getElementsByClassName("slideshow-buttons-container")[0],
		tagsElement: container.getElementsByClassName("slideshow-tags")[0],
		delay: 5
	};
	if (callback) options.slideshowChangeCallback = callback;
	var slideshow = initializeSlideshow(id, options);
	slideshow.start();
	return slideshow;
}

function initializeSlideshow(slideshowId, options) {
	if (!options.imageContainer || !options.imageContainer2 || !options.images || !options.images.length) return false;
	function get() {
		return slideshows[slideshowId];
	}
	slideshows[slideshowId.toString()] = {
		imageContainer: options.imageContainer,
		imageContainer2: options.imageContainer2,
		images: options.images,
		titleElement: options.titleElement ? options.titleElement : false,
		titles: options.titles ? options.titles : [],
		delay: options.delay ? options.delay : 2,
		tags: options.tags ? options.tags : [],
		tagsElement: options.tagsElement ? options.tagsElement : false,
		links: options.links ? options.links : [],
		buttonsElement: options.buttonsElement ? options.buttonsElement : false,
		timeout: false,
		currentSlide: 0,
		slideshowChangeCallback: options.slideshowChangeCallback ? options.slideshowChangeCallback : false,
		isBusy: () => { return false },
		nextSlide: () => {
			get().doSlide(get().currentSlide + 1);
		},
		previousSlide: () => {
			get().doSlide(get().currentSlide - 1);
		},
		start: () => {
			get().doSlide(0, true)
		},
		stop: () => {
			clearTimeout(get().timeout);
		},
		doSlide: async (slide, force = false) => {
			while (slide < 0) {
				slide += get().images.length;
			}
			slide = slide % get().images.length;
			if (get().isBusy() || (slide == get().currentSlide && !force)) return false;
			get().isBusy = () => { return true };
			clearTimeout(get().timeout);
			setTimeout(() => {
				get().isBusy = () => { return false };
			}, 750);
			get().timeout = setTimeout(get().nextSlide, get().delay * 1000);
			get().currentSlide = slide;
			if (get().slideshowChangeCallback) get().slideshowChangeCallback(get().links[slide]);
			if (get().titleElement && get().titles.length > slide) {
				setTimeout(() => {
					get().titleElement.style.transition = "opacity 0.3s";
					get().titleElement.style.opacity = 0;
					setTimeout(() => {
						let html = get().titles[slide];
						if (get().links.length > slide) html = `<a href="${get().links[slide]}">${html}</a>`;
						get().titleElement.innerHTML = html;
						setTimeout(() => {
							get().titleElement.style.opacity = 1;
						}, 100);
					}, 300);
				}, 10);
			}
			if (get().tagsElement && get().tags.length > slide) {
				setTimeout(() => {
					get().tagsElement.style.transition = "opacity 0.3s";
					get().tagsElement.style.opacity = 0;
					setTimeout(() => {
						get().tagsElement.innerHTML = tagsHtml(get().tags[slide]);
						setTimeout(() => {
							get().tagsElement.style.opacity = 1;
						}, 400);
					}, 300);
				}, 10);
			}
			if (get().buttonsElement) {
				let buttons = get().buttonsElement.getElementsByClassName("slideshow-button");
				for (let i = 0; i < buttons.length; i++) {
					if (i == slide) {
						buttons[i].classList.add("slideshow-button-selected");
					} else {
						buttons[i].classList.remove("slideshow-button-selected");
					}
				}
			}
			var loadDelay = 0;
			if (get().images[slide].toLowerCase().endsWith(".mp4") || get().images[slide].startsWith("video-")) {
				get().imageContainer2.src = get().images[slide].startsWith("video-") ? get().images[slide].slice(6) : get().images[slide];
				get().imageContainer2.load();
				clearTimeout(get().timeout);
				let timestamp = (new Date()).getTime();
				clearTimeout(get().timeout);
				get().imageContainer2.onloadedmetadata = function() {
					console.log('metadata loaded!');
					console.log(this.duration);
					loadDelay = (new Date()).getTime() - timestamp;
					console.log("took " + loadDelay + "ms");
					get().timeout = setTimeout(get().nextSlide, this.duration * 1000 - loadDelay);
				};
			} else {
				try {
					get().imageContainer2.pause();
					get().imageContainer2.removeAttribute('src');
					get().imageContainer2.load();
				} catch { }
				console.log(get().images[slide]);
				console.log(get().images[slide].startsWith("image-") ? get().images[slide].split("-", 1)[1] : get().images[slide]);
				get().imageContainer2.style.backgroundImage = `url("${get().images[slide].startsWith("image-") ? get().images[slide].slice(6) : get().images[slide]}")`;
			}
			get().imageContainer.style.transition = "opacity 0.5s, transform 0.5s";
			get().imageContainer2.style.animation = "none";
			setTimeout(() => {
				get().imageContainer2.style.animation = null;
				setTimeout(() => {
					if (get().links.length > slide) {
						get().imageContainer2.href = get().links[slide];
					} else {
						get().imageContainer2.removeAttribute("href");
					}
				}, 100);
				get().imageContainer.style.opacity = 0;
				get().imageContainer.style.transform = "scale(1.1)";
				setTimeout(async () => {
					get().imageContainer.style.animation = "none";
					if (get().images[slide].toLowerCase().endsWith(".mp4") || get().images[slide].startsWith("video-")) {
						console.log(get().images[slide].startsWith("video-") ? get().images[slide].slice(6) : get().images[slide]);
						get().imageContainer.src = get().images[slide].startsWith("video-") ? get().images[slide].slice(6) : get().images[slide];
						get().imageContainer.load();
						get().imageContainer.currentTime = get().imageContainer2.currentTime + (loadDelay / 1000) + 0.1;
						get().imageContainer.play();
					} else {
						try {
							get().imageContainer.pause();
							get().imageContainer.removeAttribute('src');
							get().imageContainer.load();
						} catch { }
						get().imageContainer.style.backgroundImage = `url("${get().images[slide].startsWith("image-") ? get().images[slide].slice(6) : get().images[slide]}")`;
					}
					get().imageContainer.style.transition = "opacity 0.5s, transform 0s";
					setTimeout(() => {
						get().imageContainer.style.animation = null;
						get().imageContainer.style.opacity = 1;
						get().imageContainer.style.transform = "scale(1)";
					}, 10);
				}, 500);
			}, 10);
		}
	};
	if (get().buttonsElement) {
		let html = "";
		for (let i = 0; i < get().images.length; i++) {
			html += `<button class="slideshow-button" onClick="getSlideshowById('${slideshowId}').doSlide(${i})"></button>`;
		}
		get().buttonsElement.innerHTML = html;
	}
	for (let i = 0; i < get().images.length; i++) {
		console.log("preloading " + get().images[i]);
		if (get().images[i].toLowerCase().endsWith(".mp4")) {
			loadSlideshowVideo(get(), get().images[i], i, "video");
		} else {
			loadSlideshowVideo(get(), get().images[i], i, "image");
		}
	}
	return get();
}

async function loadSlideshowVideo(slideshow, src, id, type) {
	console.log("updating video to blob");
	slideshow.images[id] = type + "-" + await preloadVideo(src);
}

async function preloadVideo(src) {
	const res = await fetch(src);
	const blob = await res.blob();
	return URL.createObjectURL(blob);
}

function getSlideshowById(id) {
	if (!Object.keys(slideshows).includes(id)) return false;
	return slideshows[id];
}

function getGameBySlug(slug) {
	for (let i = 0; i < library.length; i++) {
		if (library[i].slug == slug) return library[i];
	}
	return false;
}

function formatDate(date) {
	date = new Date(date * 1000);
	var days = date.getDate().toString();
	var months = (date.getMonth() + 1).toString();
	var years = date.getFullYear();
	while (days.length < 2) days = "0" + days;
	while (months.length < 2) months = "0" + months;
	return days + "/" + months + "/" + years;
}

function gamePassBanner(shouldDo) { // generate html for game pass banner on game covers
	if (!shouldDo) return "";
	return `<a href="./game-pass.html"><div class="library-game-pass">Game Pass</div></a>`;
}

function tagsHtml(tags) { // generate html for game pass banner on game covers
	var html = "";
	for (var i = 0; i < tags.length; i++) {
		html += `<a href="./explore.html#genre=${tags[i]}"><div class="library-game-tag">${filters.genre.names[tags[i]]}</div></a>`;
	}
	return html;
}

function platformsHtml(platforms, slug) { // generate html for supported platforms on game covers
	var html = "";
	for (var i = 0; i < platforms.length; i++) {
		html += `<a href="./product.html?p=${slug}#${platforms[i]}"><img src="./assets/platforms/${platforms[i]}.png" /></a>`;
	}
	return html;
}

function generateProductHtml(data) { // generate html for game cover
	return `<div class="library-game">
 			<a href="./product.html?p=${data.slug}">
				<div class="library-game-cover" onMouseOver="libraryMouseOver(this, true, '${data.slug}')" onMouseOut="libraryMouseOver(this, false, '${data.slug}')" style="background-image: url('./assets/game-covers/${data.cover}')">
		 			<div class="library-game-video">
						<video muted loop></video>
						<div class="library-game-vignette"></div>
		 			</div>
					<div class="library-game-icons">
						${platformsHtml(data.platforms, data.slug)}
					</div>
					${gamePassBanner(data.gamePass)}
				</div>
			</a>
		<div class="library-game-description">
			<a href="./product.html?p=${data.slug}">
	 			<div class="library-game-title">${data.name}</div>
			</a>
			<div class="library-game-extras">
				<a href="./explore#publisher=${data.publisher}">
					<div class="library-game-devname">${data.publisher}</div>
		 		</a>
				<div class="library-game-price">${formatPrice(data.price)}</div>
				<div class="library-game-tags">${tagsHtml(data.tags)}</div>
			</div>
		</div>
		</div>`;
}

function generateFiltersHtml() { // generate html for filter selection
	var filterNames = {
		"platform": "Play On",
		"feature": "Features",
		"genre": "Genres",
		"maturity": "Maturity Rating"
	}
	function generateOptionsHtml(options, filter) {
		var html = "";
		for (let i = 0; i < options.order.length; i++) {
			let optionId = options.order[i];
			html += `<span onClick="setFilterOption('${filter}', '${optionId}', true)" class="filter-option filter-property-${filter}-${optionId}">${options.names[optionId]}<button onClick="setFilterOption('${filter}', '${optionId}', false)"></button></span>`
		}
		return html;
	}
	var html = "";
	for (let i = 0; i < Object.keys(filters).length; i++) {
		var filter = Object.keys(filters)[i];
		html += `<div>
			<input type="checkbox" class="filters-checkbox" id="filters-checkbox-${filter}" checked></input>
			<label for="filters-checkbox-${filter}" class="filter-name">
				<div></div>
				<span>${filterNames[filter]}</span>
			</label>
			<div class="filters-filter">
				${generateOptionsHtml(filters[filter], filter)}
			</div>`;
	}
	return html;
}

function applyLibraryFilters(filters = {}) { // returns games that conform to defined filters
	var list = [];
	var propertyMap = {
		"platform": "platforms",
		"feature": "features",
		"genre": "tags"
	};
	for (let i = 0; i < library.length; i++) {
		let valid = true;
		for (let a = 0; a < Object.keys(propertyMap).length; a++) {
			let property = Object.keys(propertyMap)[a];
			if (Object.keys(filters).includes(property) && filters[property].length) {
				let libraryPropertyId = propertyMap[property];
				let propertyFound = false;
				try {
					for (let b = 0; b < library[i][libraryPropertyId].length; b++) {
						if (filters[property].includes(library[i][libraryPropertyId][b])) propertyFound = true;
					}
				} catch (e) {
					console.log(e);
					valid = false;
				}
				if (!propertyFound) valid = false;
			}
		}
		if (Object.keys(filters).includes("maturity") && filters.maturity.length && !filters.maturity.includes(library[i].maturityRating)) valid = false;
		if (Object.keys(filters).includes("gamePass") && !library[i].gamePass) valid = false;
		if (valid) list.push(library[i]);
	}
	return list;
};

function generateLibraryHtmlList(list) { // generates library html based on list of games, works well with applyLibraryFilters()
	var html = "";
	for (let i = 0; i < list.length; i++) {
		html += generateProductHtml(list[i]);
	}
	return html;
}

function generateAddonsHtmlList(game) { // generates addon html based on list of addons
	var html = "";
	if (!game.addons) return html;
	for (let i = 0; i < game.addons.length; i++) {
		html += generateAddonHtml(game.slug, game.addons[i]);
	}
	return html;
}

var currentSortMethod = "New_And_Trending";
try {
	document.getElementsByClassName("sort-" + currentSortMethod)[0].classList.add("sortnav-item-selected");
} catch { }

function sortList(list, method = currentSortMethod) {
	switch (method) {
		case "Top_Selling":
			return sortBy(list, "sold");
		case "Top_Rated":
			return sortBy(list, "rating");
		case "Lowest_Price":
			return sortBy(list, "price", true);
		case "Highest_Price":
			return sortBy(list, "price");
		default:
			return sortBy(list, "date");
	}
}

function handleFilters(filterString) { // parses filter hash string, call when hash has changed
	var hash = filterString.substring(1);
	var tempFilters = hash.includes("&") ? hash.split("&") : [hash];
	var newFilters = {};
	for (let i = 0; i < tempFilters.length; i++) {
		if (!tempFilters[i].includes("=")) continue;
		let data = tempFilters[i].split("=", 2);
		if (data[0] == "sort" && ["New_And_Trending", "Top_Selling", "Top_Rated", "Lowest_Price", "Highest_Price"].includes(data[1])) {
			currentSortMethod = data[1];
			while (document.getElementsByClassName("sortnav-item-selected").length) {
				document.getElementsByClassName("sortnav-item-selected")[0].classList.remove("sortnav-item-selected");
			}
			document.getElementsByClassName("sort-" + data[1])[0].classList.add("sortnav-item-selected");
			continue;
		}
		if (!Object.keys(filters).includes(data[0])) continue;
		let tempValues = data[1].includes(",") ? data[1].split(",") : [data[1]];
		for (let a = 0; a < tempValues.length; a++) {
			if (filters[data[0]].order.includes(tempValues[a])) {
				if (!newFilters[data[0]]) newFilters[data[0]] = [];
				newFilters[data[0]].push(tempValues[a]);
			}
		}
	}
	currentFilters = newFilters;
	updateFiltersHtml(newFilters);
}

function updateFiltersHtml(activeFilters) { // update filters html to reflect currently selected filters. called automatically after handleFilters()
	var idList = [];
	for (let i = 0; i < Object.keys(activeFilters).length; i++) {
		let filterName = Object.keys(activeFilters)[i];
		for (let a = 0; a < activeFilters[filterName].length; a++) {
			idList.push(`filter-property-${filterName}-${activeFilters[filterName][a]}`);
		}
	}
	for (let i = 0; i < document.getElementsByClassName("filter-option").length; i++) {
		document.getElementsByClassName("filter-option")[i].classList.remove("filter-option-selected");
	}
	for (let i = 0; i < idList.length; i++) {
		document.getElementsByClassName(idList[i])[0].classList.add("filter-option-selected");
	}
	try {
		reloadLibrary();
	} catch { }
}

function generateFilterHash(filters) { // takes filters object and returns hash string
	var hash = "";
	for (let i = 0; i < Object.keys(filters).length; i++) {
		let filter = Object.keys(filters)[i];
		if (hash != "") hash += "&";
		hash += filter + "=" + filters[filter].join(",");
	}
	return hash;
}

var filterClickTimeouts = {};

function setFilterOption(filter, option, enabled) { // allows for filter to be turned on or off
	if (Object.keys(filterClickTimeouts).includes(filter) && filterClickTimeouts[filter].includes(option)) return;
	if (enabled) {
		if (!Object.keys(currentFilters).includes(filter)) {
			currentFilters[filter] = [option];
		} else if (!currentFilters[filter].includes(option)) {
			currentFilters[filter].push(option);
		}
	} else if (Object.keys(currentFilters).includes(filter) && currentFilters[filter].includes(option)) {
		if (currentFilters[filter].length <= 1) {
			delete currentFilters[filter];
		} else {
			currentFilters[filter].splice(currentFilters[filter].indexOf(option), 1);
		}
	}
	if (!Object.keys(filterClickTimeouts).includes(filter)) filterClickTimeouts[filter] = [];
	filterClickTimeouts[filter].push(option);
	setTimeout(function() {
		let index = filterClickTimeouts[filter].indexOf(option);
		if (index < 0) return;
		filterClickTimeouts[filter].splice(index, 1);
		if (!filterClickTimeouts[filter].length) delete filterClickTimeouts[filter];
	}, 100);
	var generated = generateFilterHash(currentFilters);
	if (generated == "") {
		window.history.pushState(false, "Explore", window.location.pathname);
		handleFilters("#");
	} else {
		location.hash = "#" + generateFilterHash(currentFilters);
	}
}

function sortBy(list, property, reverse = false) {
	if (reverse) {
		list.sort((a, b) => (a[property] < b[property]) ? -1 : 1);
	} else {
		list.sort((a, b) => (a[property] < b[property]) ? 1 : -1);
	}
	return list;
}

function matchesQuery(list, query) {
	query = query.toLowerCase().trim();
	var out = [];
	for (let i = 0; i < list.length; i++) {
		console.log(list[i].name + " vs " + query);
		if (list[i].name.toLowerCase().includes(query) || list[i].publisher.toLowerCase().includes(query)) {
			console.log("matches query!");
			out.push(list[i]);
		} else {
			console.log("doesnt match query");
		}
	}
	return out;
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;
	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}

function getRandomGames(amount = 7) {
	return shuffle(JSON.parse(JSON.stringify(library))).splice(0, amount);
}

function getSlugs(list) {
	var out = [];
	for (let i = 0; i < list.length; i++) {
		out.push(list[i].slug);
	}
	return out;
}


function generateAddonHtml(product, addon) {
	return `<div class="library-addon">
	<a>
		<div class="library-addon-cover"
			style="background-image:url('./assets/addon-covers/${product}-${addon.slug}.jpg')"></div>
		<span class="library-addon-title">${addon.name}</span>
	</a>
	<span class="library-addon-price">${formatPrice(addon.price)}</span>
</div>`;
}




// populate navbar and footer
function populateNavbar() {
	document.getElementsByClassName("footer")[0].innerHTML = `<div class="footer-sections">
			<div class="footer-section">
				<h2>Browse</h2>
				<a href="./xbox-consoles.html">Xbox Consoles</a>
				<a href="./explore.html">Xbox Games</a>
				<a href="./game-pass.html">Xbox Game Pass</a>
				<a href="./xbox-accessories.html">Xbox Accessories</a>
			</div>
			<div class="footer-section">
				<h2>Resources</h2>
				<a>Xbox Support</a>
				<a>Feedback</a>
				<a>Community Standards</a>
				<a>Photosensitive Seizure Warning</a>
			</div>
			<div class="footer-section">
				<h2>Microsoft Store</h2>
				<a>Microsoft Account</a>
				<a>Microsoft Store Account</a>
				<a>Returns</a>
				<a>Orders Tracking</a>
			</div>
			<div class="footer-section">
				<h2>For Developers</h2>
				<a>Games</a>
				<a>ID@Xbox</a>
				<a>Windows</a>
				<a>Creators Program</a>
			</div>
		</div>

		<div class="footer-sections-bottom">
			<div class="footer-language">
				<img src="./assets/icons/globe-footer-icon.png" />
				<a>English (New Zealand)</a>
			</div>

			<div class="footer-section-small">
				<a>Contact Microsoft</a>
				<a>Privacy</a>
				<a>Terms of Use</a>
				<a>Trademarks</a>
				<a>Third Party Notices</a>
				<a>About Our Ads</a>
				<span>© Microsoft 2022</span>
			</div>
		</div>`;
	document.getElementsByClassName("navbar-container")[0].innerHTML = `<div class="navbar-center">
			<div class="flex">
				<div class="navbar-logo-container">
					<a href="//microsoft.com"><img src="./assets/icons/microsoft.png" /></a>
					<span class="navbar-logo-spacer"></span>
					<a href="./index.html"><img src="./assets/icons/xbox.png" /></a>
				</div>
				<div class="navbar-dropdowns-container">
					<span class="navbar-dropdowns-dropdown">
						<span class="navbar-link-text">Subscriptions</span>
						<div class="navbar-dropdown-container">
							<a href="./game-pass.html">Game Pass</a>
							<a href="./all-access.html">Xbox All Access</a>
						</div>
					</span>
					<span class="navbar-dropdowns-dropdown">
						<a href="./explore.html" class="navbar-link-text">Games</a>
						<div class="navbar-dropdown-container navbar-dropdown-rows"></div>
					</span>
					<span class="navbar-dropdowns-dropdown">
						<a href="./xbox-consoles.html" class="navbar-link-text">Hardware</a>
						<div class="navbar-dropdown-container">
							<a href="xbox-consoles.html">Consoles</a>
							<a href="xbox-accessories.html">Accessories</a>
						</div>
					</span>
					<a href="./explore.html">
						<span class="navbar-link-text">Software</span>
					</a>
					<a>
						<span class="navbar-link-text">Support</span>
					</a>
				</div>
			</div>
			<div class="navbar-icons-container">
				<a><img src="./assets/icons/account.png" /></a>
				<a><img src="./assets/icons/cart.png" /></a>
				<a><img src="./assets/icons/search.png" /></a>
				<a>
					<span class="navbar-link-text">All Microsoft</span>
				</a>
			</div>
		</div>`;


	var html = "";
	for (let i = 0; i < filters.genre.order.length; i++) {
		let id = filters.genre.order[i];
		html += `<a href="./explore.html#genre=${id}">${filters.genre.names[id]}</a>`
	}
	document.getElementsByClassName("navbar-dropdowns-dropdown")[1].getElementsByClassName("navbar-dropdown-container")[0].innerHTML = html;
}

populateNavbar();