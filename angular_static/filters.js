(function() {
    //start of function
var filters=angular.module('filters', []);
filters.filter('two', function() {
    return function(input) {
        return input.num == 2;
    }
});
filters.filter('three', function() {
    return function(input) {
        var out = [];
        for (var i = 0; i < input.length; i++) {
            if(input[i].num > 3){
                out.push(input[i]);
            }
        }
        return out;
    }
});

      //end of function
})();