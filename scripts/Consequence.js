/*
 * Consequence.js v 0.2.0
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
 * Consequence.js provides a simple binding for describing what variables are
 * being watched, what test determines the trigger condition, and what to
 * execute if the test is true or false.
 *
 * E.g.,
 * 
 *   // Set variables
 *   var a = new Cq(0, 0, 1);
 *   var b = new Cq("apple");
 * 
 *   // Define binding
 *   var binding = CqBind([a,b], function(){ return a.v==1 && b.v=="apple"; },
 *      function() {
 *          // state satisfied, do something. This is the affirmative handler, 
 *          // which is required.
 *          window.alert("State satisfied!");
 *      }, function() {
 *          // state not satisfied, do nothing. This is the negative handler, 
 *          // which is optional.
 *      });
 *
 *   // Satisfy the state, causing the window the pop up.
 *   a.v = 1;
 * 
 *   // Cleanup
 *   binding.unbind();
 *  
 *   ////////////////
 *   
 * Variables are created by newing a Cq object set to a value. The value may 
 * be of any type. The Cq constructor takes two optional arguments; a min 
 * value, and a max value. If set, all values outside this inclusive range are 
 * ignored, and will not trigger handlers. To use them, the value must support 
 * > and < operations.
 * 
 * The internal connection of the Cq object to the handlers happens via CqBind.
 * CqBind takes two mandatory arguments and two arguments that may be undefined.
 * It returns a binding which may be destroyed by calling unbind() on it.
 * 
 *   CqBind(varList, testFunc, trueFunc, falseFunc)
 * 
 * varList is an array of operators for which the binding should watch for 
 * changes within. If something interesting happens to these variables,
 * testFunc is called. If it returns true, then trueFunc is called. If it 
 * returns false, the falseFunc is called. To call neither, return undefined.
 * 
 * Within the testFunc, there are four special methods which tell you more
 * about the context of your test. <var>.set() tells you if this test is
 * being called because <var> was set. <var>.changed() works the same way,
 * but is true if the variable was modified. <var>.last() tells you what
 * the last value was. The fourth is this.last(), which tells you what this
 * test function returned the last time it was called. This is useful for
 * instances where you'd like to make sure trueFunc/falseFunc are only called
 * when the test value changes, for example.
 * 
 * * * *
 * API
 * 
 * OBJECTS
 * 
 * Cq
 * Constructor
 *      Cq(value, min=undefined, max=undefined):
 *          To create a variable that can be used in a state clause, create a Cq 
 *          object using new.     
 *          value: initial value of object
 *          min: optional minimum value object can be set to
 *          max: optional maximum value object can be set to 
 * Members
 *      v: use to set/get value of Cq object
 * Methods
 *      set90: For use in the test function. Returns true if the test function
 *          was called because this variable was set.
 *      changed(): For use in the test function. Returns true if the test function
 *          was called because this variable was modified.
 *      last(): For use in the test function. Returns the last value of this 
 *          variable before the current value.
 * 
 * CqBinding
 * Methods
 *      last(): For use in the test function, accessed by calling this.last(). 
 *          Returns the value last returned by this function.
 *      unbind(): Destroy this binding.
 *      
 * CqSet
 * Constructor
 *      CqSet():
 *          Default empty CqSet. A CqSet is a convenience object for organizing
 *          bindings and cleaning them up quickly.
 * Members
 *      insert(binding): Insert a binding.
 *      remove(binding): Remove a binding.
 *      unbind(): Unbind all bindings contained within this CqSet.
 *
 * FUNCTIONS
 * 
 * CqBind(varList, testFunc, trueFunc, falseFunc): Return a new CqBinding.
 *     varList: Array of Cq variable objects.
 *     testFunc: Test that involves the varList variables. Return true to run
 *         the trueFunc, false for the falseFunc, and undefined for neither.
 *     trueFunc: If testFunc returns true, this is run.
 *     falseFunc: If testFunc returns false, this is run.
 * 
 */

(function() {

    // Setup
    //
    
    var _debug = false; // Uncomment for debug functionality
    var _debugLog = function(){};
    var _debugIndent = 0;
    if (_debug)
        _debugLog = function(str, indent) {
            var indentString = "";
            if (indent == undefined)
                indent = 0;
            if (indent >= 0) {
                indentString = new Array(Math.max(0, _debugIndent)+1).join(" ") + str;
                _debugIndent += indent;
            } else {
                _debugIndent += indent;
                indentString = new Array(Math.max(0, _debugIndent)+1).join(" ") + str;
            }
            console.log(indentString); 
        };           

    var root = this;
    var previousCq = root.Cq;

    // Util
    //
    
    function isArray(obj) {
        return obj.constructor == Array;
    }

    // _Set

    function _Set() {
        this._object = {};
    }

    _Set.prototype = {
        _mapKey: function _Set__mapKey(item) {
            if (item.uniqueId == null)
                return item;
            else
                // Strings that are pure integers get interpreted as integers, so
                // force it to be a string.
                return item.uniqueId();
        },
        
        // Convert uniqueId to base-16 string, since that should be the fastest conversion
        // to a hashable string.
        find: function _Set_find(item) {
            return this._object[this._mapKey(item)];
        },

        insert: function _Set_insert(item) {
            this._object[this._mapKey(item)] = item;
        },

        remove: function _Set_remove(item) {
            delete this._object[this._mapKey(item)];
        },
        
        map: function _Set_map(func) {
            for(var item in this._object) {
                func(this._object[item]);
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

    // Use strings as unique id's for convenient mapping in Set's
    _CqObject.prototype = {
        // Create a unique id for this object if queried
        uniqueId: function _CqObject_uniqueId() {
            var newId = (++_TheCqObjectId).toString(16);
            this.uniqueId = function(){ return newId; }
            return newId;
        },

        // Perform a shallow clone of this object (child Object's will be common) and return it
        clone: function _CqObject_clone() {
            var newObj = {};
            for (i in this) {
                if (i == 'clone') continue;
                newObj[i] = this[i]
            }
            return newObj;
        }
    };

    // Cq
    //

    // _CqBinding

    function _CqBinding(opList, bindingTest, trueFunc, falseFunc) {
        this._opList = opList;
        
        this._bindingTest = bindingTest;
        this._trueFunc = trueFunc;
        this._falseFunc = falseFunc;

        this._lastTest = undefined;
        this._testing = false;

        this._debug = false;
        this._label = null;
        
        for(var i=0; i < opList.length; ++i) {
            opList[i]._bind(this);
        }
    }

    _CqBinding.prototype = _Extend(_CqObject.prototype, {
        unbind: function _CqBinding_unbind() {
            for(var i=0; i<this._opList.length; ++i) {
                this._opList[i]._unbind(this);
            }
        },

        _test: function _CqBinding__test() {
            if (!this._testing) {
                if (this._debug)
                    _debugLog("CqBinding beginTest <" + (this._label ? this._label : "null") + ">", 2);

                this._testing = true;
                var test = this._bindingTest(this._debug);
                if (test !== undefined) {
                    if (this._debug)
                        _debugLog("CqBinding firing <" + (this._label ? this._label : "null") + "> handler <" + String(test) + ">");
                    if (test && this._trueFunc)
                        this._trueFunc();
                    else if(!test && this._falseFunc)
                        this._falseFunc();
                } else if (this._debug)
                    _debugLog("CqBinding ignoring <" + (this._label ? this._label : "null") + "> handler <" + String(test) + ">");

                this._lastTest = test;
                this._testing = false;

                if (this._debug)
                    _debugLog("CqBinding endTest <" + (this._label ? this._label : "null") + ">", -2);
            }
        },

        _setLabel: function _CqBinding__setLabel(label) {
            this._label = label;
            return this;
        },

        last: function _CqBinding_last() {
            return this._lastTest;
        }
    });

    // Cq

    function Cq(value, /*opt*/ min, /*opt*/ max) {       
        this._value = value;

        this._lastValue = undefined;
        this._boundTo = new _Set();
        this._wasSet = false;
        this._wasChanged = false;

        // optional valid range of values for setting.
        this._min = min;
        this._max = max;

        // Webkit browsers
        Object.defineProperty(this, "v", {
            get : this._getValue,
            set : this._setValue
        });
    }

    Cq.prototype = _Extend(_CqObject.prototype, {
        // FF, MSIE
        get v() { return this._getValue(); },
        set v(value) { this._setValue(value); },
        
        _getValue: function Cq__getValue() {
            return this._value;
        },

        _setValue: function Cq__setValue(val) {
            if ((this._min !== undefined && val < this._min) ||
                (this._max !== undefined && val > this._max))
                return;

            this._wasSet = true;
            if (this._value != val) {
                this._lastValue = this._value;
                this._value = val
                this._wasChanged = true;
            }
            this._boundTo.map( function(binding) {
                binding._test();
            });
            this._wasChanged = false;                
            this._wasSet = false;
        },

        // Value operations inside of test

        set: function Cq_set() {
            return this._wasSet;
        },
        
        changed: function Cq_changed() {
            return this._wasChanged;
        },
        
        last: function Cq_last() {
            return this._lastValue;
        },

        // Binding

        _bind: function Cq__bind(binding) {
            this._boundTo.insert(binding);
        },
    
        _unbind: function Cq__unbind(binding) {
            this._boundTo.remove(binding);
        }
    });
    
    // CqBind

    function CqBind(opList, test, trueFunc, falseFunc) {
        return new _CqBinding(opList, test, trueFunc, falseFunc);
    }
    
    // CqSet
    
    function CqSet() {
        this._set = new Set();
    }
    
    CqSet.prototype = _Extend(_CqObject.prototype, {
        insert: function CqSet_insert(binding) {
            this._set.insert(binding);
        },

        remove: function CqSet_remove(binding) {
            this._set.remove(binding);
        },

        unbind: function CqSet_unbind() {
            this._set.map( function(binding) {
                binding.unbind();
            });
        }
    });
    
    // Exports

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Cq;
        Cq.Cq = Cq;
        Cq.CqBind = CqBind;
        Cq._CqDebugLog = _debugLog;
    } else {
        root.Cq = Cq;
        root.CqBind = CqBind;
        root._CqDebugLog = _debugLog;
    }
    
    Cq.VERSION = '0.1.0';

})();
