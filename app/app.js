// Delete in production
//localStorage.removeItem('dict')
//localStorage.removeItem('meta')
//localStorage.removeItem('settings')
//localStorage.removeItem('user_data')

// Init localStorage to save configurations and settings
var dict = localStorage.getItem('dict');
var meta = localStorage.getItem('meta');
var settings = localStorage.getItem('settings');
var user_data = localStorage.getItem('user_data');

if (dict === null) {
    xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            dict = JSON.parse(xhr1.responseText);
            localStorage.setItem('dict', xhr1.responseText);
            if (document.getElementById("sign_count") !== null) {
                document.getElementById('sign_count').innerText = dict.dict.length;
            }
        }
    };
    xhr1.open('GET', '/app/data/dict-v2.json', true);
    xhr1.send();
} else {
    dict = JSON.parse(dict);
}

if (meta === null) {
    xhr2 = new XMLHttpRequest();
    xhr2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            meta = JSON.parse(xhr2.responseText);
            localStorage.setItem('meta', xhr2.responseText);
        }
    };
    xhr2.open('GET', '/app/data/meta.json', true);
    xhr2.send();
} else {
    meta = JSON.parse(meta);
}

if (settings === null) {
    xhr3 = new XMLHttpRequest();
    xhr3.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            settings = JSON.parse(xhr3.responseText);
            localStorage.setItem('settings', xhr3.responseText);
        }
    };
    xhr3.open('GET', '/app/data/settings.json', true);
    xhr3.send();
} else {
    settings = JSON.parse(settings);
}

if (user_data === null) {
    xhr4 = new XMLHttpRequest();
    xhr4.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            user_data = JSON.parse(xhr4.responseText);
            localStorage.setItem('user_data', xhr4.responseText);

            init()
            initPracticeStacks()
        }
    };
    xhr4.open('GET', '/app/data/user_data.json', true);
    xhr4.send();
} else {
    user_data = JSON.parse(user_data);
    init()
    initPracticeStacks()
}

// Only on the dict page
if (window.location.pathname == "/app/dict/") {
    // Show count of all words in dict
    if (document.getElementById("sign_count") !== null && dict !== null) {
        document.getElementById('sign_count').innerText = dict.dict.length;
    }

    // Setup search event for the dictonary
    if (document.getElementById('search') !== null) {
        document.getElementById('search').addEventListener("click", function (data) {
            word = document.getElementById("search_input").value
            window.location.hash = '#search=' + encodeURI(word);
            showSearchResult("search_result", word)
        });
    }

    // Enable URL Anchor #search=param to store the latest search and enable to share the query
    if (window.location.hash.match("#search=.*?")) {
        hash_query = window.location.hash.replace("#search=", "")
        showSearchResult("search_result", decodeURI(hash_query))
    }
}

// Setup practice mode can be removed if practicemode is integrated.
if (document.getElementById("btn-stack-0") !== null) {
    document.getElementById("btn-stack-0").addEventListener("click", function () {
        vs = getPracticeSet(0);
        showPracticeHTML(vs, 0)
    });
}

if(window.location.pathname == "/app/dict/category/"){
    document.getElementById("categories").innerHTML = createCategoriesHTML();
    addEventListenerPerCategory();
}

////////////////////////////////////
//                                //
//   Dictonary Search Functions   //
//                                //
////////////////////////////////////

function searchInDictForCategory(cat) {
    result = []
    for (var i = 0; i < dict.dict.length; i++) {
        for (var j = 0; j < dict.dict[i].category.length; j++) {
            if (dict.dict[i].category[j].toLowerCase() === cat.toLowerCase()) {
                result.push(dict.dict[i])
                break;
            }
        }
    }
    return result
}

function searchInDict(word, isExactMatch) {
    console.log("Search Word:", word)
    result = [];

    for (var i = 0; i < dict.dict.length; i++) {
        if (dict.dict[i].word.de.toLowerCase() === word.toLowerCase()) {
            result.push(dict.dict[i])
            break;
        }
    }
    if (!isExactMatch) {
        for (var i = 0; i < dict.dict.length; i++) {
            if (dict.dict[i].word.de.toLowerCase() === word.toLowerCase()) {
                continue;
            }
            if (dict.dict[i].word.de.toLowerCase().match(".*?" + word.toLowerCase() + ".*?") !== null) {
                result.push(dict.dict[i])
            }
        }
    }
    return result;
}

function searchResultHTML(word, obj) {
    console.log("Obj:", obj)
    html = "<p>Suche nach \"" + encodeHTMLEntities(word) + "\".</p><hr>"
    tmp = html;

    if (obj.length > 0) {
        categories = ""
        for (var k = 0; k < obj[0].category.length; k++) {
            categories += obj[0].category[k]
            if (k !== obj[0].category.length - 1) {
                categories += ", "
            }
        }

        html += `
            <h4>Bestes Ergebnis:</h4>
            <br>
            <div class="card text-center">
                <div class="card-header">
                    <h4 id="` + 0 + `">` + encodeHTMLEntities(obj[0].word.de) + `</h4>
                </div>
                <br>
                <div class="card-img-top embed-responsive embed-responsive-4by3">
                    <video class="embed-responsive-item" autoplay muted loop>
                        <source src="` + encodeURI(obj[0].video.dgs[0].url) + `" type="video/mp4">
                        Your browser does not support the video tag.
                    </video> 
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col">
                        <button class="btn btn-outline-info text-left" data-toggle="collapse" data-target="#info-` + 0 + `" aria-expanded="false" aria-controls="info-0"><i class="fab fa-creative-commons"></i></button>
                        </div>
                        <div class="col">
                            <button class="btn btn-outline-success text-right" id="add-` + 0 + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                        </div>
                    </div>
                    <div class="text-left collapse" id="info-0">
                        <br>
                        <b>Quelle:</b> ` + obj[0].video.dgs[0].source + `<br>
                        <b>Datum:</b> ` + obj[0].video.dgs[0].created + `<br>
                        <b>Kategorie:</b> ` + categories + `<br>
                        <b>Lizenz:</b> <a href="` + obj[0].video.dgs[0].license.url + `">` + obj[0].video.dgs[0].license.name + `</a><br>
                    </div>
                </div>
            </div>
            <br>
            <hr>
            `;
        for (var i = 1; i < obj.length; i++) {
            if (i == 1) {
                html += "<h4>Worte die den Suchbergiff enthalten:</h4><br>"
            }
            if (i == 5) {
                html += "<p> 5 von " + obj.length + " Ergebnissen angezeigt, bitte genauer suchen."
                break;
            }
            categories = ""
            for (var k = 0; k < obj[i].category.length; k++) {
                categories += obj[i].category[k]
                if (k !== obj[i].category.length - 1) {
                    categories += ", "
                }
            }

            html += `<div class="card text-center">
            <div class="card-header" data-toggle="collapse" data-target="#video-` + i + `" aria-expanded="false" aria-controls="video-` + i + `">
                <h4 id="` + i + `">` + encodeHTMLEntities(obj[i].word.de) + `</h4>
            </div>
            <div class="collapse" id="video-` + i + `">
            <div class="card-img-top embed-responsive embed-responsive-4by3">
                <video class="embed-responsive-item" autoplay muted loop>
                    <source src="` + encodeURI(obj[i].video.dgs[0].url) + `" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div> 
            <div class="card-body">
                <div class="row">
                    <div class="col">
                        <button class="btn btn-outline-info text-left" data-toggle="collapse" data-target="#info-` + i + `" aria-expanded="false" aria-controls="info-` + i + `"><i class="fab fa-creative-commons"></i></button>
                    </div>
                    <div class="col">
                        <button class="btn btn-outline-success text-right" id="add-` + i + `" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                    </div>
                </div>
                    <br>
                    <div class="collapse text-left" id="info-` + i + `">
                        <b>Quelle:</b> ` + obj[i].video.dgs[0].source + `<br>
                        <b>Datum:</b> ` + obj[i].video.dgs[0].created + `<br>
                        <b>Kategorie:</b> ` + categories + `<br>
                        <b>Lizenz:</b> <a href="` + obj[i].video.dgs[0].license.url + `">` + obj[i].video.dgs[0].license.name + `</a><br>
                    </div>
                </div>
            </div>
            </div>
            </div>
            <br>`;
        }
    }
    if (html === tmp) {
        html += "<p>Kein Ergebnis gefunden.</p>"
    }
    return html;
}

function initWordAddButtons(obj) {
    console.log("initWordAddButtons", obj);
    for (var i = 0; i < obj.length; i++) {
        toggleWordAddButton(document.getElementById("add-" + i), isWordInStack(obj[i].word.de))

        document.getElementById("add-" + i).addEventListener("click", function (event) {
            var element = this
            var entry = obj[this.id.replace("add-", "")]

            console.log(entry, this);
            if (element !== null) {
                if (element.getAttribute("aria-toggle") === "true") {
                    addToStack([entry], 0)
                    toggleWordAddButton(element, true)
                } else {
                    for (var i = 0; i < 6; i++) {
                        removeFromStack([entry], 0)
                    }
                    toggleWordAddButton(element, false)
                }
            }
        });
    }
}

function toggleWordAddButton(element, isToggeled) {
    console.log(element, isToggeled);
    if (element != null) {
        if (isToggeled) {
            element.className = "btn btn-success text-right"
            element.innerHTML = '<i class="fas fa-check"></i>'
            element.setAttribute("aria-toggle", "false")
        } else {
            element.className = "btn btn-outline-success text-right"
            element.innerHTML = '<i class="fas fa-folder-plus"></i>'
            element.setAttribute("aria-toggle", "true")
        }
    }
}

function showSearchResult(id, word) {
    element = document.getElementById(id);
    if(element !== null){
        obj = searchInDict(word, false)
        html = searchResultHTML(word, obj)
        element.innerHTML = html
        initWordAddButtons(obj)
    }
}

////////////////////////////////////
//                                //
//      Words per Category        //
//                                //
////////////////////////////////////


function searchByCategory(category) {
    console.log("Category:",category);
    result = []
    for (var i = 0; i < dict.dict.length; i++) {
        for (var j = 0; j < dict.dict[i].category.length; j++) {
            if (dict.dict[i].category[j].toLowerCase() === category.toLowerCase()) {
                result.push(dict.dict[i])
            }
        }
    }
    return result
}

function createWordsPerCategoryHTML(category){
    html = ""

    obj = searchByCategory(category)

    for(var i=0; i<obj.length; i++){
        html += '<li class="list-group-item"><a href="/app/dict/#search='+encodeURI(obj[i].word.de)+'">'+obj[i].word.de+'</a></li>'
    }

    return html
}

function createCategoriesHTML() {
    html = ""

    for(var i=0; i<meta.categories.length; i += 2){
        html += `
        <div class="row">`

        if(meta.categories[i] !== null){
            html += `
                <div class="col-md">
                    <div class="card text-center">
                        <div class="card card-header">
                            <div class="row">
                                <div class="col-9">
                                    <h5>`+meta.categories[i]+`</h5>
                                </div>
                                <div class="col-1">
                                    <button class="btn btn-outline-success text-right" id="add-`+i+`" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                                </div>
                            </div>
                            <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-`+i+`" aria-expanded="false" aria-controls="category-`+i+`"></i>
                        </div>
                        <ul class="list-group collapse" id="category-`+i+`" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">
                            `+createWordsPerCategoryHTML(meta.categories[i])+`
                        </ul>
                    </div>
                    <br>
                </div>`
        }
        if(meta.categories[i+1] !== null){
            html += `
                <div class="col-md">
                    <div class="card text-center">
                        <div class="card card-header">
                            <div class="row">
                                <div class="col-9">
                                    <h5>`+meta.categories[i+1]+`</h5>
                                </div>
                                <div class="col-1">
                                    <button class="btn btn-outline-success text-right" id="add-`+(i+1)+`" aria-toggle="true"><i class="fas fa-folder-plus"></i></button>
                                </div>
                            </div>
                            <i class="fas fa-chevron-down" data-toggle="collapse" data-target="#category-`+(i+1)+`" aria-expanded="false" aria-controls="category-`+(i+1)+`"></i>
                        </div>
                        <ul class="list-group collapse" id="category-`+(i+1)+`" style="max-height:200px;margin-bottom:10px;overflow:scroll;-webkit-overflow-scrolling: touch;">
                            `+createWordsPerCategoryHTML(meta.categories[i+1])+`
                        </ul>
                    </div>
                    <br>
                </div>`
        }

        html += `
        </div>`;
    }

    return html
}

function addCategoryToStack(category){
    obj = searchByCategory(category)
    addToStack(obj,0)
    user_data.categories.push(category)
    saveUserData();
}

function removeCategoryFromStack(category){
    obj = searchByCategory(category)
    removeFromStack(obj,0)
    user_data.categories.filter(function(obj){return obj !== category})
    saveUserData();
}

function isCategoryInUserData(category){
    for(var i=0; i<user_data.categories.length;i++){
        if(user_data.categories[i] == category){
            return true
        }
    } 
    return false
}

function addEventListenerPerCategory(){
    for(var i=0; i<meta.categories.length; i++){
        toggleWordAddButton(document.getElementById("add-"+i),isCategoryInUserData(meta.categories[i]))
        document.getElementById("add-"+i).addEventListener("click", function(event){
            var element = this
            var entry = this.id.replace("add-", "")

            console.log(entry, this);
            if (element !== null) {
                if (element.getAttribute("aria-toggle") === "true") {
                    addCategoryToStack(meta.categories[entry])
                    toggleWordAddButton(element, true)
                } else {
                    for (var i = 0; i < 6; i++) {
                        removeCategoryFromStack(meta.categories[entry])
                    }
                    toggleWordAddButton(element, false)
                }
            }
        });
    }
}

////////////////////////////////////
//                                //
//         Practice Mode          //
//                                //
////////////////////////////////////


function initPracticeStacks() {
    for (var i = 0; i <= 5; i++) {
        stack = document.getElementById("stack-" + i);
        stack_btn = document.getElementById("btn-stack-" + i)
        if (stack == null || stack_btn == null) {
            continue;
        }
        if (user_data.data[i] != undefined) {
            stack.innerText = user_data.data[i].length
            if (user_data.data[i].length == 0) {
                stack_btn.setAttribute("disabled", "")
                stack_btn.setAttribute("aria-disabled", "true")
                stack_btn.className = "btn btn-outline-secondary"
            }
        }
    }
}

/**
 * Evaluates if a word exists in one of the learning stacks
 * @param {string} word 
 */
function isWordInStack(word) {
    for (var i = 0; i < user_data.data.length; i++) {
        for (var j = 0; j < user_data.data[i].length; j++) {
            if (user_data.data[i][j].word.de == word) {
                return true
            }
        }
    }
    return false
}

/**
 * Add an array of dictonary words to the stack.
 * @param {Array} obj 
 * @param {Integer} num 
 */
function addToStack(obj, num) {
    if (num >= 0 && num < 6) {
        for (var i = 0; i < obj.length; i++) {
            console.log("addToStack[" + num + "]", obj[i]);
            user_data.data[num].push(obj[i])
            saveUserData()
        }
    }
}

/**
 * Remove an array of dictonary words from the stack.
 * @param {Array} obj 
 * @param {*} num 
 */
function removeFromStack(obj, num) {
    if (num >= 0 && num < 6) {
        for (var i = 0; i < obj.length; i++) {
            console.log("removeFromStack[" + num + "]", obj[i]);
            tmp = user_data.data[num].filter(function (item) {
                console.log(obj[i], item);
                return obj[i].word.de !== item.word.de
            })
            user_data.data[num] = tmp
            saveUserData()
        }
    }
}

function init() {
    if (user_data.data[0].length === 0) {
        addToStack(searchInDict('Vogel', true), 0);
        addToStack(searchInDict('Baum', true), 0);
        addToStack(searchInDict('Hund', true), 0);
        addToStack(searchInDict('Katze', true), 0);
        addToStack(searchInDict('Lampe', true), 0);
        addToStack(searchInDict('Papa', true), 0);
        addToStack(searchInDict('Mama', true), 0);
        addToStack(searchInDict('Oma', true), 0);
        addToStack(searchInDict('Opa', true), 0);
        addToStack(searchInDict('Ich', true), 0);
        addToStack(searchInDict('Du', true), 0);

        saveUserData()
    }
}

function getPracticeSet(num) {
    count = settings.number_of_words_per_session
    vocabulary_set = []

    for (var i = 0; i < count; i++) {
        if (user_data.data[num] !== undefined) {
            v = user_data.data[num].shift();
            console.log(i, v)
            vocabulary_set.push(v)
        }
    }

    saveUserData()

    return vocabulary_set;
}

function createPracticeHTML(vocabulary_set, i, isVideoCollapse) {
    categories = ""
    for (var k = 0; k < vocabulary_set[i].category.length; k++) {
        categories += vocabulary_set[i].category[k]
        if (k !== vocabulary_set[i].category.length - 1) {
            categories += ", "
        }
    }
    if(isVideoCollapse){
        html = `
    <div class="card text-center">
        <div class="card-header">
            <h4>ÜBEN</h4>
        </div>
        <div class="card-img-top embed-responsive embed-responsive-4by3 collapse" id="video-`+i+`">
            <video class="embed-responsive-item" autoplay muted loop>
                <source src="` + encodeURI(vocabulary_set[i].video.dgs[0].url) + `" type="video/mp4">
                Your browser does not support the video tag.
            </video>      
        </div>
        <div class="card-body">
        <div class="collapse text-left" id="info-` + 0 + `">
            <b>Quelle:</b> ` + vocabulary_set[i].video.dgs[0].source + `<br>
            <b>Datum:</b> ` + vocabulary_set[i].video.dgs[0].created + `<br>
            <b>Kategorie:</b> ` + categories + `<br>
            <b>Lizenz:</b> <a href="` + vocabulary_set[i].video.dgs[0].license.url + `">` + vocabulary_set[i].video.dgs[0].license.name + `</a><br><br>
        </div>
        <button class="btn btn-outline-info text-left" data-toggle="collapse" data-target="#info-` + i + `" aria-expanded="false" aria-controls="info-` + i + `"><i class="fab fa-creative-commons"></i></button>
        <button class="btn btn-info"  data-toggle="collapse" href="#video-`+i+`" role="button" aria-expanded="false" aria-controls="collapseExample">Lösung anzeigen</button>
        <div class="" id="word-`+i+`">
            <br>
            <h5 class="card-title" id="word">` + encodeHTMLEntities(vocabulary_set[i].word.de) + `</h5>
            <br>
            <div class="row collapse" id="video-`+i+`">
                <div class="col">
                    <a href="#true" class="btn btn-outline-success"><i class="fas fa-check"></i></a>
                </div>
                <div class="col">
                    <a href="#false"class="btn btn-outline-danger"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </div>
        </div>
        <div class="card-footer text-muted">
        ` + (i + 1) + `/` + vocabulary_set.length + `
        </div>
        </div>`;
    } else {
        html = `
    <div class="card text-center">
        <div class="card-header">
            <h4>ÜBEN</h4>
        </div>
        <div class="card-img-top embed-responsive embed-responsive-4by3" id="video-`+i+`">
            <video class="embed-responsive-item" autoplay muted loop>
                <source src="` + encodeURI(vocabulary_set[i].video.dgs[0].url) + `" type="video/mp4">
                Your browser does not support the video tag.
            </video>      
        </div>
        <div class="card-body">
        <div class="collapse text-left" id="info-` + i + `">
            <b>Quelle:</b> ` + vocabulary_set[i].video.dgs[0].source + `<br>
            <b>Datum:</b> ` + vocabulary_set[i].video.dgs[0].created + `<br>
            <b>Kategorie:</b> ` + categories + `<br>
            <b>Lizenz:</b> <a href="` + vocabulary_set[i].video.dgs[0].license.url + `">` + vocabulary_set[i].video.dgs[0].license.name + `</a><br><br>
        </div>
        <button class="btn btn-outline-info text-left" data-toggle="collapse" data-target="#info-` + i + `" aria-expanded="false" aria-controls="info-` + i + `"><i class="fab fa-creative-commons"></i></button>
        <button class="btn btn-info"  data-toggle="collapse" href="#word-`+i+`" role="button" aria-expanded="false" aria-controls="collapseExample">Lösung anzeigen</button>
        <div class="collapse" id="word-`+i+`">
            <br>
            <h5 class="card-title" id="word">` + encodeHTMLEntities(vocabulary_set[i].word.de) + `</h5>
            <br>
            <div class="row">
                <div class="col">
                    <a href="#true" class="btn btn-outline-success"><i class="fas fa-check"></i></a>
                </div>
                <div class="col">
                    <a href="#false"class="btn btn-outline-danger"><i class="fas fa-times"></i></a>
                </div>
            </div>
        </div>
        </div>
        <div class="card-footer text-muted">
        ` + (i + 1) + `/` + vocabulary_set.length + `
        </div>
        </div>`;
    }
    

    return html;
}

function showPracticeHTML(vs, num) {
    if (document.getElementById("practice") !== null) {
        document.getElementById("practice").innerHTML = createPracticeHTML(vs, num, true)
    }
}


////////////////////////////////////
//                                //
//        Useful Functions        //
//                                //
////////////////////////////////////


function encodeHTMLEntities(string) {
    console.log("String:", string)
    if (string !== undefined) {
        return string.replace(/./gm, function (s) {
            // return "&#" + s.charCodeAt(0) + ";";
            return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
        })
    }
    return "undefined";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveUserData() {
    localStorage.setItem("user_data", JSON.stringify(user_data))
}