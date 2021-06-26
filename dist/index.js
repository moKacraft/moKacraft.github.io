let map = new Map();
loadURL(retrieveURL(), onDataLoaded);
function retrieveURL() {
    let url = ['https://displayapi.herokuapp.com/?'];
    const urlParameters = retrieveParametersFormURL();
    let website = urlParameters.website;
    let websiteUrl = '';
    let topic = '';
    let topicUrl = '';
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
            let subreddit = urlParameters.subreddit;
            let sort = urlParameters.sort;
            let after = urlParameters.after;
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
    let websiteDiv = createDiv('webiste_title', 'display:flex;width:100vw;font-size:3vw;');
    let websiteTitle = createH1('website', '', '');
    websiteTitle.appendChild(createLink(websiteUrl, website, ''));
    let topicTitle = createH1('topic', '', '');
    topicTitle.appendChild(createLink(topicUrl, topic, ''));
    websiteDiv.appendChild(websiteTitle);
    websiteDiv.appendChild(createBulletSpan());
    websiteDiv.appendChild(topicTitle);
    document.body.appendChild(websiteDiv);
    return url.join('');
}
function createH1(id, textContent, cssText) {
    let title = document.createElement('h1');
    title.id = id;
    title.textContent = textContent;
    title.style.cssText = cssText;
    return title;
}
function loadURL(url, callBack) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onloadend = onLoadEnd(xhr, callBack);
    xhr.send();
}
function onLoadEnd(request, callBack) {
    return function () {
        let status = request.status;
        let result = String(request.response);
        if (status >= 200 && status < 300)
            callBack(result);
    };
}
function onDataLoaded(object) {
    object = JSON.parse(object);
    object = object.message;
    console.log(object);
    for (const article in object.children) {
        let infos = object.children[article];
        addArticle(infos);
        map.set(infos.name, JSON.stringify(infos));
    }
    let after = object.after;
    let url = object.loadMore;
    addButton('loadMore', 'Load more', 'height:10vh;width:100vw;font-size:3em;', function () { location.href = url; });
}
function addButton(id, textContent, cssText, callback) {
    let loadMore = document.createElement('button');
    loadMore.id = id;
    loadMore.textContent = textContent;
    loadMore.style.cssText = cssText;
    loadMore.onclick = callback;
    document.body.appendChild(loadMore);
}
function addArticle(infos) {
    let article = createDiv(infos.name, '');
    let titleBar = createDiv(infos.name + '_title', 'display:flex;width:100vw;');
    let titleLink = createLink(infos.topicLinkHref, infos.topicLinkTextContent, 'font-size:2em;overflow:hidden;max-width:36vw;');
    let websiteLink = createLink(infos.directLinkHref, infos.directLinkTextContent, 'font-size:2em;overflow:hidden;max-width:36vw;');
    let commentsLink = createLink(infos.commentLinkHref, infos.commentLinkTextContent, 'font-size:2em;max-width:28vw;');
    titleBar.appendChild(titleLink);
    titleBar.appendChild(createBulletSpan());
    titleBar.appendChild(websiteLink);
    titleBar.appendChild(createBulletSpan());
    titleBar.appendChild(commentsLink);
    article.appendChild(titleBar);
    let node = createDiv(infos.name + '_content', 'display:flex;border-bottom: 1px solid black;width:100vw;');
    let thumbnail = document.createElement('img');
    thumbnail.style.cssText = 'width:25vw;height:10vh;';
    thumbnail.src = infos.thumbnailSrc;
    // TODO ???
    // thumbnail.loading = 'lazy';
    let title = document.createElement('h2');
    title.style.cssText = 'width:75vw;';
    title.textContent = infos.title;
    node.appendChild(thumbnail);
    node.appendChild(title);
    article.appendChild(node);
    document.body.appendChild(article);
    document.getElementById(node.id).onclick = function () { addElement(this); };
}
function addElement(parentNode) {
    let bigId = parentNode.id + 'big';
    if (document.body.contains(document.getElementById(bigId))) {
        document.getElementById(bigId).remove();
    }
    else {
        let value = map.get(parentNode.id.replace('_content', ''));
        let infos = JSON.parse(value);
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
    let embed = createDiv(parentNode.id + 'big', 'width:100vw;');
    embed.appendChild(document.createRange().createContextualFragment(unescapeHtml(content)));
    embed.firstChild.parentElement.style.cssText = 'width:100vw;';
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
    let video = document.createElement('video');
    video.style.cssText = 'width:100vw;';
    video.controls = true;
    video.autoplay = true;
    video.id = parentNode.id + 'big';
    let src = document.createElement('source');
    src.src = source;
    src.type = 'video/mp4';
    video.appendChild(src);
    parentNode.parentNode.insertBefore(video, parentNode.nextSibling);
}
function addImage(url, parentNode) {
    let image = document.createElement('img');
    image.style.cssText = 'width:100vw;';
    image.src = url;
    image.id = parentNode.id + 'big';
    parentNode.parentNode.insertBefore(image, parentNode.nextSibling);
}
function createLink(href, textContent, cssText) {
    let link = document.createElement('a');
    link.href = href;
    link.textContent = textContent;
    link.style.cssText = cssText;
    return link;
}
function createBulletSpan() {
    let bullet = document.createElement('span');
    bullet.textContent = '•';
    bullet.style.cssText = 'font-size:2em;margin:1vw;';
    return bullet;
}
function createDiv(id, cssText) {
    let div = document.createElement('div');
    div.id = id;
    div.style.cssText = cssText;
    return div;
}
function retrieveParametersFormURL() {
    console.log("retrieveParametersFormURL");
    let vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (_m, key, value) {
        console.log(vars[key]);
        vars[key] = value;
        return "";
    });
    return vars;
}
//# sourceMappingURL=index.js.map