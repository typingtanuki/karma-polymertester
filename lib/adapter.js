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

        tester.window = function () {
            return window.PolymerTester.frame;
        };
        tester.document = function () {
            var iWindow = this.window();
            var out;
            if (iWindow.contentDocument) {
                out = iWindow.contentDocument.children[0];
                if (!out) {
                    out = iWindow.contentDocument;
                }
            } else if (iWindow.contentWindow) {
                out = iWindow.contentWindow.document;
            } else {
                out = iWindow;
            }
            return out;
        };
        return tester;
    }

    window.PolymerTester = window.PolymerTester || setupTester(karma);
    //html2js
    window.__html__ = window.__html__ || {};

    window.polymerTest = function (page, tests) {
        "use strict";
        describe("With page: " + page, function () {
            this.timeout(60000);

            // Clear previous frame
            if (window.PolymerTester.frame) {
                document.body.removeChild(window.PolymerTester.frame);
            }

            var baseUrl = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];

			window.PolymerTester.config.resolutions.forEach(
				function(currentResolution){
					// Create a new frame
					window.PolymerTester.frame = document.createElement("iframe");
					window.PolymerTester.frame.style.width = currentResolution[0] + "px";
					window.PolymerTester.frame.style.height = currentResolution[1] + "px";
					window.PolymerTester.frame.setAttribute("src", baseUrl + "/base/" + page);
					document.body.appendChild(window.PolymerTester.frame);

					var check = function (done) {
						var ready = window.PolymerTester.document().getElementsByClassName("polymerReady").length > 0;
						console.log("Waiting for ready: " + ready);

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

					describe("With resolution: "+currentResolution[2], function () {
						before(function (done) {
							check(done);
						});

						tests();
					});
				}
			);
        });
    };
})(window.__karma__);
