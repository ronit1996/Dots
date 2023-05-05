/*
 * Looper for YouTube
 * Copyright (c) 2011-2022, AlvinHKH
 * https://alvinhkh.com
 * All rights reserved.
 */

// Check whether new version is installed
if (typeof chrome.runtime == "object") {
  const thisVersion = chrome.runtime.getManifest().version;
  if (
    localStorage["yt-loop-show-changelog"] == "true" &&
    localStorage["yt-loop-version"] &&
    localStorage["yt-loop-version"] != thisVersion.toString()
  ) {
    // check version number, if they are different, show changelog
    const changelog_url =
      "https://www.alvinhkh.com/looperforyoutube/changelog/updated";
    window.open(changelog_url, "changelogWindow");
  }
  // save current extension version
  localStorage["yt-loop-version"] = thisVersion;
}

const s = document.createElement("script");
s.src = chrome.runtime.getURL("contentscript.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

function getMessageFromChromeSync() {
  if (!chrome.storage) {
    console.info(
      "[LOOPER FOR YOUTUBE]",
      "BROWSER YOU ARE USING DO NOT SUPPORT CHROME.STORAGE API, OPTIONS IS NOT AVAILABLE IN THIS CASE"
    );
    window.postMessage(
      {
        type: "optionsMsg",
        auto: false,
        button: "all",
        key: true,
        panel: true,
        playersizeEnable: false,
        playersize: "normal",
        quality: "default",
        show_changelog: true,
        oldchrome: true,
      },
      "*"
    );
    return false;
  }
  chrome.storage.sync.get(null, function (value) {
    window.postMessage(
      {
        type: "optionsMsg",
        auto: value["ytAutoLoop"] ? value["ytAutoLoop"] : false,
        button: value["option_button"] ? value["option_button"] : "all",
        key: value["ytShortcut"]
          ? value["ytShortcut"] == "false"
            ? false
            : true
          : true,
        panel: value["ytLoopPanel"]
          ? value["ytLoopPanel"] == "false"
            ? false
            : true
          : true,
        playersizeEnable: value["ytPlayerSizeEnable"]
          ? value["ytPlayerSizeEnable"] == "true"
            ? true
            : false
          : false,
        playersize: value["ytPlayerSize"] ? value["ytPlayerSize"] : "normal",
        quality: value["ytQuality"] ? value["ytQuality"] : "default",
        show_changelog: value["option_show_changelog"]
          ? value["option_show_changelog"] == "false"
            ? false
            : true
          : true,
      },
      "*"
    );
  });
}

try {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key],
        option = { type: "optionsMsg" };
      switch (key) {
        case "ytAutoLoop":
          switch (storageChange.newValue) {
            case "true":
            case "false":
            case "saveState":
              option.auto = storageChange.newValue;
              break;
            default:
              option.auto = "false";
              break;
          }
          break;
        case "option_button":
          switch (storageChange.newValue) {
            case "all":
            case "icon":
            case "text":
              option.button = storageChange.newValue;
              break;
            default:
              option.button = "all";
              break;
          }
          break;
        case "ytShortcut":
          option.key = storageChange.newValue == "false" ? false : true;
          break;
        case "ytLoopPanel":
          option.panel = storageChange.newValue == "false" ? false : true;
          break;
        case "ytPlayerSizeEnable":
          option.playersizeEnable =
            storageChange.newValue == "true" ? true : false;
          break;
        case "ytPlayerSize":
          switch (storageChange.newValue) {
            case "fullsize":
            case "wide":
            case "normal":
              option.playersize = storageChange.newValue;
              break;
            default:
              option.playersize = "normal";
              break;
          }
          break;
        case "ytQuality":
          switch (storageChange.newValue) {
            case "default":
            case "highres":
            case "hd2880":
            case "hd2160":
            case "hd1440":
            case "hd1080":
            case "hd720":
            case "large":
            case "medium":
            case "small":
            case "tiny":
              option.quality = storageChange.newValue;
              break;
            default:
              option.quality = "default";
              break;
          }
          break;
        case "option_show_changelog":
          option.show_changelog =
            storageChange.newValue == "false" ? false : true;
          break;
      }
      window.postMessage(option, "*");
    }
  });
  getMessageFromChromeSync();
} catch (e) {}

let chromePage = "";
if (chrome.runtime) {
  chromePage = chrome.runtime.getURL("");
}
let chromeInIncognito = false;
if (chrome.extension) {
  chromeInIncognito = chrome.extension.inIncognitoContext;
}
sessionStorage['chromePage'] = chromePage;
sessionStorage['inIncognito'] = chromeInIncognito;
window.addEventListener(
  "message",
  function (e) {
    switch (e.data.type) {
      case "requestMessage":
        getMessageFromChromeSync();
        break;
      default:
        break;
    }
  },
  false
);
