$(document).ready(function() {
    $("#div1").dialog({ title: "HelloWorld" });

    window.alert("starting tests.");

    function testAnd() {
        var testA = new Cq(false);
        var testB = new Cq(false);
        var testOut = 0;
    
        var testOp = testA.and(testB);
        
        var testBinding = testOp.bind( function() {
            testOut++;
        });
        
        testA.v = true;
        testB.v = true;
        
        testBinding.free();
        
        testA.v = false;
        testA.v = true;
        
        return testOut == 1;
    }

    function testMod() {
        var testA = new Cq(0);
        var testOut = 0;
        
        var testBinding = testA.mod(100).eq(0).bind( function() {
            testOut++;
        });

        for(var i=1; i<=1000; i++) {
            testA.v = i;
        }
        
        testBinding.free();

        return testOut == 10;
    }

    function testLogic() {
        var testA = new Cq(false);
        var testB = new Cq(false);
        var testC = new Cq(false);
        var testD = new Cq(false);

        var testTrueOut = 0;        
        var testFalseOut = 0;        
        var testBinding = (testA.and(testB)).or(testC.and(testD)).bind( function() {
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

        testBinding.free();

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

        var testTrueBinding = testA.and(testB).bind( function() {
            testTrueOut++;
        }, function() {
            testFalseOut++;
        });

        var testSetBinding = testA.and(testB.set()).bind( function() {
            testSetOut++;
        });

        var testGetBinding = testA.and(testB.get()).bind( function() {
            testGetOut++;
        });

        var testChangedBinding = testA.and(testB.changed()).bind( function() {
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

        testTrueBinding.free();
        testSetBinding.free();
        testGetBinding.free();
        testChangedBinding.free();

        return test1 && test2 && test3 && test4;
    }
    
    function testArgLists() {
        var testA = new Cq(0);
        var testB = new Cq(0);
        var testC = new Cq(0);
        var testD = new Cq(0);
        var testEqualOut = 0;
        var testEqualBinding = testA.eq(testB, testC, testD).and(testA.set()).bind( function() {
            testEqualOut++;
        });
        testA.v = 0;
        var test1 = testEqualOut == 1;       
        testEqualBinding.free();

        testA.v = 0;
        testB.v = 1;
        testC.v = 2;
        testD.v = 3;
        var testLtOut = 0;
        var testLtBinding = testA.lt(testB, testC, testD).and(testA.set()).bind( function() {
            testLtOut++;
        });
        testA.v = 0;
        var test2 = testLtOut == 1;     
        testLtBinding.free();
        
        return test1 && test2;
    }

    window.alert("Results:" + 
        " testAnd:" + testAnd() + 
        " testMod:" + testMod() + 
        " testLogic:" + testLogic() + 
        " testGSC:" + testSetGetChanged() +
        " testArgLists:" + testArgLists()
    );

});

