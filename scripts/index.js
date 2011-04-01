$(document).ready(function() {

    function testAnd() {
        var testA = new Cq(false);
        var testB = new Cq(false);
        var testOut = 0;

        var testBinding = CqBind([testA, testB],
            function () { return testA.v && testB.v; },
            function () { testOut ++; });
        
        testA.v = true;
        testB.v = true;
        
        testBinding.unbind();
        
        testA.v = false;
        testA.v = true;
        
        return testOut == 1;
    }

    function testMod() {
        var testA = new Cq(0);
        var testOut = 0;

        var testBinding = CqBind([testA],
            function () { return testA.v % 100 == 0; },
            function () { testOut ++; });
        
        for(var i=1; i<=1000; i++) {
            testA.v = i;
        }
        
        testBinding.unbind();

        return testOut == 10;
    }

    function testLogic() {
        var testA = new Cq(false);
        var testB = new Cq(false);
        var testC = new Cq(false);
        var testD = new Cq(false);

        var testTrueOut = 0;        
        var testFalseOut = 0;        
        var testBinding = CqBind([testA, testB, testC, testD],
            function () { return (testA.v && testB.v) || (testC.v && testD.v); },
            function () { testTrueOut ++; },
            function () { testFalseOut ++; });

        testA.v = true;
        testB.v = false;
        testC.v = true;
        testD.v = false;
        var test1 = (testTrueOut === 0) && (testFalseOut === 4);

        testB.v = true;        
        var test2 = (testTrueOut === 1) && (testFalseOut === 4);

        testD.v = true;
        var test3 = (testTrueOut === 2) && (testFalseOut === 4);

        testA.v = false;
        testC.v = false;
        var test4 = (testTrueOut === 3) && (testFalseOut === 5);

        testBinding.unbind();

        return test1 && test2 && test3 && test4;
    }

    function testSetGetChanged() {
        var testA = new Cq(true);
        var testB = new Cq(false);

        var testTrueOut = 0;        
        var testFalseOut = 0;        
        var testSetOut = 0;
        var testGetOut = 0;
        var testChangedOut = 0;

        var testTrueBinding = CqBind([testA, testB],
            function () { return testA.v && testB.v; },
            function () { testTrueOut ++; },
            function () { testFalseOut ++; });

        var testSetBinding = CqBind([testA, testB],
            function () { return testA.v && testB.set(); },
            function () { testSetOut ++; });

        var testChangedBinding = CqBind([testA, testB],
            function () { return testA.v && testB.changed(); },
            function () { testChangedOut ++; });

        testB.v = false;
        var test2 = (testTrueOut === 0) && (testFalseOut === 1) && 
          (testSetOut == 1) && (testChangedOut == 0);

        testB.v = true;
        var test3 = (testTrueOut === 1) && (testFalseOut === 1) && 
          (testSetOut == 2) && (testChangedOut == 1);

        testB.v = false;
        var test4 = (testTrueOut === 1) && (testFalseOut === 2) && 
          (testSetOut == 3) && (testChangedOut == 2);

        testTrueBinding.unbind();
        testSetBinding.unbind();
        testChangedBinding.unbind();

        return test2 && test3 && test4;
    }

    var $box = $("#box");
    $box.css({ "position": "absolute", "border-style": "dotted", 
    "border-width": "2px", "background-color": "#AAFFFF",
    "width": "300px", "height": "200px" });    
    var $boxPos = $("#boxPosition");
    var $boxRes = $("#boxResults");
        
    $boxRes.html(
        "testAnd:" + testAnd() + "<br/>" + 
        "testMod:" + testMod() + "<br/>" +
        "testLogic:" + testLogic() + "<br/>" +
        "testGSC:" + testSetGetChanged() +"<br/>");
    $boxPos.html("0,0");
    
    // Bounce test results around

    // Set physics     
    var posX = new Cq(0.5 * window.innerWidth - $box.width());
    var posY = new Cq(0.5 * window.innerHeight - $box.height());
    var mouseX = new Cq(0);
    var mouseY = new Cq(0);
    var lastMouseTime = new Date().getTime();
    var vecX = Math.random() * 10;
    var vecY = Math.random() * 10;
    var mouseVecX = 0;
    var mouseVecY = 0;
    var length = Math.sqrt(vecX*vecX + vecY*vecY);
    var speed = 200;
    vecX = speed * vecX / length;
    vecY = speed * vecY / length;
    var margin = 5;
    var minXBoundary = function() {
        return margin;        
    }
    var minYBoundary = function() {
        return margin;        
    }
    var maxXBoundary = function() {
        return window.innerWidth - $box.width() - margin;        
    }
    var maxYBoundary = function() {
        return window.innerHeight - $box.height() - margin;        
    }
    var boxRight = function(debug) {
        return posX.v + $box.width();
    };
    var boxBottom = function(debug) {
        return posY.v + $box.height();
    };
    var clamp = function(min, max, value) {
        if(value<min)
            return min;
        if(value>max)
            return max;
        return value;        
    }
    
    // Set rules
    var bindings = [];
    // Have window hold onto these so they don't get GCd
    window.bindings = bindings;
    // Change direction when we hit the sides
    bindings.push(CqBind([posX], function() { return posX.v < 0; },
        function() {
            vecX = Math.abs(vecX);
            posX.v = 0;
            _CqDebugLog("minX: posX=0");
        })._setLabel("minX"));
    bindings.push(CqBind([posY], function() { return posY.v < 0; },
        function() {
            vecY = Math.abs(vecY);
            posY.v = 0;
            _CqDebugLog("minY: posY=0");
        })._setLabel("minY"));
    bindings.push(CqBind([posX], function() { return posX.v > maxXBoundary(); },
        function() {
            vecX = -Math.abs(vecX);
            posX.v = maxXBoundary();
            _CqDebugLog("maxX: posX=max");
        })._setLabel("maxX"));
    bindings.push(CqBind([posY], function() { return posY.v > maxYBoundary(); },
        function() {
            vecY = -Math.abs(vecY);
            posY.v = maxYBoundary();
            _CqDebugLog("maxY: posY=max");
        })._setLabel("maxY"));

    // Deflect off mouse
    var deflectToggle = false;
    var deflectBinding = CqBind([mouseX, mouseY, posX, posY],
        function(){ 
            // Don't deflect if we've just deflected.
            return mouseX.v > posX.v && mouseX.v < boxRight() &&
                mouseY.v > posY.v && mouseY.v < boxBottom(); 
        },
        function() {
            if (deflectToggle) {
                deflectToggle = false;
                // Mouse is in box - deflect!
                vecX = -vecX + mouseVecX;
                vecY = -vecY + mouseVecY;
                
                _CqDebugLog("deflect: deflected");
            }
        },
        function() {
            deflectToggle = true;    
        });
    bindings.push(deflectBinding._setLabel("deflect"));
    
    // Update position
    bindings.push(CqBind([posX, posY],
        function(){ return posX.changed() || posY.changed(); },
        function() {
            //$box.offset({left: posX.v, top: posY.v});
            var x = Math.floor(posX.v);
            var y = Math.floor(posY.v);
            $box.css({left: clamp(minXBoundary(), maxXBoundary(), x), top: clamp(minYBoundary(), maxYBoundary(), y)});
            $boxPos.html("x:"+x+",y:"+y+",w:"+$box.width()+",h:"+$box.height()+" : "+mouseX.v+","+mouseY.v);    
            //_CqDebugLog("pos changed css: pos = " + x + "," + y);
        })._setLabel("posXOrPosYChanged"));

    // Create a nudge loop
    var frameDelta = 1000/30;
    var lastDelta = frameDelta;
    var startTime = new Date().getTime();
    var updateFunc = function() {
        var now = new Date().getTime();
        lastDelta = now - startTime;
        startTime = now;

        // Nudge position
        var damp = 0.95;
        var msDelta = 0.001 * lastDelta;
        posX.v = posX.v + vecX * msDelta;
        posY.v = posY.v + vecY * msDelta;
        vecX *= damp;
        vecY *= damp;

        if (posY.v < -10) {
            _CqDebugLog("less than -10");
        }

        setTimeout(updateFunc, frameDelta);
    };   
    setTimeout(updateFunc, 1000/30);       

    // Handle mouse updates
    document.onmousemove = function(event) {
        var now = new Date().getTime();
        var delta = now - lastMouseTime;
        lastMouseTime = now;
 
        // Vec distance/s       
        mouseVecX = 1000 * (event.clientX - mouseX.v) / delta;
        mouseVecY = 1000 * (event.clientY - mouseY.v) / delta;
        mouseX.v = event.clientX;
        mouseY.v = event.clientY;
    };     
    document.ontouchmove document.onmousemove;
    
    document.onmousedown = function(event) {
        bindings.forEach( function(item) {
            item._debug = true;
        });
    };

    document.onmouseup = function(event) {
        bindings.forEach( function(item) {
            item._debug = false;
        });
        posX.v = 10;
        posY.v = 10;
    };
   
});

