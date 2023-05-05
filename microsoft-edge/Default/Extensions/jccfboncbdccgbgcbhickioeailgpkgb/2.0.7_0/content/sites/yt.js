function waitFor(selector, callback, timeout) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        if (timeout) {
            return window.setTimeout(() => {
                return window.requestAnimationFrame(() => {
                    waitFor(selector, callback);
                });
            }, timeout);
        }
        return window.requestAnimationFrame(() => {
            waitFor(selector, callback);
        });
    }
}

function headReady(callback) {
    if (document.readyState === "complete") {
        callback();
        return;
    }
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (
                m.addedNodes &&
                m.addedNodes[0] &&
                m.addedNodes[0].nodeName === "BODY"
            ) {
                callback();
                observer.disconnect();
            }
        });
    });
    observer.observe(document.documentElement, {childList: true});
}

function waitForProm(selector, parent) {
    return new Promise(resolve => {
        let item = parent.querySelector(selector)
        if (item) return resolve(item)

        const observer = new MutationObserver(mutations => {
            item = parent.querySelector(selector)
            if (item) {
                resolve(item)
                observer.disconnect()
            }
        })

        observer.observe(parent, {
            childList: true, subtree: true
        })
    })
}

class CosmeticFilter {
    constructor(enabled = false) {
        this.enabled = enabled;
        this._createStyleSheet();

    }

    _createStyleSheet() {
        // Create the <style> tag
        const style = document.createElement("style");

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Append stylesheet as early as possible
        headReady(() => {
            document.head.appendChild(style);
            this.sheet = style.sheet;
            if (this.enabled) {
                this.enable();
            }
        });
    }

    enable() {
        if (this.stylesActive) {
            return;
        }
        this.ruleId = this.sheet.insertRule(
            `
      ytd-promoted-video-renderer,
      ytd-display-ad-renderer,
      ytd-compact-promoted-video-renderer,
      ytd-promoted-sparkles-web-renderer,
      .ytd-carousel-ad-renderer,
      .ytd-promoted-sparkles-text-search-renderer,
      .ad-container,
      .ad-div,
      .masthead-ad-control,
      .video-ads,
      .ytp-ad-progress-list,
      #ad_creative_3,
      #footer-ads,
      #masthead-ad,
      #player-ads,
      .ytd-mealbar-promo-renderer,
      .sparkles-light-cta
      #watch-channel-brand-div,
      #watch7-sidebar-ads,
      .html5-video-player.ad-showing video {
        display: none !important;
      }
    `,
            0
        );
        this.stylesActive = true;
    }

    disable() {
        if (this.stylesActive) {
            this.sheet.deleteRule(this.ruleId);
            this.stylesActive = false;
        }
    }
}

function domReady(callback) {
    if (document.readyState === "complete") {
        callback();
    } else {
        window.addEventListener("load", callback, {
            once: true,
        });
    }
}

onPageDataReady(function () {
    let ogVolume = 1;
    let pbRate = 1;
    domReady(() => {
        var cssYTFilter = new CosmeticFilter(true);
        waitForProm('.html5-video-player', document.body).then(player => {

            if (document.querySelector('ytd-display-ad-renderer')) {
                document.querySelector('ytd-display-ad-renderer').closest('ytd-rich-item-renderer').style.display = 'none'
            }

            function check() {
                if (!player.classList.contains('ad-showing')) return

                const video = player.querySelector('video')
                if (!video) return

                const btn = player.querySelector(".ytp-ad-skip-button")
                if (btn) {
                    btn.click()
                } else {
                    video.currentTime = isNaN(video.duration) ? 0 : video.duration
                }
            }

            check()

            window.vObserver = new MutationObserver(check)
            window.vObserver.observe(player, {
                subtree: true, childList: true, attributeFilter: ['src']
            })
        })
    })
    setInterval(function () {
        var hiding_classes = [
            "style-scope ytd-watch-next-secondary-results-renderer sparkles-light-cta GoogleActiveViewElement",
            "style-scope ytd-item-section-renderer sparkles-light-cta",
            "ytp-ad-message-container"
        ]

        if (document.getElementsByClassName("video-stream html5-main-video")[0] !== undefined && 0) {
            let ad = document.getElementsByClassName("video-ads ytp-ad-module")[0];
            let vid = document.getElementsByClassName("video-stream html5-main-video")[0];
            if (ad === undefined) {
                pbRate = vid.playbackRate;
            }
            let closeAble = document.getElementsByClassName("ytp-ad-overlay-close-button");
            for (let i = 0; i < closeAble.length; i++) {
                closeAble[i].click();
            }

            hiding_classes.forEach(function (value, index, array) {
                if (document.getElementsByClassName(value)[0] !== undefined) {
                    let incomingAd = document.getElementsByClassName(value)[0];
                    incomingAd.style.display = "none";

                }
            })

            if (document.getElementsByClassName("ytp-ad-text ytp-ad-skip-button-text")[0] !== undefined) {
                let skipBtn = document.getElementsByClassName("ytp-ad-text ytp-ad-skip-button-text")[0];
                skipBtn.click();

            }

            if (document.getElementsByClassName("style-scope ytd-companion-slot-renderer")[0] !== undefined) {
                document.getElementsByClassName("style-scope ytd-companion-slot-renderer")[0].remove();

            }
            if (ad !== undefined) {
                if (ad.children.length > 0) {
                    if (document.getElementsByClassName("ytp-ad-text ytp-ad-preview-text")[0] !== undefined) {
                        vid.playbackRate = 16;

                    }
                }
            }
        }
    }, 200)
})
