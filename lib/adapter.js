(function (karma) {
    function setupTester(karma, resolution) {
        "use strict";
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

        tester.frame = tester.frame || undefined;

        tester._document = function () {
            var raw_document = tester.frame.contentDocument || tester.frame.contentWindow.document;
            if (raw_document.documentElement) {
                return raw_document.documentElement;
            } else {
                return raw_document;
            }
        };
        tester.body = function () {
            var iframeDocument = this._document();
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

        describe("With page: " + page, function () {
            var mainTester = setupTester(karma);

            var baseUrl = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];

            // Create a new frame
            var resolutions = mainTester.config.resolutions;
            for (var i = 0; i < resolutions.length; i++) {
                var resolution = resolutions[i];

                describe("With resolution: " + resolution[2], function () {
                    this.timeout(10000);

                    var tester = setupTester(karma, resolution);
                    tester.frame = document.createElement("iframe");
                    tester.frame.style.width = resolution[0] + "px";
                    tester.frame.style.height = resolution[1] + "px";
                    tester.frame.setAttribute("src", baseUrl + "/base/" + page);
                    document.body.appendChild(tester.frame);

                    var check = function (done) {
                        var ready = tester.document().getElementsByClassName("polymerReady").length > 0;

                        if (ready) {
                            done();
                        } else {
                            setTimeout(
                                function () {
                                    check(done)
                                },
                                1000
                            );
                        }
                    };

                    describe("test runner", function () {
                        before(function (done) {
                            check(done);
                        });

                        tests(tester);
                    });

                    after(
                        function () {
                            document.body.removeChild(tester.frame);
                        }
                    );
                });
            }
        });
    };
})(window.__karma__);
