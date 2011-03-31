$(document).ready(function() {

    function testAnd() {
        var testA = new Cq(false);
        var testB = new Cq(false);
        var testOut = 0;
    
        var testOp = testA.and(testB);
        
        var testBinding = testOp.bind(false, function() {
            testOut++;
        });
        
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
        
        var testBinding = testA.mod(100).eq(0).bind(false, function() {
            testOut++;
        });

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
        var testBinding = (testA.and(testB)).or(testC.and(testD)).bind(false, function() {
            testTrueOut++;
        }, function() {
            testFalseOut++;
        });

        testA.v = true;
        testB.v = false;
        testC.v = true;
        testD.v = false;
        var test1 = (testTrueOut === 0) && (testFalseOut === 0);

        testB.v = true;        
        var test2 = (testTrueOut === 1) && (testFalseOut === 0);

        testD.v = true;
        var test3 = (testTrueOut === 1) && (testFalseOut === 0);

        testA.v = false;
        testC.v = false;
        var test3 = (testTrueOut === 1) && (testFalseOut === 1);

        testBinding.unbind();

        return test1 && test2 && test3;
    }

    function testSetGetChanged() {
        var testA = new Cq(true);
        var testB = new Cq(false);

        var testTrueOut = 0;        
        var testFalseOut = 0;        
        var testSetOut = 0;
        var testGetOut = 0;
        var testChangedOut = 0;

        var testTrueBinding = testA.and(testB).bind(false, function() {
            testTrueOut++;
        }, function() {
            testFalseOut++;
        });

        var testSetBinding = testA.and(testB.set()).bind(true, function() {
            testSetOut++;
        });

        var testGetBinding = testA.and(testB.get()).bind(true, function() {
            testGetOut++;
        });

        var testChangedBinding = testA.and(testB.changed()).bind(true, function() {
            testChangedOut++;
        });

        var dummy = testB.v;
        var test1 = (testTrueOut === 0) && (testFalseOut === 0) && 
          (testSetOut == 0) && (testGetOut == 1) && (testChangedOut == 0);

        testB.v = false;
        var test2 = (testTrueOut === 0) && (testFalseOut === 0) && 
          (testSetOut == 1) && (testGetOut == 1) && (testChangedOut == 0);

        testB.v = true;
        var test3 = (testTrueOut === 1) && (testFalseOut === 0) && 
          (testSetOut == 2) && (testGetOut == 1) && (testChangedOut == 1);

        testB.v = false;
        var test4 = (testTrueOut === 1) && (testFalseOut === 1) && 
          (testSetOut == 3) && (testGetOut == 1) && (testChangedOut == 2);

        testTrueBinding.unbind();
        testSetBinding.unbind();
        testGetBinding.unbind();
        testChangedBinding.unbind();

        return test1 && test2 && test3 && test4;
    }
    
    function testArgLists() {
        var testA = new Cq(0);
        var testB = new Cq(0);
        var testC = new Cq(0);
        var testD = new Cq(0);
        var testEqualOut = 0;
        var testEqualBinding = testA.eq(testB, testC, testD).and(testA.set()).bind(true, function() {
            testEqualOut++;
        });
        testA.v = 0;
        var test1 = testEqualOut == 1;       
        testEqualBinding.unbind();

        testA.v = 0;
        testB.v = 1;
        testC.v = 2;
        testD.v = 3;
        var testLtOut = 0;
        var testLtBinding = testA.lt(testB, testC, testD).and(testA.set()).bind(true, function() {
            testLtOut++;
        });
        testA.v = 0;
        var test2 = testLtOut == 1;     
        testLtBinding.unbind();
        
        return test1 && test2;
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
        "testGSC:" + testSetGetChanged() +"<br/>" +
        "testArgLists:" + testArgLists() + "<br/>");
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
        if(debug)
            console.log("boxRight: "+(posX.v + $box.width()));
        return posX.v + $box.width();
    };
    var boxBottom = function(debug) {
        if(debug)
            console.log("boxBottom: "+(posY.v + $box.height()));
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
    bindings.push(posX.lt(minXBoundary).bind(true, function() {
        vecX = Math.abs(vecX);
        posX.v = 0;
    }));
    bindings.push(posY.lt(minYBoundary).bind(true, function() {
        vecY = Math.abs(vecY);
        posY.v = 0;
    }));
    bindings.push(posX.gt(maxXBoundary).bind(true, function() {
        vecX = -Math.abs(vecX);
        posX.v = maxXBoundary();
    }));
    bindings.push(posY.gt(maxYBoundary).bind(true, function() {
        vecY = -Math.abs(vecY);
        posY.v = maxYBoundary();
    }));
    // Deflect off mouse
    var deflectBinding = ((mouseX.gt(posX)).and(mouseX.lt(boxRight))).and(
            (mouseY.gt(posY)).and(mouseY.lt(boxBottom))).bind(false, function() {
        // Mouse is in box - deflect!
        vecX = -vecX + mouseVecX;
        vecY = -vecY + mouseVecY;
    });
    bindings.push(deflectBinding);
    
    // Update position
    bindings.push(posX.changed().or(posY.changed()).bind(false, function() {
        //$box.offset({left: posX.v, top: posY.v});
        var x = Math.floor(clamp(minXBoundary(), maxXBoundary(), posX.v));
        var y = Math.floor(clamp(minYBoundary(), maxYBoundary(), posY.v));
        $box.css({left: x, top: y});
        $boxPos.html("x:"+x+",y:"+y+",w:"+$box.width()+",h:"+$box.height()+" : "+mouseX.v+","+mouseY.v);
    }));

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
    
    document.onmousedown = function(event) {
        deflectBinding._debug = true;
    };

    document.onmouseup = function(event) {
        deflectBinding._debug = false;
    };
   
});

