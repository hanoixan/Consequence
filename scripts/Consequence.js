/*
 * Consequence.js
 * 
 * Consequence is a Javascript library for reactive programming:
 * http://en.wikipedia.org/wiki/Reactive_programming
 * 
 * That is, one can set state that, when satisfied at any time, results in the 
 * execution of bound imperative functions.
 * 
 * In the traditional imperitive model, it is the responsibility of the programmer to
 * write constructs that regularly check whether state has been satisfied in order
 * to execute subsequent instructions. In the Consequence.js reactive programming 
 * model, a binding is made between the state which must be satisfied at some point 
 * in the future, and the code which handles the affirmative and negative results of that state.
 * 
 * Consequence.js provides a method chain language for creating state clauses which are
 * bound to function handlers. The function handlers, by default, only fire when the state
 * clause's final result changes. This can be overridden with explicit methods set(), get(),
 * and change(). These cause the handlers to fire every time based on a Cq object's .v
 * member being written to, read from, and changed, respectively.
 *
 * E.g.,
 * 
 *   // Set variables
 *   var a = new Cq(0);
 *   var b = new Cq("apple");
 * 
 *   // Define binding
 *   var binding = a.eq(1).and(b.eq("apple")).bind( function() {
 *     // state satisfied, do something. This is the affirmative handler, which is required.
 *     window.alert("State satisfied!");
 *   }, function() {
 *     // state not satisfied, do nothing. This is the negative handler, which is optional.
 *   });
 *
 *   // Satisfy the state, causing the window the pop up.
 *   a.v = 1;
 * 
 *   // Cleanup
 *   binding.free();
 * 
 * The state clause's operators can also handle arbitrary numbers of operators.
 * 
 *   var binding = a.and(b).and(c).and(d).bind( function(){ ... } );
 * 
 * Of course, the following is more concise:
 * 
 *   var binding = a.and(b,c,d).bind( function(){ ... } );
 * 
 * Consequence.js attempts to be efficient about checking this state by only evaluating 
 * when a dependency Cq variable has been modified, and using short circuit logic when
 * possible.
 * 
 * This library can be used when a programmer would rather say "whenever some complex 
 * state set X happens, do Y, and let me not worry about when", instead of 
 * "whenever I can, check whether some complex state set X is happening and do Y".
 * Example domains where this could be useful are games state, UI, and event systems.
 * 
 * * * *
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
 */

(function() {

    // Setup
    //
    
    var root = this;
    var previousCq = root.Cq;

    // Util
    //
    
    function isArray(obj) {
        return obj.constructor == Array;
    }

    // Set

    function Set() {
        this._array = new Array();
    }
    
    Set.prototype = {
        find: function Set_find(item) {
            if (item.uniqueId == null)
                return this._array[item];
            else
                return this._array[item.uniqueId()];            
        },

        insert: function Set_insert(item) {
            if (item.uniqueId == null)
                this._array[item] = item;
            else
                this._array[item.uniqueId()] = item;
        },

        remove: function Set_remove(item) {
            if (item.uniqueId == null)
                delete this._array[item];
            else
                delete this._array[item.uniqueId()];
        },
        
        forEach: function Set_forEach(func) {
            this._array.forEach( function(item) {
                func(item);
            });
        }
    };

    // Extend

    function Extend(sup, sub) {
        return $.extend({}, sup, sub);
    }

    // CqObject
    
    var __TheCqObjectId = 0;
    
    function CqObject() {
    }
    
    CqObject.prototype = {
        uniqueId: function() {
          var newId = __TheCqObjectId++;
          this.uniqueId = function(){ return newId; }
          return newId;
        }
    };

    // Cq
    //

    // CqBinding

    function CqBinding(op, trueFunc, falseFunc) {
        var self = this;
        this._op = op;
        this._explicit = false;
        this._trueFunc = trueFunc;
        this._falseFunc = falseFunc;
        this._opLastResult = false;
    }

    CqBinding.prototype = Extend(CqObject.prototype, {
        unbind: function CqBinding_free() {
            this._op.freeChildren(this);
        },

        test: function CqBinding_test() {
            var opResult = this._op._test();
            if ((opResult != this._opLastResult) || this._explicit) {
                if (opResult && this._trueFunc)
                    this._trueFunc();
                else if(!opResult && this._falseFunc)
                    this._falseFunc();
            }
            this._opLastResult = opResult;
        }
    });
    
    // CqOp
    
    function CqOp(test, opList) {
        this._test = test;
        this._opList = opList;
        this._isCqOp = true;
        this._class = null;
    }

    CqOp.prototype = Extend(CqObject.prototype, {

        // Utility
        
        isCqOp: function CqOp_isCqOp(op) {
            return ((typeof(op) == "object") && (op != null) && (op._isCqOp == true));
        },

        // Internal

        // iterFunc: iterative computation between current op and next
        // stopFunc: optional condition of last computated result such that we stop chaining and accept result
        _wrap: function CqOp__wrap(args, iterFunc, stopFunc) {
            var allOps = [this];
            var argLen = args.length;
            for (var a = 0; a < argLen; a++) {
                var realOp;
                var op = args[a];
                
                if (this.isCqOp(op))
                    realOp = op;
                else if (typeof(op) == "function")
                    realOp = new CqOp(op, []);
                else
                    realOp = new Cq(op);

                allOps.push(realOp);
            }
            
            var test = function CqOp__wrap_test() {
                var len = allOps.length;
                if (len == 1)
                    return iterFunc(allOps[0]._test());
                else {
                    var lastOpTest = allOps[0]._test();
                    var result = undefined;
                    for (var i=1; i<len && !(stopFunc && stopFunc(result)); i++) {
                        var opTest = allOps[i]._test();
                        result = iterFunc(lastOpTest, opTest, result);
                        lastOpTest = opTest;
                    }
                    return result;
                }
                //Todo: optimize for len == 2, allOps[0] and allOps[1]
            };

            return new CqOp(test, allOps);
        },

        // Operators
        // a: last test result in sequence, b: this test result, r: last result of this function

        // Logic
        
        and: function CqOp_and() {
            return this._wrap(arguments, function(a,b){return a && b;}, function(r){return r === false;});
        },

        or: function CqOp_or() {
            return this._wrap(arguments, function(a,b){return a || b;}, function(r){return r;});
        },

        not: function CqOp_not() {
            return this._wrap(arguments, function(a){return !a;}, function(r){return true;});
        },

        // Comparison

        eq: function CqOp_eq() {
            return this._wrap(arguments, function(a,b){return a == b;}, function(r){return r === false;});
        },

        neq: function CqOp_neq() { 
            return this._wrap(arguments, function(a,b){return a != b;}, function(r){return r === false;});
        },

        eq_: function CqOp_eq_() {
            return this._wrap(arguments, function(a,b){return a === b;}, function(r){return r === false;});
        },

        neq_: function CqOp_neq_() {
            return this._wrap(arguments, function(a,b){return a !== b;}, function(r){return r === false;});
        },

        lt: function CqOp_lt() {
            return this._wrap(arguments, function(a,b){return a < b;}, function(r){return r === false;});
        },

        lte: function CqOp_lte() {
            return this._wrap(arguments, function(a,b){return a <= b;}, function(r){return r === false;});
        },

        gt: function CqOp_gt() {
            return this._wrap(arguments, function(a,b){return a > b;}, function(r){return r === false;});
        },

        gte: function CqOp_gte() {
            return this._wrap(arguments, function(a,b){return a >= b;}, function(r){return r === false;});
        },

        // Numeric

        add: function CqOp_add() {
            return this._wrap(arguments, function(a,b,r){return r === undefined ? a + b : r + b;});
        },

        sub: function CqOp_subtract() {
            return this._wrap(arguments, function(a,b,r){return r === undefined ? a - b : r - b;});
        },

        mul: function CqOp_mul() {
            return this._wrap(arguments, function(a,b,r){return r === undefined ? a * b : r * b;});
        },

        div: function CqOp_div() {
            return this._wrap(arguments, function(a,b,r){return r === undefined ? a / b : r / b;});
        },

        mod: function CqOp_mod() {
            return this._wrap(arguments, function(a,b,r){return r === undefined ? a % b : r % b;});
        },

        neg: function CqOp_neg() {
            return this._wrap(arguments, function(a){return -a;}, function(r){return true;});
        },        

        // Binding
        
        bindChildren: function CqOp_bindChildren(binding) {
            this._opList.forEach(function(item) { 
                item.bindChildren(binding); 
            });
        },

        bind: function CqOp_bind(trueFunc, falseFunc) {
            var newBind = new CqBinding(this, trueFunc, falseFunc);
            this.bindChildren(newBind);
            return newBind;
        },

        freeChildren: function CqOp_freeChildren(binding) {
            this._opList.forEach(function(item) { 
                item.freeChildren(binding); 
            });
        }
    });
    
    // CqExplicitOp
    
    function CqExplicitOp(test, opList) {
        this._test = test;
        this._opList = opList;
        this._isCqOp = true;
        this._class = null;
    }
    
    CqExplicitOp.prototype = Extend(CqOp.prototype, {
        bindChildren: function CqExplicitOp_bindChildren(binding) {
            binding._explicit = true;
            this._opList.forEach(function(item) { 
                item.bindChildren(binding); 
            });
        },
    });

    // Cq

    function Cq(value) {
        this._value = value;
        this._test = function Cq__test(){ return this._value; };
        this._boundTo = new Set();
        this._isCqOp = true;
        this._wasSet = false;
        this._wasGet = false;
        this._wasChanged = false;
        
        Object.defineProperty(this, "v", {
            get : this.getValue,
            set : this.setValue
        });
    }
    
    Cq.prototype = Extend(CqOp.prototype, {
        getValue: function Cq_getValue() {
            this._wasGet = true;
            this._boundTo.forEach( function(binding) {
                binding.test();
            });
            this._wasGet = false;
            return this._value;
        },
    
        setValue: function Cq_setValue(val) {
            this._wasSet = true;
            this._wasChanged = this._value != val;
            if (this._wasChanged)
                this._value = val;
            this._boundTo.forEach( function(binding) {
                binding.test();
            });
            this._wasChanged = false;                
            this._wasSet = false;
        },

        // Operations

        set: function Cq_set() {
            var self = this;
            return new CqExplicitOp(function(){ return self._wasSet; }, [self]);
        },

        get: function Cq_get() {
            var self = this;
            return new CqExplicitOp(function(){ return self._wasGet; }, [self]);
        },      
        
        changed: function Cq_changed() {
            var self = this;
            return new CqExplicitOp(function(){ return self._wasChanged; }, [self]);
        },

        // Binding
    
        bindChildren: function Cq_bindChildren(binding) {
            this._boundTo.insert(binding);
        },
    
        freeChildren: function Cq_freeChildren(binding) {
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
