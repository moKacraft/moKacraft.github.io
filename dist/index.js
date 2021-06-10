var map = new Map();
loadURL(retrieveURL(), onDataLoaded);
function retrieveURL() {
    var url = ['https://displayapi.herokuapp.com/?'];
    var website = retrieveParametersFormURL().website;
    var websiteUrl = '';
    var topic = '';
    var topicUrl = '';
    // Replace with array of string then join
    url.push('website=');
    url.push(website);
    // url += 'website=' + website;
    switch (website) {
        case undefined:
            break;
        case "4chan":
            break;
        case "reddit":
            var subreddit = retrieveParametersFormURL().subreddit;
            var sort = retrieveParametersFormURL().sort;
            var after = retrieveParametersFormURL().after;
            // Replace with array of string then join
            url.push('&subreddit=');
            url.push(subreddit);
            url.push('&sort=');
            url.push(sort);
            // url += '&subreddit=' + subreddit + '&sort=' + sort;
            if (after === undefined) {
            }
            else {
                // Replace with array of string then join
                url.push('&after=');
                url.push(after);
                // url += '&after=' + after;
            }
            website = 'Reddit';
            websiteUrl = './display.html?website=reddit&subreddit=all&sort=hot';
            topic = 'r/' + subreddit;
            topicUrl = './display.html?website=reddit&subreddit=' + subreddit + '&sort=' + sort;
            break;
        default:
            break;
    }
    var websiteDiv = createDiv('webiste_title', 'display:flex;width:100vw;font-size:3vw;');
    var websiteTitle = createH1('website', '', '');
    websiteTitle.appendChild(createLink(websiteUrl, website, ''));
    var topicTitle = createH1('topic', '', '');
    topicTitle.appendChild(createLink(topicUrl, topic, ''));
    websiteDiv.appendChild(websiteTitle);
    websiteDiv.appendChild(createBulletSpan());
    websiteDiv.appendChild(topicTitle);
    document.body.appendChild(websiteDiv);
    return url.join('');
}
function createH1(id, textContent, cssText) {
    var title = document.createElement('h1');
    title.id = id;
    title.textContent = textContent;
    title.style.cssText = cssText;
    return title;
}
function loadURL(url, callBack) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onloadend = onLoadEnd(xhr, callBack);
    xhr.send();
}
function onLoadEnd(request, callBack) {
    return function () {
        var status = request.status;
        var result = String(request.response);
        if (status >= 200 && status < 300)
            callBack(result);
    };
}
function onDataLoaded(object) {
    object = JSON.parse(object);
    object = object.message;
    console.log(object);
    for (article in object.children) {
        var infos = object.children[article];
        addArticle(infos);
        map.set(infos.name, JSON.stringify(infos));
    }
    var after = object.after;
    var url = object.loadMore;
    addButton('loadMore', 'Load more', 'height:10vh;width:100vw;font-size:3em;', function () { location.href = url; });
}
function addButton(id, textContent, cssText, callback) {
    var loadMore = document.createElement('button');
    loadMore.id = id;
    loadMore.textContent = textContent;
    loadMore.style.cssText = cssText;
    loadMore.onclick = callback;
    document.body.appendChild(loadMore);
}
function addArticle(infos) {
    var article = createDiv(infos.name, '');
    var titleBar = createDiv(infos.name + '_title', 'display:flex;width:100vw;');
    var titleLink = createLink(infos.topicLinkHref, infos.topicLinkTextContent, 'font-size:2em;overflow:hidden;max-width:36vw;');
    var websiteLink = createLink(infos.directLinkHref, infos.directLinkTextContent, 'font-size:2em;overflow:hidden;max-width:36vw;');
    var commentsLink = createLink(infos.commentLinkHref, infos.commentLinkTextContent, 'font-size:2em;max-width:28vw;');
    titleBar.appendChild(titleLink);
    titleBar.appendChild(createBulletSpan());
    titleBar.appendChild(websiteLink);
    titleBar.appendChild(createBulletSpan());
    titleBar.appendChild(commentsLink);
    article.appendChild(titleBar);
    var node = createDiv(infos.name + '_content', 'display:flex;border-bottom: 1px solid black;width:100vw;');
    var thumbnail = document.createElement('img');
    thumbnail.style.cssText = 'width:25vw;height:10vh;';
    thumbnail.src = infos.thumbnailSrc;
    // TODO ???
    thumbnail.loading = 'lazy';
    var title = document.createElement('h2');
    title.style.cssText = 'width:75vw;';
    title.textContent = infos.title;
    node.appendChild(thumbnail);
    node.appendChild(title);
    article.appendChild(node);
    document.body.appendChild(article);
    document.getElementById(node.id).onclick = function () { addElement(this); };
}
function addElement(parentNode) {
    var bigId = parentNode.id + 'big';
    if (document.body.contains(document.getElementById(bigId))) {
        document.getElementById(bigId).remove();
    }
    else {
        var value = map.get(parentNode.id.replace('_content', ''));
        var infos = JSON.parse(value);
        if (infos.element.isImage) {
            addImage(infos.element.href, parentNode);
        }
        else if (infos.element.isVideo) {
            addVideo(infos.element.href, parentNode);
        }
        else if (infos.element.isEmbed) {
            addEmbedElement(infos.element.href, parentNode);
        }
    }
}
function addEmbedElement(content, parentNode) {
    var embed = createDiv(parentNode.id + 'big', 'width:100vw;');
    embed.appendChild(document.createRange().createContextualFragment(unescapeHtml(content)));
    embed.firstChild.style.cssText = 'width:100vw;';
    parentNode.parentNode.insertBefore(embed, parentNode.nextSibling);
}
function unescapeHtml(unsafe) {
    return unsafe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'");
}
function addVideo(source, parentNode) {
    var video = document.createElement('video');
    video.style.cssText = 'width:100vw;';
    video.controls = true;
    video.autoplay = true;
    video.id = parentNode.id + 'big';
    var src = document.createElement('source');
    src.src = source;
    src.type = 'video/mp4';
    video.appendChild(src);
    parentNode.parentNode.insertBefore(video, parentNode.nextSibling);
}
function addImage(url, parentNode) {
    var image = document.createElement('img');
    image.style.cssText = 'width:100vw;';
    image.src = url;
    image.id = parentNode.id + 'big';
    parentNode.parentNode.insertBefore(image, parentNode.nextSibling);
}
function createLink(href, textContent, cssText) {
    var link = document.createElement('a');
    link.href = href;
    link.textContent = textContent;
    link.style.cssText = cssText;
    return link;
}
function createBulletSpan() {
    var bullet = document.createElement('span');
    bullet.textContent = '•';
    bullet.style.cssText = 'font-size:2em;margin:1vw;';
    return bullet;
}
function createDiv(id, cssText) {
    var div = document.createElement('div');
    div.id = id;
    div.style.cssText = cssText;
    return div;
}
function retrieveParametersFormURL() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
//# sourceMappingURL=index.js.map