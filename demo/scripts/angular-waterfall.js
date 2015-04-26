/**
 * Created by Zed on 2015/4/26.
 * @name ngWaterfall
 */
(function(window,angular){

    angular.module('ngWaterfall',[])
        .directive("repeatFinished",function($timeout){
            return {
                restrict: "A",
                link: function (scope,element) {
                    element[0].style.opacity = "0";
                    element[0].style["-moz-opacity"] = "0";
                    element[0].style["filter"] = "alpha(opacity=0)";
                    if (scope.$last === true) {
                        $timeout(function(){
                            scope.$emit("repeatFinished");
                        },200);
                    }
                }
            }
        })
        .directive("ngInfiniteScroll",function($rootScope){
            return {
                restrict: "AE",
                replace: true,
                link:function(scope,element,attr,controller){
                    element[0].style.position = "absolute";
                    element[0].style.left = 0;
                    $rootScope.$on("colData",function(ev,data){
                        var sorted = data.sort(function(a,b){
                            return a-b
                        });
                        scope.max = sorted[sorted.length - 1];
                        element[0].style.top = scope.max + 30 + 'px';
                    })
                }
            }
        })
        .directive("ngWaterfall",function($window,$document,$rootScope,$timeout){
            return {
                restrict: "A",
                scope: {
                    contentWidth : "@",
                    cols : "@"
                },
                link: function(scope,element){
                    scope.minCols = scope.cols || 6;
                    $rootScope.$on("repeatFinished",function(){
                        $timeout.cancel();
                        waterfall(scope.minCols);

                    });
                    $window.onresize = function(){
                        $timeout.cancel();
                        $timeout(function(){
                            waterfall(scope.minCols);
                        },200)
                    };


                    function scroll(){
                        var index = getMinKeyByArray(scope.oLiHeight);
                        var short = scope.oLiHeight[index];
                        var clientHeight = $document[0].documentElement.clientHeight;
                        var scrollTop = document.documentElement.scrollTop > document.body.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
                        if (scrollTop + clientHeight >= short) {
                            scope.$emit("loadMore");
                            $window.onscroll = null;
                        }
                    }
                    function waterfall(minCols){
                        scope.wrapWidth = scope.contentWidth || element[0].offsetWidth;
                        scope.oLiHeight = [];//存每行的高度
                        var
                            colWidth,
                            oLis = element.find("li");
                        colWidth = scope.wrapWidth/minCols;
                        for (var m = 0; m < oLis.length; m++){
                            oLis[m].style.width = colWidth + "px";
                            oLis[m].style.opacity = "1";
                            oLis[m].style["-moz-opacity"] = "1";
                            oLis[m].style["filter"] = "alpha(opacity=100)";
                        }
                        for (var i = 0; i < minCols; i++){
                            oLis[i].style.top = 0;
                            oLis[i].style.left = i * colWidth + "px";
                            var h = parseInt(oLis[i].offsetHeight);
                            scope.oLiHeight.push(h);
                        }
                        for (var k = minCols; k < oLis.length; k++){
                            var index = getMinKeyByArray(scope.oLiHeight);
                            oLis[k].style.top = scope.oLiHeight[index] +"px";
                            oLis[k].style.left = colWidth * index +"px";
                            oLis[k].style.opacity = "1";
                            oLis[k].style["-moz-opacity"] = "1";
                            oLis[k].style["filter"] = "alpha(opacity=100)";
                            scope.oLiHeight[index] = scope.oLiHeight[index] + parseInt(oLis[k].offsetHeight)
                        }
                        scope.$emit("colData",scope.oLiHeight);
                        $window.onscroll = scroll;
                    }


                    function getMinKeyByArray(arr){
                        var val = arr[0];
                        var key = 0;
                        for (var k in arr) {
                            if (arr[k] < val) {
                                val = arr[k];
                                key = k;
                            }
                        }
                        return key;

                    }

                }
            }
        })

})(window,angular)