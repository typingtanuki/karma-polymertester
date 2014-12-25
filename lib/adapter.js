(function (karma) {
    function setupTester(karma, resolution) {
        "use strict";

        if (!window.console.prefix) {
            window.console._log = window.console.log;
            window.console._warn = window.console.warn;
            window.console._error = window.console.error;
            window.console.prefix = function (prefix) {
                this._prefix = prefix;
            };
            window.console.log = function () {
                if (this._prefix !== undefined) {
                    arguments[0] = this._prefix + arguments[0];
                }
                this._log.apply(this, arguments);
            };
            window.console.warn = function () {
                if (this._prefix !== undefined) {
                    arguments[0] = this._prefix + arguments[0];
                }
                this._warn.apply(this, arguments);
            };
            window.console.error = function () {
                if (this._prefix !== undefined) {
                    arguments[0] = this._prefix + arguments[0];
                }
                this._error.apply(this, arguments);
            };
        }

        var tester = {
            config: karma.config.polymerTester || {},
            currentResolution: resolution
        };

        if (!tester.config.hasOwnProperty("resolutions") || tester.config.resolutions.length == 0) {
            tester.config.resolutions = [
                [1280, 800, "Notebook"],
                [1440, 900, "Notebook hiDPI"],
                [1024, 768, "iPad - Horizontal"],
                [768, 1024, "iPad - Vertical"],
                [1680, 765, "Desktop"],
                [765, 1680, "Desktop vertical"]
            ];
        }

        tester.frame = tester.frame || null;

        tester._document = function () {
            var raw_document = this.frame.contentDocument;
            if (raw_document === undefined && this.frame.contentWindow != undefined) {
                raw_document = this.frame.contentWindow.document;
                if (raw_document.documentElement !== undefined) {
                    return raw_document.documentElement;
                }
            }
            if (raw_document === undefined) {
                console.warn("Could not get document from frame");
            }
            return raw_document;
        };
        tester.body = function () {
            var iframeDocument = this._document();
            if (iframeDocument === undefined) {
                return undefined;
            }
            return iframeDocument.body || iframeDocument.getElementsByTagName("body")[0];
        };
        tester.document = function () {
            var body = this.body();
            if (body === null || body === undefined) {
                return this._document();
            }
            return body.ownerDocument;
        };
        tester.window = function () {
            return this.document().defaultView;
        };
        tester.getElementsByClassName = function (list, className) {
            var out = [];
            list = this.makeArray(list);
            for (var i = 0; i < list.length; i++) {
                if (list[i].classList.contains(className)) {
                    out.push(list[i]);
                }
            }
            return out;
        };
        tester.makeArray = function (notArray) {
            if (notArray == null || notArray == undefined) {
                return notArray;
            }

            var arr = [];

            for (var i = 0; i < notArray.length; i++) {
                if (notArray.item) {
                    arr.push(notArray.item(i));
                } else {
                    arr.push(notArray[i]);
                }
            }
            return arr;
        };
        tester.info = function () {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var desktop = true;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In PhantomJS, the true version is after "PhantomJS"
            if ((verOffset = nAgt.indexOf("PhantomJS")) != -1) {
                browserName = "Chrome";
                desktop = false;
                fullVersion = nAgt.substring(verOffset);
            }
            // In Opera, the true version is after "Opera" or after "Version"
            else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
                browserName = "Opera";
                fullVersion = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf("Version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            // In MSIE, the true version is after "MSIE" in userAgent
            else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
                browserName = "Internet Explorer";
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after "Chrome"
            else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
                browserName = "Chrome";
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after "Safari" or after "Version"
            else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
                browserName = "Safari";
                fullVersion = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf("Version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            // In Firefox, the true version is after "Firefox"
            else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
                browserName = "Firefox";
                fullVersion = nAgt.substring(verOffset + 8);
            }
            else if ((verOffset = nAgt.indexOf("SlimerJS")) != -1) {
                browserName = "Firefox";
                desktop = false;
                fullVersion = nAgt.substring(verOffset + 8);
            }
            // In most other browsers, "name/version" is at the end of userAgent
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browserName = nAgt.substring(nameOffset, verOffset);
                fullVersion = nAgt.substring(verOffset + 1);
                if (browserName.toLowerCase() == browserName.toUpperCase()) {
                    browserName = navigator.appName;
                }
            }
            // trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(";")) != -1)
                fullVersion = fullVersion.substring(0, ix);
            if ((ix = fullVersion.indexOf(" ")) != -1)
                fullVersion = fullVersion.substring(0, ix);

            majorVersion = parseInt('' + fullVersion, 10);
            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            return {
                browser: {
                    name: browserName,
                    version: majorVersion,
                    fullVersion: fullVersion,
                    fullAgent: nAgt,
                    desktop: desktop
                },
                resolution: {
                    width: this.currentResolution[0],
                    height: this.currentResolution[1],
                    title: this.currentResolution[2]
                }
            };
        };
        return tester;
    }

    //html2js
    window.__html__ = window.__html__ || {};

    window.polymerTestOnlyIf = function (condition, reason, tests, args) {
        "use strict";
        if (condition) {
            tests.apply(null, args)
        } else {
            it('Test skipped because: ' + reason, function () {
                assert.equal(true, true);
            });
        }
    };

    window.polymerTest = function (page, tests) {
        "use strict";

        if (window.mocha) {
            window.mocha.checkLeaks = false;
        }

        window.polymerTestLock = false;

        var acquireLock = function (done, callback) {
            if (window.polymerTestLock === false) {
                window.polymerTestLock = true;
                callback();
                done();
            } else {
                setTimeout(function () {
                    acquireLock(done, callback);
                }, 100);
            }
        };

        var releaseLock = function (done) {
            window.polymerTestLock = false;
            done();
        };

        describe("With page: " + page, function () {
            this.timeout(600000);
            var mainTester = setupTester(karma);

            var baseUrl = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];

            // Create a new frame
            var resolutions = mainTester.config.resolutions;

            for (var i = 0; i < resolutions.length; i++) {
                describe("With resolution: " + resolutions[i][2], function (resolution) {
                    return function () {
                        this.timeout(600000);
                        before(function (done) {
                            acquireLock(done, function (tester) {
                                return function () {
                                    tester.frame = document.createElement("iframe");
                                    tester.frame.style.width = resolution[0] + "px";
                                    tester.frame.style.height = resolution[1] + "px";
                                    tester.frame.setAttribute("src", baseUrl + "/base/" + page);
                                    document.body.appendChild(tester.frame);
                                }
                            }(tester));
                        });
                        after(function (done) {
                            releaseLock(done);
                        });

                        var tester = setupTester(karma, resolution);

                        var check = function (done) {
                            var doc = tester.document();
                            if (doc !== undefined) {
                                var ready = doc.getElementsByClassName("polymerReady").length > 0;

                                if (ready) {
                                    done();
                                } else {
                                    setTimeout(
                                        function () {
                                            check(done);
                                        },
                                        100
                                    );
                                }
                            } else {
                                console.warn("Giving up test, document is unavailable.");
                                console.log(Object.keys(this));
                            }
                        };

                        describe("test runner", function () {
                            this.timeout(600000);
                            before(function (done) {
                                check(done);
                            });

                            beforeEach(function () {
                                var title = this.currentTest.title + " :: ";
                                var parent = this.currentTest.parent;
                                while (parent !== undefined) {
                                    if (parent.title != "") {
                                        title = parent.title + " > " + title;
                                    }
                                    parent = parent.parent;
                                }
                                console.prefix(title);
                                tester.test = this.currentTest;
                            });

                            tests(tester);
                        });

                        after(
                            function () {
                                document.body.removeChild(tester.frame);
                            }
                        );
                    };
                }(resolutions[i]));
            }
        });
    };
})(window.__karma__);
