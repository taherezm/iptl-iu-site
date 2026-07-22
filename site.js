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

(function () {
  var emailLinks = document.querySelectorAll(".person .socials a[href^='mailto:']");

  if (!emailLinks.length) {
    return;
  }

  function fallbackCopy(address) {
    var input = document.createElement("textarea");
    input.value = address;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();

    try {
      if (!document.execCommand("copy")) {
        throw new Error("Copy command was unavailable.");
      }
    } finally {
      document.body.removeChild(input);
    }
  }

  function copyEmail(address) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(address).catch(function () {
        fallbackCopy(address);
      });
    }

    fallbackCopy(address);
    return Promise.resolve();
  }

  Array.prototype.forEach.call(emailLinks, function (link) {
    link.addEventListener("click", function () {
      var address = link.getAttribute("href").replace(/^mailto:/, "").split("?")[0];
      copyEmail(address).catch(function () {});
    });
  });
})();
