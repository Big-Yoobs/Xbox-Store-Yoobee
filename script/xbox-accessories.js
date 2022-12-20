function init() {
	var out = {
		"headset": "",
		"controller": "",
		"storage": ""
	};
	function generateColorsHtml(colors) {
		if (!colors) return "";
		var out = "";
		for (let i = 0; i < colors.length; i++) {
			out += `<span style="background-color: ${colors[i]}"></span>`;
		}
		return out;
	}
	for (let i = 0; i < accessories_library.length; i++) {
		let item = accessories_library[i];
		out[item.type] += `<div class="accessory-product">
	<div class="accessory-product-image">
		<img src="./assets/accessories/products/${item.product_image}" />
	</div>
	<div class="accessory-product-name">
		<a>${item.name}</a>
	</div>
	<div class="accessory-product-colors">${generateColorsHtml(item.colors)}</div>
	<div class="accessory-product-price">
		<span>${formatPrice(item.price)}</span>
	</div>
</div>`;
	}
	for (let i = 0; i < Object.keys(out).length; i++) {
		let key = Object.keys(out)[i];
		console.log("position-" + key);
		document.getElementById("position-" + key).innerHTML = out[key];
	}
}

init();

function scrollToSection(id) {
	scrollTo({
		top: window.scrollY + document.getElementById(id).getBoundingClientRect().top - 250,
		behavior: "smooth"
	});
}

function handleScroll() {
	document.getElementsByClassName("accessory-banner-navbar")[0].style.backgroundColor = document.getElementsByClassName("accessory-banner-navbar")[0].getBoundingClientRect().top <= 0 ? "#151416" : "transparent";
	var list = [
		"position-storage",
		"position-controller",
		"position-headset"
	];
	for (let i = 0; i < document.getElementsByClassName("scrollnav-item-selected").length; i++) {
		try {
			document.getElementsByClassName("scrollnav-item-selected")[i].classList.remove("scrollnav-item-selected");
		} catch { }
	}
	for (let i = 0; i < list.length; i++) {
		if (document.getElementById(list[i]).getBoundingClientRect().top <= 400) {
			console.log("YES! " + list[i]);
			document.getElementById("scrollto-" + list[i].split("-")[1]).classList.add("scrollnav-item-selected");
			return;
		}
	}
}
window.onscroll = () => {handleScroll()};
handleScroll();