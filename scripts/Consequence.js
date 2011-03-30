/*
 * Consequence.js
 * 
 * * * * * *
 * LICENSE
 * 
 * The MIT License
 * 
 * Copyright (c) 2011 Sean E. Dunn
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * * * * * *
 * OVERVIEW
 * 
 * Consequence.js is a Javascript library for reactive programming:
 * http://en.wikipedia.org/wiki/Reactive_programming
 * 
 * With Consequence.js, one can set a state clause that, when satisfied at any 
 * time, results in the execution of bound imperative handlers, for either the 
 * positive (true) case, or the negative (false) case.
 * 
 * This library can be used when a programmer would rather say "whenever some 
 * complex state set X happens, do Y, and let me not worry about when", instead
 * of "whenever I can, check whether some complex state set X is happening and 
 * do Y". Example domains where this could be useful are games, user
 * interfaces, and, to give an example where this exists presently, in 
 * spreadsheets.
 * 
 * * * * * *
 * IN DETAIL
 * 
 * In the traditional imperitive model, it is the responsibility of the 
 * programmer to write constructs that regularly check whether state has been 
 * satisfied in order to execute subsequent instructions. In the Consequence.js 
 * reactive programming model, a binding is made between the state clause which 
 * must be satisfied at some point in the future, and the code which handles 
 * the positive and negative results of that state.
 * 
 * Consequence.js provides a method chain language for creating state clauses 
 * which are bound to handler functions. In addition to logic, comparison, and
 * arithmetic operators, there exist three special operators for detecting 
 * read, write, and modify operations only on Cq objects themselves: set(), 
 * get(), and changed().
 *
 * E.g.,
 * 
 *   // Set variables
 *   var a = new Cq(0);
 *   var b = new Cq("apple");
 * 
 *   // Define binding
 *   var binding = a.eq(1).and(b.eq("apple")).bind(false, function() {
 *     // state satisfied, do something. This is the affirmative handler, 
 *     // which is required.
 *     window.alert("State satisfied!");
 *   }, function() {
 *     // state not satisfied, do nothing. This is the negative handler, 
 *     // which is optional.
 *   });
 *
 *   // Satisfy the state, causing the window the pop up.
 *   a.v = 1;
 * 
 *   // Cleanup
 *   binding.unbind();
 * 
 * The state clause's operators can also handle arbitrary numbers of operators.
 * Whereas the following will run the positive handler if all Cq objects are
 * true:
 * 
 *   var binding = a.and(b).and(c).and(d).bind(false, function(){ ... } );
 * 
 * the following is more concise:
 * 
 *   var binding = a.and(b,c,d).bind(false, function(){ ... } );
 * 
 * You can also apply your operator list as an array. The following will 
 * activate when a,b,c,d are all true.
 * 
 *   var ops = [a,b,c,d];
 *   var binding = Cq(true).and(ops).bind(false, function(){ ... } );
 * 
 * You can also pass a function as an operator. Whenever a test is run on the
 * state clause, this function will be evaluated. Note that the state clause 
 * will not be triggered if the result of the function changes, only if an 
 * actual Cq object has changed first. In the following example, if 'a' is
 * true, the function will not be queried because of short-circuit logic.
 * 
 *   var func = function(){ return moonInPhase; };
 *   var binding = a.or(func).bind(false, function(){ ... } );
 * 
 * The first argument to bind() specifies whether execution is forced or not. 
 * Setting it to false specifies that the affirmative and negative functions 
 * will only execute when the result of the state clause has changed. Set to 
 * true, the affirmative and negative functions will always run. Remember 
 * this when using a set() or get() operator, as writing (set) or reading (get) 
 * the target Cq object will only fire its handlers when the state clause 
 * changes if force is set to false.
 * 
 * * * * * *
 * PERFORMANCE
 * 
 * Consequence.js attempts to be efficient about checking this state by only evaluating 
 * when a dependency Cq variable has been modified, and using short circuit logic when
 * possible.
 * 
 * * * *
 * API
 * 
 * OBJECTS
 * 
 * Cq
 * Constructor
 *      Cq(value, min=undefined, max=undefined)
            To create a variable that can be used in a state clause, create a Cq 
            object using new.     
            value: initial value of object
            min: optional minimum value object can be set to
            max: optional maximum value object can be set to 
 * Members
 *      v: use to set/get value of Cq object
 * Methods
 *      bind(force, positive, negative)
 *          Bind a state clause to handlers
 *          force: call positive/negative handlers even if result from state clause
 *              query does not change.
 *          positive: function to execute when state clause evaluates to true 
 *          negative: function to execute when state clause evaluates to false 
 *      LOGIC OPERATORS
 *      and: &&
 *      or:  ||
 *      not: ! (unary)
 *      COMPARISON OPERATORS
 *      eq:  ==
 *      neq: !=
 *      eq_: ===
 *      neq_:!==
 *      gt:  >
 *      gte: >=
 *      lt:  <
 *      lte: <=
 *      ARITHMETIC OPERATORS
 *      add: +
 *      sub: -
 *      mul: *
 *      div: /
 *      mod: %
 *      neg: - (unary)
 *      VALUE OPERATORS
 *      get: the value has been read from
 *      set: the value has been written to
 *      changed: the value has modified
 */

(function() {

    // Setup
    //
    
    var _debug = true; // Uncomment for debug functionality
    var _debugLog = function(){};
    if (_debug)
        _debugLog = function(str) { console.log(str); };
     
    var root = this;
    var previousCq = root.Cq;

    // Util
    //
    
    function isArray(obj) {
        return obj.constructor == Array;
    }

    // _Set

    function _Set() {
        this._array = new Array();
    }

    _Set.prototype = {
        _mapKey: function _Set__mapKey(item) {
            if (item.uniqueId == null)
                return item;
            else
                // Strings that are pure integers get interpreted as integers, so
                // force it to be a string.
                return "k" + item.uniqueId().toString(16);
        },
        
        // Convert uniqueId to base-16 string, since that should be the fastest conversion
        // to a hashable string.
        find: function _Set_find(item) {
            return this._array[this._mapKey(item)];
        },

        insert: function _Set_insert(item) {
            this._array[this._mapKey(item)] = item;
        },

        remove: function _Set_remove(item) {
            delete this._array[this._mapKey(item)];
        },
        
        map: function _Set_map(func) {
            for(var item in this._array) {
                func(this._array[item]);
            }
        }
    };

    // _Extend

    function _Extend(sup, sub) {
        return $.extend({}, sup, sub);
    }

    // _CqObject
    
    var _TheCqObjectId = 0;
    
    function _CqObject() {
    }
    
    _CqObject.prototype = {
        uniqueId: function() {
          var newId = _TheCqObjectId++;
          this.uniqueId = function(){ return newId; }
          return newId;
        }
    };

    // Cq
    //

    // _CqBinding

    function _CqBinding(op, alwaysTest, trueFunc, falseFunc) {
        var self = this;
        this._op = op;
        this._alwaysTest = alwaysTest;
        this._trueFunc = trueFunc;
        this._falseFunc = falseFunc;
        this._opLastResult = false;
        this._testing = false;
        this._debug = false;
    }

    _CqBinding.prototype = _Extend(_CqObject.prototype, {
        unbind: function _CqBinding_unbind() {
            this._op._unbindChildren(this);
        },

        _test: function _CqBinding__test() {
            if (!this._testing) {
                if (this._debug)
                    _debugLog("CqBinding _test() begin");

                this._testing = true;
                var opResult = this._op._test(this._debug);
                if (opResult != this._opLastResult || this._alwaysTest) {
                    if (opResult && this._trueFunc)
                        this._trueFunc();
                    else if(!opResult && this._falseFunc)
                        this._falseFunc();
                }
                this._opLastResult = opResult;
                this._testing = false;

                if (this._debug)
                    _debugLog("CqBinding _test() end");
            }
        }
    });
    
    // _CqOp
    
    function _CqOp(test, opList) {
        this._test = test;
        this._opList = opList;
        this._isCqOp = true;
        this._class = null;
    }

    _CqOp.prototype = _Extend(_CqObject.prototype, {
        // Utility
        
        isCqOp: function _CqOp_isCqOp(op) {
            return ((typeof(op) == "object") && (op != null) && (op._isCqOp == true));
        },

        // Internal

        _buildOps: function _CqOp__buildOps(allOps, op) {
            if (this.isCqOp(op))
                allOps.push(op);
            else if (isArray(op)) {
                var self = this;
                op.forEach( function(itemOp) {
                    allOps = self._buildOps(allOps, itemOp);
                });  
            } else if (typeof(op) == "function")
                allOps.push(new _CqOp(op, []));
            else
                allOps.push(new Cq(op));
            return allOps;
        },

        // iterFunc: iterative computation between current op and next
        // stopFunc: optional condition of last computated result such that we stop chaining and accept result
        _wrap: function _CqOp__wrap(args, iterFunc, stopFunc) {
            var argLen = args.length;
            var allOps = new Array();
            allOps.push(this);
            for (var a = 0; a < argLen; a++) {
                var realOp;
                var op = args[a];
                allOps = this._buildOps(allOps, op);
            }

            var test;
            //Todo: optimize for len == 2, allOps[0] and allOps[1]
            if (allOps.length == 1) {
                test = function _CqOp__wrap_unaryTest(debug) {
                    if (debug) {
                        var testRes = allOps[0]._test(debug);
                        _debugLog("Result:"+testRes+" Func: "+iterFunc.toString());
                    } else
                        return iterFunc(allOps[0]._test());
                };
            } else {
                test = function _CqOp__wrap_multTest(debug) {
                    if (debug) {
                        var lastOpTest = allOps[0]._test(debug);
                        var testRes = lastOpTest.toString();
                        var result = undefined;
                        var len = allOps.length;
                        for (var i=1; i<len && !(stopFunc && stopFunc(result)); i++) {
                            var opTest = allOps[i]._test(debug);
                            result = iterFunc(lastOpTest, opTest, result);
                            lastOpTest = opTest;
                            testRes += ","+lastOpTest.toString();
                        }
                        _debugLog("Result:"+testRes+" Func: "+iterFunc.toString());
                        return result;
                    } else {
                        var lastOpTest = allOps[0]._test();
                        var result = undefined;
                        var len = allOps.length;
                        for (var i=1; i<len && !(stopFunc && stopFunc(result)); i++) {
                            var opTest = allOps[i]._test();
                            result = iterFunc(lastOpTest, opTest, result);
                            lastOpTest = opTest;
                        }
                        return result;
                    }
                };
            }

            var retOp = new _CqOp(test, allOps);
            if (_debug) {
                retOp._debugIterFunc = iterFunc ? iterFunc.toString() : "none";
                retOp._debugStopFunc = stopFunc ? stopFunc.toString() : "none";
            }
            return retOp;
        },

        // Operators
        // a: last test result in sequence, b: this test result, r: last result of this function

        // Logic

        _andIter: function _CqOp_andIter(a,b){return a && b;},
        _andStop: function _CqOp_andStop(r){return r === false;},
        and: function _CqOp_and() {
            return this._wrap(arguments, this._andIter, this._andStop);
        },

        _orIter: function _CqOp_orIter(a,b){return a || b;},
        _orStop: function _CqOp_orStop(r){return r;},
        or: function _CqOp_or() {
            return this._wrap(arguments, this._orIter, this._orStop);
        },

        _notIter: function _CqOp_notIter(a){return !a;},
        _notStop: function _CqOp_notStop(r){return true;},
        not: function _CqOp_not() {
            return this._wrap(arguments, this._notIter, this._notStop);
        },

        // Comparison

        _eqIter: function _CqOp_eqIter(a,b){return a == b;},
        _eqStop: function _CqOp_eqStop(r){return r === false;},
        eq: function _CqOp_eq() {
            return this._wrap(arguments, this._eqIter, this._eqStop);
        },

        _neqIter: function _CqOp_neqIter(a,b){return a != b;},
        _neqStop: function _CqOp_neqStop(r){return r === false;},
        neq: function _CqOp_neq() { 
            return this._wrap(arguments, this._neqIter, this._neqStop);
        },

        _eq_Iter: function _CqOp_eq_Iter(a,b){return a === b;},
        _eq_Stop: function _CqOp_eq_Stop(r){return r === false;},
        eq_: function _CqOp_eq_() {
            return this._wrap(arguments, this._eq_Iter, this._eq_Stop);
        },

        _neq_Iter: function _CqOp_neq_Iter(a,b){return a !== b;},
        _neq_Stop: function _CqOp_neq_Stop(r){return r === false;},
        neq_: function _CqOp_neq_() {
            return this._wrap(arguments, this._neq_Iter, this._neq_Stop);
        },

        _ltIter: function _CqOp_ltIter(a,b){return a < b;},
        _ltStop: function _CqOp_ltStop(r){return r === false;},
        lt: function _CqOp_lt() {
            return this._wrap(arguments, this._ltIter, this._ltStop);
        },

        _lteIter: function _CqOp_lteIter(a,b){return a <= b;},
        _lteStop: function _CqOp_lteStop(r){return r === false;},
        lte: function _CqOp_lte() {
            return this._wrap(arguments, this._lteIter, this._lteStop);
        },

        _gtIter: function _CqOp_gtIter(a,b){return a > b;},
        _gtStop: function _CqOp_gtStop(r){return r === false;},
        gt: function _CqOp_gt() {
            return this._wrap(arguments, this._gtIter, this._gtStop);
        },

        _gteIter: function _CqOp_gteIter(a,b){return a >= b;},
        _gteStop: function _CqOp_gteStop(r){return r === false;},
        gte: function _CqOp_gte() {
            return this._wrap(arguments, this._gteIter, this._gteStop);
        },

        // Numeric

        _addIter: function _CqOp_addIter(a,b,r){return r === undefined ? a + b : r + b;},
        add: function _CqOp_add() {
            return this._wrap(arguments, this._addIter);
        },

        _subIter: function _CqOp_subIter(a,b,r){return r === undefined ? a - b : r - b;},
        sub: function _CqOp_subtract() {
            return this._wrap(arguments, this._subIter);
        },

        _mulIter: function _CqOp_mulIter(a,b,r){return r === undefined ? a * b : r * b;},
        mul: function _CqOp_mul() {
            return this._wrap(arguments, this._mulIter);
        },

        _divIter: function _CqOp_divIter(a,b,r){return r === undefined ? a / b : r / b;},
        div: function _CqOp_div() {
            return this._wrap(arguments, this._divIter);
        },

        _modIter: function _CqOp_modIter(a,b,r){return r === undefined ? a % b : r % b;},
        mod: function _CqOp_mod() {
            return this._wrap(arguments, this._modIter);
        },

        _negIter: function _CqOp_negIter(a){return -a;},
        _netStop: function _CqOp_negStop(r){return true;},
        neg: function _CqOp_neg() {
            return this._wrap(arguments, this._negIter, this._negStop);
        },        

        // Binding
        
        _bindChildren: function _CqOp__bindChildren(binding) {
            this._opList.forEach(function(item) { 
                item._bindChildren(binding); 
            });
        },

        bind: function _CqOp_bind(alwaysTest, trueFunc, /*opt*/ falseFunc) {
            var binding = new _CqBinding(this, alwaysTest, trueFunc, falseFunc);
            this._bindChildren(binding);
            return binding;
        },

        _unbindChildren: function _CqOp__unbindChildren(binding) {
            this._opList.forEach(function(item) { 
                item._unbindChildren(binding); 
            });
        }
    });
    
    // Cq

    function Cq(value, /*opt*/ min, /*opt*/ max) {
        this._value = value;
        this._test = function Cq__test(){ return this._value; };
        this._boundTo = new _Set();
        this._isCqOp = true;
        this._wasSet = false;
        this._wasGet = false;
        this._wasChanged = false;

        // optional valid range of values for setting.
        this._min = undefined;
        if (min !== undefined)
            this._min = min;
        this._max = undefined;
        if (max !== undefined)
            this._max = max;

        Object.defineProperty(this, "v", {
            get : this._getValue,
            set : this._setValue
        });
    }

    Cq.prototype = _Extend(_CqOp.prototype, {
        _getValue: function Cq__getValue() {
            this._wasGet = true;
            this._boundTo.map( function(binding) {
              binding._test();
            });
            this._wasGet = false;
            return this._value;
        },

        _setValue: function Cq__setValue(val) {
            if ((this._min !== undefined && val < this._min) ||
                (this._max !== undefined && val > this._max))
                return;

            this._wasSet = true;
            if (this._value != val) {
                this._value = val
                this._wasChanged = true;
            }
            this._boundTo.map( function(binding) {
                binding._test();
            });
            this._wasChanged = false;                
            this._wasSet = false;
        },

        // Operations

        set: function Cq_set() {
            var self = this;
            return new _CqOp(function(){ return self._wasSet; }, [self]);
        },

        get: function Cq_get() {
            var self = this;
            return new _CqOp(function(){ return self._wasGet; }, [self]);
        },      
        
        changed: function Cq_changed() {
            var self = this;
            return new _CqOp(function(){ return self._wasChanged; }, [self]);
        },

        // Binding

        _bindChildren: function Cq__bindChildren(binding) {
            this._boundTo.insert(binding);
        },
    
        _unbindChildren: function Cq__unbindChildren(binding) {
            this._boundTo.remove(binding);
        }
    });

    // Exports

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Cq;
        Cq.Cq = Cq;
    } else {
        root.Cq = Cq;
    }
    
    Cq.VERSION = '0.1.0';

})();
