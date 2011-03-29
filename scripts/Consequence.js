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
