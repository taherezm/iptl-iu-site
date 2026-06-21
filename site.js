(function () {
  var path = window.location.pathname;
  var cleanPath = path;

  if (path === "/index.html") {
    cleanPath = "/";
  } else if (path.endsWith("/index.html")) {
    cleanPath = path.slice(0, -"index.html".length);
  } else if (path.endsWith(".html")) {
    cleanPath = path.slice(0, -".html".length);
  }

  if (cleanPath === "/blog" || cleanPath === "/blog/") {
    cleanPath = "/research";
  } else if (cleanPath.startsWith("/blog/")) {
    cleanPath = "/research/" + cleanPath.slice("/blog/".length);
  }

  if (cleanPath !== path) {
    window.location.replace(cleanPath + window.location.search + window.location.hash);
  }
})();
