
const routes =
{
	"/": "<h2>Accueil</h2><p>Bienvenue sur ta mini SPA !</p>",
	"/tournois": "<h2>Tournois</h2><p>Liste des tournois à venir...</p>",
	"/jeu": "<h2>Jeu</h2><p>Lance une partie et teste ta gateway !</p>",
};

function navigateTo(url)
{
	history.pushState(null, null, url);
	render();
}

function render()
{
	const path = window.location.pathname;
	const content = routes[path] || "<h2>404</h2><p>Page introuvable.</p>";
	document.querySelector("#app").innerHTML = content;
}

document.addEventListener("click", (e) =>
{
	if (e.target.matches("[data-link]"))
	{
		e.preventDefault();
		navigateTo(e.target.href);
	}
});

window.addEventListener("popstate", render);

document.addEventListener("DOMContentLoaded", render);
