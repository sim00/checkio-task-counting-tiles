requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $, TableComponent) {
        function CountingTilesCanvas(dom, dataInput, cellN){
            //Vars
            var cellSize = 40;
            var zx = 20;
            var zy = 20;
            var fullX = cellSize * cellN + zx * 2;
            var fullY = cellSize * cellN + zy * 2;

            var delay = 200;

            var colorDark = "#294270";
            var colorOrange = "#F0801A";
            var colorBlue = "#69B3E3";
            var colorWhite = "#FFFFFF";

            var attrCircle = {"stroke": colorDark, "fill": colorOrange, "stroke-width": 2};
            var attrMain = {"stroke": colorDark, "stroke-width": 2, "fill": colorBlue};
            var attrLine = {"stroke": colorDark, "stroke-width": 2};
            var attrCentralLine = {"stroke": colorDark, "stroke-width": 3};
            var attrPanel = {"stroke": colorDark, "fill": colorWhite, "opacity": 0};

            var paper;
            var mainCircle;

            this.createCanvas = function() {
                paper = Raphael(dom, fullX, fullY, 0, 0);
                paper.rect(zx, zy, cellN * cellSize, cellN * cellSize).attr(attrMain);
                mainCircle = paper.circle(fullX / 2, fullY / 2, dataInput * cellSize).attr(attrCircle);
                for (var i = 1; i < cellN; i++) {
                    paper.path(Raphael.format("M{0},{1}L{2},{1}",
                        zx, zy + cellSize * i, zx + cellSize * cellN)).attr(i !== cellN / 2 ? attrLine : attrCentralLine);
                    paper.path(Raphael.format("M{0},{1}L{0},{2}",
                        zx  + cellSize * i, zy, zy + cellSize * cellN)).attr(i !== cellN / 2 ? attrLine : attrCentralLine);
                }
            };

            this.createFeedback = function(callback) {
                if (!mainCircle) {
                    return false;
                }
                var activeElement = paper.rect(zx, zy, cellN * cellSize, cellN * cellSize).attr(attrPanel);
                activeElement.toFront();
                activeElement.click(function(e) {
                    var x = ((e.offsetX || e.layerX) - zx) / cellSize;
                    var y = ((e.offsetY || e.layerY) - zy) / cellSize;
                    var cx = cellN / 2;
                    var radius = Math.round(Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cx, 2)) * 100) / 100;
                    if (radius > cellN / 2) {
                        radius = cellN / 2;
                    }
                    mainCircle.animate({"r": radius * cellSize}, delay);
                    if (callback) {
                        callback(radius, e);
                    }
                });

            }
        }

        var $tryit;
        var tooltip = false;

        var io = new extIO({
            animation: function($expl, data){
                var checkioInput = data.in;
                if (!checkioInput){
                    return;
                }
                var canvas = new CountingTilesCanvas($expl[0], checkioInput, 8);
                canvas.createCanvas();
            },
            retConsole: function (ret) {
                $tryit.find(".checkio-result-in").html(ret);
            },
            tryit:function (this_e) {
                $tryit = $(this_e.extSetHtmlTryIt(this_e.getTemplate('tryit')));
                var tCanvas = new CountingTilesCanvas($tryit.find(".tryit-canvas")[0], 2, 6);
                tCanvas.createCanvas();
                tCanvas.createFeedback(function(r, e) {
                    this_e.extSendToConsoleCheckiO(r);
                    e.stopPropagation();
                    return false;
                });
                $tryit.find(".tryit-canvas").mouseenter(function (e) {
                    if (tooltip) {
                        return false;
                    }
                    var $tooltip = $tryit.find(".tryit-canvas .tooltip");
                    $tooltip.fadeIn(1000);
                    setTimeout(function () {
                        $tooltip.fadeOut(1000);
                    }, 2000);
                    tooltip = true;
                });
            },
            functions: {
                js: 'countingTiles',
                python: 'checkio'
            }
        });
        io.start();
    }
);
