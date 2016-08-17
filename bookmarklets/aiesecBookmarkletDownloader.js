javascript: (function () {
    var server = "LinkToYourServer";
    var server = "//bookmarks.aiesec.de/";
    var jsCode = document.createElement('script');
    jsCode.setAttribute('src', server+"bookmarklets/aiesecBookmarklet.js');
    document.body.appendChild(jsCode);
}());