var createPattern = function (path) {
    return {pattern: path, included: true, served: true, watched: false};
};

var initPolymerTester = function (files) {
    files.unshift(createPattern(__dirname + '/adapter.js'));
};

initPolymerTester.$inject = [
    'config.files'
];

module.exports = {
    'framework:polymerTester': ['factory', initPolymerTester]
};