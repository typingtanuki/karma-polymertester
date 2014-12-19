(function (karma) {
    function setupTester(karma) {
        "use strict";
        var tester = {
            config: karma.config.polymerTester || {}
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

        tester._window = function () {
            return tester.frame;
        };
        tester._document = function () {
            var iWindow = this._window();
            var out;
            if (iWindow.contentWindow) {
                out = iWindow.contentWindow.document;
            } else if (iWindow.contentDocument) {
                out = iWindow.contentDocument.children[0];
                if (!out) {
                    out = iWindow.contentDocument;
                }
            } else {
                out = iWindow;
            }
            return out;
        };
        tester.body = function () {
            var iframeDocument = tester.frame.contentDocument || tester.frame.contentWindow.document;
            return iframeDocument.getElementsByTagName("body")[0];
        };
        tester.document = function () {
            var body = this.body();
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
        return tester;
    }

    //html2js
    window.__html__ = window.__html__ || {};

    window.polymerTest = function (page, tests) {
        "use strict";
        describe("With page: " + page, function () {
            var mainTester = setupTester(karma);

            var baseUrl = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];

            // Create a new frame
            var resolutions = mainTester.config.resolutions;
            for (var i = 0; i < resolutions.length; i++) {
                var resolution = resolutions[i];

                var tester = setupTester(karma);

                // Clear previous frame
                if (tester.frame) {
                    document.body.removeChild(tester.frame);
                }
                describe("With resolution: " + resolution[2], function () {
                    this.timeout(10000);

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
                });
            }
        });
    };
})(window.__karma__);
