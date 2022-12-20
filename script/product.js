const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('p') || "";

window.onhashchange = () => { checkHash() };

function checkHash() {
	var hash = location.hash.slice(1);
	var game = getGameBySlug(slug);
	if (!game.platforms.includes(hash)) return;
	var index = game.platforms.indexOf(hash);
	changePlatform(index);
}

var topSlideshow;

function init() {
	var game = getGameBySlug(slug);
	document.title = game.name + " | Xbox";
	document.getElementsByClassName("page-product-title")[0].innerHTML = game.name;
	document.getElementsByClassName("page-product-price")[0].innerHTML = formatPrice(game.price);
	document.getElementsByClassName("page-product-sticky-get")[0].innerHTML = formatPrice(game.price);
	let html = "";
	for (let i = 0; i < game.platforms.length; i++) {
		html += `<button class="${i ? "" : "page-product-platform-selected"}" onClick="location.hash='#${game.platforms[i]}'"><span style="background-image:url('./assets/platforms/${game.platforms[i]}.png')"></span></button>`;
	}
	document.getElementsByClassName("page-product-platform-selector")[0].innerHTML = html;
	document.getElementsByClassName("page-product-platform-selector")[1].innerHTML = html;
	document.getElementsByClassName("page-product-sticky-tags")[0].innerHTML = tagsHtml(game.tags);
	document.getElementsByClassName("page-product-sticky-info")[0].getElementsByTagName("b")[0].innerHTML = game.developer || game.publisher;
	document.getElementsByClassName("page-product-sticky-info")[1].getElementsByTagName("b")[0].innerHTML = game.publisher;
	document.getElementsByClassName("page-product-sticky-info")[2].getElementsByTagName("b")[0].innerHTML = formatDate(game.date);
	document.getElementsByClassName("page-product-reviews-rating")[0].innerHTML = formatReview(game.rating);
	document.getElementsByClassName("page-product-reviews-count")[0].innerHTML = formatNumber(game.reviewCount || Math.ceil(game.sold / 50)) + " Reviews";
	html = `<span class="page-product-sticky-reviews">${formatReview(game.rating)}</span>`;
	for (let i = 0; i < 5; i++) {
		html += `<img class="page-product-sticky-star" src="./assets/icons/star-${Math.round(game.rating) >= i + 1 ? "full" : "empty"}.svg" />`;
	}
	html += `<span class="page-product-sticky-count">${formatNumber(game.reviewCount || Math.ceil(game.sold / 50))} Reviews</span>`;
	document.getElementsByClassName("page-product-sticky-reviews-container")[0].innerHTML = html;
	document.getElementsByClassName("page-product-maturity-rating")[0].getElementsByTagName("img")[0].src = "./assets/maturity-rating/" + game.maturityRating + ".png";
	topSlideshow = initializeCustomSlideshow();
	async function getOverview() {
		const response = await fetch(`./assets/descriptions/${slug}.md`);
		if (response.status != 200) return document.getElementsByClassName("page-product-overview")[0].innerHTML = marked.parse(`# ${game.name}\nThere is no information for this product.`);
		document.getElementsByClassName("page-product-overview")[0].innerHTML = marked.parse(await response.text());
	}
	getOverview();
	var addons = generateAddonsHtmlList(game);
	if (addons.length) {
		document.getElementsByClassName("page-product-extra-scroll")[0].innerHTML = addons;
	} else {
		document.getElementById("addons-container").style.display = "none";
	}
	checkHash();
}

window.onload = function() {
	setTimeout(function() {
		var game = getGameBySlug(slug);
		var games = applyLibraryFilters({"genre": game.tags});
		var out = [];
		for (let i = 0; i < games.length; i++) {
			if (games[i].slug != slug) out.push(games[i]);
		}
		document.getElementsByClassName("page-product-extra-scroll")[1].innerHTML = generateLibraryHtmlList(out);
	}, 1000);
}

function initializeCustomSlideshow() {
	var game = getGameBySlug(slug);
	var container = document.getElementsByClassName("page-product-slideshow")[0];
	var images = [
		"./assets/slideshow-images/" + slug + ".jpg",
		"./assets/game-trailers/" + game.coverVideo
	];
	console.log(game.slideshowImages);
	for (let i = 0; game.slideshowImages && i < game.slideshowImages.length; i++) {
		images.push("./assets/product-images/" + game.slideshowImages[i]);
	}
	var options = {
		imageContainer: container.getElementsByClassName("slideshow-image")[0],
		imageContainer2: container.getElementsByClassName("slideshow-image2")[0],
		images: images,
		titles: [],
		links: [],
		tags: [],
		buttonsElement: container.getElementsByClassName("slideshow-buttons-container")[0],
		delay: 5
	};
	var slideshow = initializeSlideshow("id", options);
	slideshow.start();
	return slideshow;
}

if (slug != "") init();

function changePlatform(id) {
	for (let i = 0; i < document.getElementsByClassName("page-product-platform-selected").length; i++) {
		try {
			document.getElementsByClassName("page-product-platform-selected")[i].classList.remove("page-product-platform-selected");
			i--;
		} catch { }
	}
	for (let i = 0; i < document.getElementsByClassName("page-product-platform-selector").length; i++) {
		document.getElementsByClassName("page-product-platform-selector")[i].getElementsByTagName("button")[id].classList.add("page-product-platform-selected");
	}
}

function scrollElement(element, right) {
	element.scrollBy({
		left: (element.clientWidth - 100) * (right ? 1 : -1),
		behavior: "smooth"
	});
}

function scrollToSection(id) {
	scrollTo({
		top: window.scrollY + document.getElementById(id).getBoundingClientRect().top - 100,
		behavior: "smooth"
	});
}

window.onscroll = function() {
	var list = [
		"position-reviews",
		"position-specs",
		"position-extras",
		"position-overview"
	];
	for (let i = 0; i < document.getElementsByClassName("sortnav-item-selected").length; i++) {
		try {
			document.getElementsByClassName("sortnav-item-selected")[i].classList.remove("sortnav-item-selected");
		} catch { }
	}
	for (let i = 0; i < list.length; i++) {
		if (document.getElementById(list[i]).getBoundingClientRect().top <= 200) {
			document.getElementsByClassName("scrollto-" + list[i])[0].classList.add("sortnav-item-selected");
			return;
		}
	}
}