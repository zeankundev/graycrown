const remote = require('@electron/remote');
const startup = new Audio('../assets/startup.mp3');
const buttonClick = new Audio('../assets/button_click.mp3');
const tabSwitch = new Audio('../assets/button_up.mp3');
const app = remote.app;
const fs = require('fs');
const {setTimeout} = require('node:timers/promises')
const { platform } = require('node:process')
const Downloader = require('nodejs-file-downloader');
const notifier = require('node-notifier');
const download = require('download');
const { ipcRenderer } = require('electron');
const { url } = require('inspector');
const path = require('path');
const cssDir = fs.readdirSync(path.join(app.getPath('userData'), 'styles'))
const pluginDir = fs.readdirSync(path.join(app.getPath('userData', 'plugins')))
const { config } = require('process');
const commandExists = require('command-exists');
const close = document.getElementById('close');
const minimize = document.getElementById('minimize');
const maximize = document.getElementById('maximize');
const downloads = document.getElementById('downloads');
const titleText = document.getElementById('title-text')
const imageToggle = document.getElementById('img-toggle');
const userdata = app.getPath('userData');
const text = document.getElementById('text');
const notif = document.getElementById('notif')
const modal = document.getElementById('download-modal');
const downList = document.getElementById('download-list');
const closeModal = document.getElementById('close-modal');
const { spawn,execFile } = require('child_process');
// translation area
var heads = document.getElementsByTagName('h1')
const welcomeBack = document.getElementById('welcome-back');
const library = document.getElementById('library');
const store = document.getElementById('store');
const minesweeper = document.getElementById('minesweeper-tab')
const settings = document.getElementById('settings');
const wineSettings = document.getElementById('wine-settings');
const downloadsText = document.getElementById('downloads-text');
const noDownloads = document.getElementById('no-downloads');
// end of translation area
// fetch json of corresponding language
let lang;
let play;
let cus;
let downAndI;
let libText;
let language;
let authCode;
let method;
let stop;
let started = false;
const load = async () => {
    console.log('startup being played')
    startup.play();
    console.log('timing out....')
    await setTimeout(1000);
    started = true;
}
load();
const changeF = (font) => {
    var h1 = document.querySelectorAll('h1');
    for (var x = 0; x < h1.length; x++) {
        h1[x].style.fontFamily = font;
    }
}
function fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}
fetch(app.getPath('userData') + '/config.json')
.then(response => response.json())
.then(data => {
    recommendGames(data.config.custom)
    cus = data.config.custom;
    document.getElementById('css').href = data.config.styleURL
    document.getElementById('cus-json').value = data.config.custom
    console.log(`
        Variable Information:
        platform: ${platform}
        configDir: ${userdata}
        language: ${data.config.language}
        custom: ${data.config.custom}
        headFont: ${data.config.headFont}
    `)
    document.getElementById('lang').value = data.config.language;
    document.getElementById('cus-css').value = data.config.styleURL
    fetch(`../language/${data.config.language}.json`)
    .then((res) => res.json())
    .then(data => {
        document.getElementById('welcome-back').innerHTML = data.translations.welcomeBack
        document.getElementById('library-text').innerHTML = `${data.translations.library} <reg-head>(${userdata}/games.json)</reg-head>`;
        document.getElementById('store-text').innerHTML = data.translations.store
        document.getElementById('settings-text').innerHTML = data.translations.settings
        document.getElementById('wine-settings').innerHTML = data.translations.wineSettings
        document.getElementById('wine-cfg').innerHTML = data.translations.wineConfig
        document.getElementById('downloads-text').innerHTML = data.translations.downloads
        document.getElementById('no-downloads').innerHTML = data.translations.noDownloads
        document.getElementById('refresh-store').innerHTML = data.translations.refreshStore
        document.getElementById('to-library').innerHTML = data.translations.toLibrary
        document.getElementById('ref-internet').innerHTML = data.translations.refInternet
        document.getElementById('rec-for-u').innerHTML = data.translations.recForU
        document.getElementById('internet-discon').innerHTML = data.translations.internetDisconnected
        document.getElementById('l1').innerHTML = data.translations.discL1
        document.getElementById('l2').innerHTML = data.translations.discL2
        play = data.translations.play;
        stop = data.translations.stop;
        downAndI = data.translations.downloadAndInstall
        fetchStores();
        getGames();
    })
    .catch(e => {
        console.log(e);
    })
});
ipcRenderer.on('auth-code', (e, {auth, method}) => {
    console.log(`GOT CODE: ${auth}`);
    console.log(`GOT METHOD: ${method}`)
})
const configuration = require(app.getPath('userData') + '/config.json')
document.getElementById('lang').onchange = () => {
    configuration.config.language = document.getElementById('lang').value;
    fs.writeFile(app.getPath('userData') + '/config.json', JSON.stringify(configuration), function writeJSON(e) {
        if (e) return console.log(e);
        console.log(JSON.stringify(configuration));
        console.log('Writing config file of lang to:' + app.getPath('userData') + '/config.json')
        notifDisplay('In order for effects to take place, restart Graycrown', 'Restart required.')
    })
}
document.getElementById('cus-css').onchange = () => {
    configuration.config.styleURL = document.getElementById('cus-css').value;
    document.getElementById('cus-css').style.value = document.getElementById('cus-css').value;
    fs.writeFile(app.getPath('userData') + '/config.json', JSON.stringify(configuration), (e) => {
        if (e) return console.log(e);
        console.log(JSON.stringify(configuration))
        console.log('Writing config file of lang to:', configuration)
        notifDisplay('In order for effects to take place, restart Graycrown', 'Restart required.')
    })
}
async function notifDisplay(txt, title) {
    notif.style.display = 'block';
    text.innerHTML = txt;
    titleText.innerHTML = title
    await setTimeout(4000);
    notif.style.display = 'none';
}
var count = 0
function lol() {
    count = 0
    console.log('reset count to ' + count)
}

const getWin = () => remote.BrowserWindow.getFocusedWindow();
var logic = 0;
const closeWin = () => {
    getWin().close();
}
const minimizeWin = () => {
    getWin().minimize();
}
const maximizeWin = () => {
    const win = getWin();
    win.isMaximized() ? win.unmaximize() : win.maximize();
}
minimize.addEventListener('click', minimizeWin);
maximize.addEventListener('click', maximizeWin);
close.addEventListener('click', closeWin);
downloads.onclick = function() {
    modal.style.display = "block";
}
closeModal.onclick = function() {
    modal.style.display = "none";
}
// if it clicks anywhere out of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
document.getElementById('add').onclick = function() {
    document.getElementById('add-form').style.display = "block";
}
document.getElementById('close-modal-add').onclick = function() {
    document.getElementById('add-form').style.display = "none";
}
// if it clicks anywhere out of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById('add-form')) {
        document.getElementById('add-form').style.display = "none";
    }
}
document.getElementById('submit').onclick = () => {
        const configDir = app.getPath('userData');
        let jsonData = require(configDir + '/games.json');
        var obj = (jsonData);
        if (document.getElementById("id").value == "") {
            let id = "false";
            obj['games'].push({
                "name": document.getElementById('name').value,
                "icon": document.getElementById('icon').value,
                "exec": document.getElementById('exec').value,
                "enableWine": document.getElementById('is-wine').checked
              });
        } else {
              let id = document.getElementById("id").value;
              obj['games'].push({
                "id": document.getElementById('id').value,
                "name": document.getElementById('name').value,
                "icon": document.getElementById('icon').value,
                "exec": document.getElementById('exec').value,
                "enableWine": document.getElementById('is-wine').checked
              });
        }
            jsonStr = JSON.stringify(obj);
            console.log(jsonStr);
            fs.writeFile(configDir + '/games.json', jsonStr, (err) => { 
                if (err) { 
                 console.log(err); 
                }
            });
}
openMenu(event, 'home', false)
// check available games in the games.json file
    /* json schema:
    {
        "games": [
            {
                "name": "game name",
                "path": "path to game folder",
                "icon": "path to icon",
                "args": "arguments to pass to game",
            },
            ...
        ]
    }*/
    const exec = require('child_process').exec;
    /*function getGames() {
        fetch(app.getPath('userData') + '/games.json')
            .then(response => response.json())
            .then(data => {
                let gameList = document.getElementById("game-list");
                gameList.innerHTML = "";
                data.games.forEach(game => {
                    let gameDisplay = document.createElement("div");
                    gameDisplay.className = "game-display";
                    if (game.icon == "" || game.icon == undefined) {
                        game.icon = "../assets/logo_1024.png";
                    }
                    gameDisplay.innerHTML = `
                        <img style="width: 48px !important; height:48px !important; border-radius: 15px;" src="${game.icon}">
                        <div class="game-title">${game.name}</div>
                    `;
                    let gameButton = document.createElement("button");
                    gameButton.className = "play";
                    gameButton.innerHTML = "Play";
                    gameButton.onclick = function() {
                        // downgraded to electron v4, now we can require child_process.
                        const { spawn } = require('child_process');
                        const process = spawn(game.exec, game.args);
                        process.on('error', (err) => {
                            notifDisplay(err, 'Failed to launch');
                            notifier.notify({
                                title: 'Failed to launch',
                                message: err
                            })
                        });
                    }
                    gameDisplay.appendChild(gameButton);
                    gameList.appendChild(gameDisplay);
                });
            });
        }*/
        var proc;
            function getGames() {
                fetch(app.getPath('userData') + '/games.json')
                    .then(response => response.json())
                    .then(data => {
                        let gameList = document.getElementById("game-list-alt");
                        gameList.innerHTML = "";
                        data.games.forEach(game => {
                            let gameDisplay = document.createElement("div");
                            //if game.icon is empty, use default icon
                            if (game.icon == "" || game.icon == undefined) {
                                game.icon = "../assets/logo_1024.png";
                            }
                            console.log(`Metadata of game:\n name: ${game.name}\n icon: ${game.icon}\n enableWine: ${game.enableWine}\n exec: ${game.exec}\n args: ${game.args}`)
                            gameDisplay.className = "game-display";
                            gameDisplay.innerHTML = `
                                <img style="width: 48px !important; height:48px !important; border-radius:15px;" src="${game.icon}">
                                <div class="game-title">${game.name.slice(0, 15) + (game.name.length > 15 ? '...' : '')}</div>
                            `;
                            gameDisplay.style.backgroundImage = `url(${game.icon})`;
                            let secElapsed = document.createElement("p")
                            secElapsed.style.display = 'none';
                            let seconds = 0
                            let gameButton = document.createElement("button");
                            gameButton.className = "play";
                            gameButton.innerHTML = `<span>${play}</span>`;
                            gameButton.onclick = function() {
                                buttonClick.play();
                                if (gameButton.className == "play") {
                                    seconds = 0;
                                    secElapsed.style.display = 'block';
                                    const timer = setInterval(function() {
                                        seconds++
                                        secElapsed.innerHTML = `${fmtMSS(seconds)} elapsed. <br>`
                                        if (seconds > 59) notifDisplay('You have exceeded the maximum time of 1 minute.', 'Please take a rest')
                                    }, 1000)
                                    if (game.enableWine != true) {
                                        proc = execFile(game.exec, game.args);
                                        gameButton.className = "stop";
                                        gameButton.innerHTML = stop;
                                        proc.on('error', (err) => {
                                            console.log(err)
                                            clearInterval(timer)
                                            notifDisplay(err, 'Failed to launch!')
                                            gameButton.className = "play";
                                            gameButton.innerHTML = play;
                                        });
                                        proc.on('exit', () => {
                                            clearInterval(timer)
                                            gameButton.className = "play";
                                            gameButton.innerHTML = play;
                                        })
                                    } else {
                                        if (platform == 'win32') notifDisplay('Wine is only available for Mac or Linux', 'Your OS is unsupported');
                                        else {
                                            var cmdExist = require('command-exists');
                                            if (cmdExist('wine')) {
                                                proc = spawn('wine', [game.exec]);
                                                gameButton.className = "stop";
                                                gameButton.innerHTML = stop;
                                                proc.on('error', (err) => {
                                                    console.log(err)
                                                    clearInterval(timer)
                                                    notifDisplay(err, 'Failed to launch!')
                                                    gameButton.className = "play";
                                                    gameButton.innerHTML = play;
                                                });
                                                proc.on('exit', () => {
                                                    clearInterval(timer)
                                                    gameButton.className = "play";
                                                    gameButton.innerHTML = play;
                                                })
                                            } else {
                                                notifDisplay('Wine cannot be searched. Close Graycrown, install wine, then try again.', 'Unsupported!')
                                            }
                                        }
                                    }
                                } else {
                                    const { spawn } = require('child_process');
                                    console.log("KILLING PROCESS")
                                    try {
                                        proc.kill();
                                    }
                                    catch (e) {
                                        console.log(e);
                                        notifDisplay('Failed to kill process. Try again.', 'Cannot end process')
                                    }
                                }
                            }
                            gameDisplay.appendChild(secElapsed)
                            gameDisplay.appendChild(gameButton);
                            gameList.appendChild(gameDisplay);
                        });
                    })
                    .catch((e) => {
                        throw new Error("GRAYCROWN_JSON_DAEMON: Hey! You can't do that! You are deleting the core of Graycrown! Reinstall Graycrown to fix this problem, or restart Graycrown.");
                        notifDisplay("You are deleting the core data of Graycrown! Reinstall or restart the entire app to fully fix this problem.", "That's illegal!")
                    })
            }
    getGames();
    // check any changes on app.getPath('userData' + /games.json)
    // if changes, getGames()
    fs.watch(app.getPath('userData') + '/games.json', (event, filename) => {
        getGames();
    });
    function openMenu(e, menu, ) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            console.log("OK: tabcontent[i].style.display = \"none\"");
        }
        tablinks = document.getElementsByClassName("tab");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
            console.log("OK: tablinks[i].className = tablinks[i].className.replace(\" active\", \"\")");
        }
        document.getElementById(menu).style.display = "block";
        document.getElementsByClassName("container")[0].style.display = "block";
        document.getElementById(menu + '-tab').className = "tab active";
        console.log("OK: e.currentTarget.className += \" active\"");
        if (started == true) {
            tabSwitch.play();
        }
    }
    document.getElementById('cus-json').onchange = () => {
            configuration.config.custom = document.getElementById('cus-json').value;
            fs.writeFile(app.getPath('userData') + '/config.json', JSON.stringify(configuration), function writeJSON(e) {
                if (e) return console.log(e);
                console.log(JSON.stringify(configuration));
                console.log('Writing config file of custom to:' + app.getPath('userData') + '/config.json')
                notifDisplay('In order for effects to take place, restart Graycrown', 'Restart required.')
            })
        }
    cssDir.forEach(style => {
        console.warn('the folder contains: ' + style)
        let cssOption = document.createElement('option');
        cssOption.value = path.join(app.getPath('userData'), 'styles', style);
        console.log(cssOption.value)
        cssOption.innerText = style;
        document.getElementById('cus-css').appendChild(cssOption)
    });
    function recommendGames() {
        fetch(userdata + '/config.json')
        .then(response => response.json())
        .then(data => {
            fetch(data.config.custom)
            .then(res => res.json())
            .then(data => {
                let rec = document.getElementById('recommend-list');
                rec.innerHTML = '';
                data.items.forEach(items => {
                    let recommendDisplay = document.createElement('div');
                    recommendDisplay.className = 'recommend-display';
                    recommendDisplay.setAttribute('style', `background: url('${items.banner}') no-repeat; background-size: cover;`)
                    recommendDisplay.title = items.info;
                    recommendDisplay.innerHTML = `
                        <img style="width: 48px !important; height:48px !important; border-radius:15px;" src="${items.banner}">
                        <div class="store-title">${items.name.slice(0, 16) + (items.name.length > 16 ? '...' : '')}</div>
                    `;
                    let startBtn = document.createElement("button");
                    startBtn.className = "download";
                    startBtn.innerHTML = play;
                    startBtn.onclick = function() {
                        buttonClick.play();
                        if (items.link !== '') spw(items.name, items.banner, items.info, items.developer, items.feed, items.link)
                        else notifDisplay('Error 407: Missing link argument in JSON file', 'Failed to launch!') 
                    }
                    recommendDisplay.appendChild(startBtn)
                    rec.appendChild(recommendDisplay)
                })
            }).catch(function(e){
                console.log(e);
                document.getElementById('e').style.display = 'block';
            })
        })
    }
    function fetchStores() {
        fetch('https://zeankundev.github.io/cdn/Store.json')
            .then(response => response.json())
            .then(data => {
                let storeList = document.getElementById("store-list");
                storeList.innerHTML = '';
                data.store.forEach(store => {
                    let storeDisplay = document.createElement("div");
                    storeDisplay.className = "store-display";
                    storeDisplay.innerHTML = `
                        <div class="store-title">${store.name}</div>
                        <div class="store-description">${store.summary.slice(0, 25) + (store.summary.length > 25 ? '...' : '')}</div>
                    `;
                    let downButton = document.createElement("button");
                    downButton.className = "download";
                    downButton.innerHTML = `<span>${downAndI}</span>`;
                    if (!fs.existsSync(path.join(app.getPath('userData'), '/downloads'))) {
                        fs.mkdirSync(path.join(app.getPath('userData'), '/downloads'));
                    }
                    downButton.onclick = function() {
                        buttonClick.play();
                        const configDir = app.getPath('userData');
                        let jsonData = require(configDir + '/games.json');
                        var obj = (jsonData);
                        let wine = false;
                        if (process.platform == 'win32') wine = false;
                        else wine = true;
                        obj['games'].push({
                            "name": store.name,
                            "icon": "",
                            "exec": configDir + '/downloads/' + store.id,
                            "enableWine": wine
                        });
                        jsonStr = JSON.stringify(obj);
                        const gameListDir = configDir + "/games.json";
                        console.log(jsonStr)
                        fs.writeFile(gameListDir, jsonStr, (err) => { if (err) { console.log(err); }});
                        
                        downList.innerHTML = "";
                        let downStatus = document.createElement('div')
                        downStatus.innerHTML = `
                            <hr>
                            <h2>${store.name}</h2>
                        `;
                        let downProgress = document.createElement('p');
                        let bar = document.createElement('progress');
                        bar.setAttribute('min', '0')
                        bar.setAttribute('max', '100')
                        bar.value = 0;
                        downProgress.innerHTML = "Waiting for download to start...";
                        fetch(store.download)
                            .then(async () => {
                                const down = new Downloader({
                                    url: store.download,
                                    directory: path.join(app.getPath('userData'), '/downloads'),
                                    cloneFiles: false,
                                    fileName: store.id,
                                    onProgress: function (percent, chunk, remain) {
                                        downProgress.innerHTML = `<span>Now downloading ${store.name}.</span>&nbsp;${percent}% | Bytes left: ${remain}`;
                                        bar.value = percent;
                                    }
                                });
                                try {
                                    await down.download();
                                    notifDisplay(`Finished downloading ${store.name}`, 'Success');
                                } catch (e) {
                                    notifDisplay(e, 'Error. Cannot download');
                                }
                            });
                            downStatus.appendChild(bar)
                            downStatus.appendChild(downProgress);
                            downList.appendChild(downStatus);
                    }
                    storeDisplay.appendChild(downButton);
                    storeList.appendChild(storeDisplay);
                });
            }).catch((e) => {
                notifDisplay('Cannot fetch store JSON file. Maybe the server is down or check your internet connection', e)
            })
    }
function spawnWine(processType) {
    const spawn = require('child_process').spawn;
    try {
    	spawn('wine' + processType);
    } catch (e) {
    	notifDisplay(e, 'Cannot launch Wine process')}
    // console.log the child_process output
    spawn.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
}
