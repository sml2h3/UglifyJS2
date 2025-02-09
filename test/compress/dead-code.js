dead_code_1: {
    options = {
        dead_code: true,
    }
    input: {
        function f() {
            a();
            b();
            x = 10;
            return;
            if (x) {
                y();
            }
        }
    }
    expect: {
        function f() {
            a();
            b();
            x = 10;
            return;
        }
    }
}

dead_code_2_should_warn: {
    options = {
        dead_code: true,
    }
    input: {
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            // completely discarding the `if` would introduce some
            // bugs.  UglifyJS v1 doesn't deal with this issue; in v2
            // we copy any declarations to the upper scope.
            if (x) {
                y();
                var x;
                function g(){};
                // but nested declarations should not be kept.
                (function(){
                    var q;
                    function y(){};
                })();
            }
        }
        f();
    }
    expect: {
        function f() {
            g();
            x = 10;
            throw new Error("foo");
            var x;
            function g(){};
        }
        f();
    }
    expect_stdout: true
    node_version: "<=4"
}

dead_code_constant_boolean_should_warn_more: {
    options = {
        booleans: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        loops: true,
        side_effects: true,
    }
    input: {
        while (!((foo && bar) || (x + "0"))) {
            console.log("unreachable");
            var foo;
            function bar() {}
        }
        for (var x = 10, y; x && (y || x) && (!typeof x); ++x) {
            asdf();
            foo();
            var moo;
        }
        bar();
    }
    expect: {
        var foo;
        function bar() {}
        // nothing for the while
        // as for the for, it should keep:
        var moo;
        var x = 10, y;
        bar();
    }
    expect_stdout: true
    node_version: "<=4"
}

try_catch_finally: {
    options = {
        conditionals: true,
        dead_code: true,
        evaluate: true,
        passes: 2,
        side_effects: true,
    }
    input: {
        var a = 1;
        !function() {
            try {
                if (false) throw x;
            } catch (a) {
                var a = 2;
                console.log("FAIL");
            } finally {
                a = 3;
                console.log("PASS");
            }
        }();
        try {
            console.log(a);
        } finally {
        }
    }
    expect: {
        var a = 1;
        !function() {
            var a;
            a = 3;
            console.log("PASS");
        }();
        try {
            console.log(a);
        } finally {
        }
    }
    expect_stdout: [
        "PASS",
        "1",
    ]
}

accessor: {
    options = {
        side_effects: true,
    }
    input: {
        ({
            get a() {},
            set a(v){
                this.b = 2;
            },
            b: 1
        });
    }
    expect: {}
}

issue_2233_1: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unsafe: true,
    }
    input: {
        Array.isArray;
        Boolean;
        console.log;
        Date;
        decodeURI;
        decodeURIComponent;
        encodeURI;
        encodeURIComponent;
        Error.name;
        escape;
        eval;
        EvalError;
        Function.length;
        isFinite;
        isNaN;
        JSON;
        Math.random;
        Number.isNaN;
        parseFloat;
        parseInt;
        RegExp;
        Object.defineProperty;
        String.fromCharCode;
        RangeError;
        ReferenceError;
        SyntaxError;
        TypeError;
        unescape;
        URIError;
    }
    expect: {}
    expect_stdout: true
}

global_timeout_and_interval_symbols: {
    options = {
        pure_getters: "strict",
        side_effects: true,
        unsafe: true,
    }
    input: {
        // These global symbols do not exist in the test sandbox
        // and must be tested separately.
        clearInterval;
        clearTimeout;
        setInterval;
        setTimeout;
    }
    expect: {}
}

issue_2233_2: {
    options = {
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var RegExp;
        Array.isArray;
        RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Math.sin;
            Number.isNaN;
        }
    }
    expect: {
        var RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Number.isNaN;
        }
    }
}

issue_2233_3: {
    options = {
        pure_getters: "strict",
        reduce_funcs: true,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        unsafe: true,
        unused: true,
    }
    input: {
        var RegExp;
        Array.isArray;
        RegExp;
        UndeclaredGlobal;
        function foo() {
            var Number;
            AnotherUndeclaredGlobal;
            Math.sin;
            Number.isNaN;
        }
    }
    expect: {
        UndeclaredGlobal;
    }
}

global_fns: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        Boolean(1, 2);
        decodeURI(1, 2);
        decodeURIComponent(1, 2);
        Date(1, 2);
        encodeURI(1, 2);
        encodeURIComponent(1, 2);
        Error(1, 2);
        escape(1, 2);
        EvalError(1, 2);
        isFinite(1, 2);
        isNaN(1, 2);
        Number(1, 2);
        Object(1, 2);
        parseFloat(1, 2);
        parseInt(1, 2);
        RangeError(1, 2);
        ReferenceError(1, 2);
        String(1, 2);
        SyntaxError(1, 2);
        TypeError(1, 2);
        unescape(1, 2);
        URIError(1, 2);
        try {
            Function(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            RegExp(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            Array(NaN);
        } catch (e) {
            console.log(e.name);
        }
    }
    expect: {
        try {
            Function(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            RegExp(1, 2);
        } catch (e) {
            console.log(e.name);
        }
        try {
            Array(NaN);
        } catch (e) {
            console.log(e.name);
        }
    }
    expect_stdout: [
        "SyntaxError",
        "SyntaxError",
        "RangeError",
    ]
}

collapse_vars_assignment: {
    options = {
        collapse_vars: true,
        dead_code: true,
        passes: 2,
        unused: true,
    }
    input: {
        function f0(c) {
            var a = 3 / c;
            return a = a;
        }
    }
    expect: {
        function f0(c) {
            return 3 / c;
        }
    }
}

collapse_vars_lvalues_drop_assign: {
    options = {
        collapse_vars: true,
        dead_code: true,
        unused: true,
    }
    input: {
        function f0(x) { var i = ++x; return x += i; }
        function f1(x) { var a = (x -= 3); return x += a; }
        function f2(x) { var z = x, a = ++z; return z += a; }
    }
    expect: {
        function f0(x) { var i = ++x; return x + i; }
        function f1(x) { var a = (x -= 3); return x + a; }
        function f2(x) { var z = x, a = ++z; return z + a; }
    }
}

collapse_vars_misc1: {
    options = {
        collapse_vars: true,
        dead_code: true,
        unused: true,
    }
    input: {
        function f10(x) { var a = 5, b = 3; return a += b; }
        function f11(x) { var a = 5, b = 3; return a += --b; }
    }
    expect: {
        function f10(x) { return 5 + 3; }
        function f11(x) { var b = 3; return 5 + --b; }
    }
}

return_assignment: {
    options = {
        dead_code: true,
        unused: true,
    }
    input: {
        function f1(a, b, c) {
            return a = x(), b = y(), b = a && (c >>= 5);
        }
        function f2() {
            return e = x();
        }
        function f3(e) {
            return e = x();
        }
        function f4() {
            var e;
            return e = x();
        }
        function f5(a) {
            try {
                return a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6(a) {
            try {
                return a = x();
            } finally {
                console.log(a);
            }
        }
        function y() {
            console.log("y");
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6 ].forEach(function(f, i) {
                e = null;
                try {
                    i += 1;
                    console.log("result " + f(10 * i, 100 * i, 1000 * i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== e) console.log("e: " + e);
            });
        }
        var x, e;
        test(1);
        test(-1);
    }
    expect: {
        function f1(a, b, c) {
            return a = x(), y(), a && (c >> 5);
        }
        function f2() {
            return e = x();
        }
        function f3(e) {
            return x();
        }
        function f4() {
            return x();
        }
        function f5(a) {
            try {
                return x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6(a) {
            try {
                return a = x();
            } finally {
                console.log(a);
            }
        }
        function y() {
            console.log("y");
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6 ].forEach(function(f, i) {
                e = null;
                try {
                    i += 1;
                    console.log("result " + f(10 * i, 100 * i, 1000 * i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== e) console.log("e: " + e);
            });
        }
        var x, e;
        test(1);
        test(-1);
    }
    expect_stdout: [
        "y",
        "result 31",
        "result 2",
        "e: 2",
        "result 3",
        "result 4",
        "result 5",
        "6",
        "result 6",
        "caught -1",
        "caught -2",
        "caught -3",
        "caught -4",
        "50",
        "result undefined",
        "60",
        "caught -6",
    ]
}

throw_assignment: {
    options = {
        dead_code: true,
        unused: true,
    }
    input: {
        function f1() {
            throw a = x();
        }
        function f2(a) {
            throw a = x();
        }
        function f3() {
            var a;
            throw a = x();
        }
        function f4() {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f5(a) {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6() {
            var a;
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f7() {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f8(a) {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f9() {
            var a;
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6, f7, f8, f9 ].forEach(function(f, i) {
                a = null;
                try {
                    f(10 * (1 + i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== a) console.log("a: " + a);
            });
        }
        var x, a;
        test(1);
        test(-1);
    }
    expect: {
        function f1() {
            throw a = x();
        }
        function f2(a) {
            throw x();
        }
        function f3() {
            throw x();
        }
        function f4() {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f5(a) {
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f6() {
            var a;
            try {
                throw a = x();
            } catch (b) {
                console.log(a);
            }
        }
        function f7() {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f8(a) {
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function f9() {
            var a;
            try {
                throw a = x();
            } finally {
                console.log(a);
            }
        }
        function test(inc) {
            var counter = 0;
            x = function() {
                counter += inc;
                if (inc < 0) throw counter;
                return counter;
            };
            [ f1, f2, f3, f4, f5, f6, f7, f8, f9 ].forEach(function(f, i) {
                a = null;
                try {
                    f(10 * (1 + i));
                } catch (x) {
                    console.log("caught " + x);
                }
                if (null !== a) console.log("a: " + a);
            });
        }
        var x, a;
        test(1);
        test(-1);
    }
    expect_stdout: [
        "caught 1",
        "a: 1",
        "caught 2",
        "caught 3",
        "4",
        "a: 4",
        "5",
        "6",
        "7",
        "caught 7",
        "a: 7",
        "8",
        "caught 8",
        "9",
        "caught 9",
        "caught -1",
        "caught -2",
        "caught -3",
        "null",
        "50",
        "undefined",
        "null",
        "caught -7",
        "80",
        "caught -8",
        "undefined",
        "caught -9",
    ]
}

issue_2597: {
    options = {
        dead_code: true,
    }
    input: {
        function f(b) {
            try {
                try {
                    throw "foo";
                } catch (e) {
                    return b = true;
                }
            } finally {
                b && (a = "PASS");
            }
        }
        var a = "FAIL";
        f();
        console.log(a);
    }
    expect: {
        function f(b) {
            try {
                try {
                    throw "foo";
                } catch (e) {
                    return b = true;
                }
            } finally {
                b && (a = "PASS");
            }
        }
        var a = "FAIL";
        f();
        console.log(a);
    }
    expect_stdout: "PASS"
}

issue_2666: {
    options = {
        dead_code: true,
    }
    input: {
        function f(a) {
            return a = {
                p: function() {
                    return a;
                }
            };
        }
        console.log(typeof f().p());
    }
    expect: {
        function f(a) {
            return a = {
                p: function() {
                    return a;
                }
            };
        }
        console.log(typeof f().p());
    }
    expect_stdout: "object"
}

issue_2692: {
    options = {
        dead_code: true,
        reduce_vars: false,
    }
    input: {
        function f(a) {
            return a = g;
            function g() {
                return a;
            }
        }
        console.log(typeof f()());
    }
    expect: {
        function f(a) {
            return a = g;
            function g() {
                return a;
            }
        }
        console.log(typeof f()());
    }
    expect_stdout: "function"
}

issue_2701: {
    options = {
        dead_code: true,
        inline: false,
    }
    input: {
        function f(a) {
            return a = function() {
                return function() {
                    return a;
                };
            }();
        }
        console.log(typeof f()());
    }
    expect: {
        function f(a) {
            return a = function() {
                return function() {
                    return a;
                };
            }();
        }
        console.log(typeof f()());
    }
    expect_stdout: "function"
}

issue_2749: {
    options = {
        dead_code: true,
        inline: true,
        toplevel: true,
        unused: true,
    }
    input: {
        var a = 2, c = "PASS";
        while (a--)
            (function() {
                return b ? c = "FAIL" : b = 1;
                try {
                } catch (b) {
                    var b;
                }
            })();
        console.log(c);
    }
    expect: {
        var a = 2, c = "PASS";
        while (a--)
            b = void 0, b ? c = "FAIL" : b = 1;
        var b;
        console.log(c);
    }
    expect_stdout: "PASS"
}

unsafe_builtin: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        (!w).constructor(x);
        Math.abs(y);
        [ 1, 2, z ].valueOf();
    }
    expect: {
        w, x;
        y;
        z;
    }
}

issue_2860_1: {
    options = {
        dead_code: true,
        evaluate: true,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            return a ^= 1;
        }());
    }
    expect: {
        console.log(function(a) {
            return 1 ^ a;
        }());
    }
    expect_stdout: "1"
}

issue_2860_2: {
    options = {
        dead_code: true,
        evaluate: true,
        inline: true,
        passes: 2,
        reduce_vars: true,
    }
    input: {
        console.log(function(a) {
            return a ^= 1;
        }());
    }
    expect: {
        console.log(1);
    }
    expect_stdout: "1"
}

issue_2929: {
    options = {
        dead_code: true,
    }
    input: {
        console.log(function(a) {
            try {
                return null.p = a = 1;
            } catch (e) {
                return a ? "PASS" : "FAIL";
            }
        }());
    }
    expect: {
        console.log(function(a) {
            try {
                return null.p = a = 1;
            } catch (e) {
                return a ? "PASS" : "FAIL";
            }
        }());
    }
    expect_stdout: "PASS"
}

unsafe_string_replace: {
    options = {
        side_effects: true,
        unsafe: true,
    }
    input: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect: {
        "foo".replace("f", function() {
            console.log("PASS");
        });
    }
    expect_stdout: "PASS"
}

issue_3402: {
    options = {
        dead_code: true,
        evaluate: true,
        functions: true,
        passes: 2,
        reduce_vars: true,
        side_effects: true,
        toplevel: true,
        typeofs: true,
        unused: true,
    }
    input: {
        var f = function f() {
            f = 42;
            console.log(typeof f);
        };
        "function" == typeof f && f();
        "function" == typeof f && f();
        console.log(typeof f);
    }
    expect: {
        function f() {
            console.log(typeof f);
        }
        f();
        f();
        console.log(typeof f);
    }
    expect_stdout: [
        "function",
        "function",
        "function",
    ]
}

issue_3406: {
    options = {
        dead_code: true,
    }
    input: {
        console.log(function f(a) {
            return delete (f = a);
        }());
    }
    expect: {
        console.log(function f(a) {
            return delete (0, a);
        }());
    }
    expect_stdout: "true"
}

function_assign: {
    options = {
        dead_code: true,
    }
    input: {
        console.log(function() {
            var a = "PASS";
            function h(c) {
                return c;
            }
            h.p = function(b) {
                return b;
            }.p = a;
            return h;
        }().p);
    }
    expect: {
        console.log(function() {
            var a = "PASS";
            function h(c) {
                return c;
            }
            h.p = a;
            return h;
        }().p);
    }
    expect_stdout: "PASS"
}

issue_3552: {
    options = {
        dead_code: true,
        pure_getters: "strict",
    }
    input: {
        var a = "PASS";
        (function() {
            (1..p += 42) && (a = "FAIL");
        })();
        console.log(a);
    }
    expect: {
        var a = "PASS";
        (function() {
            (1..p += 42) && (a = "FAIL");
        })();
        console.log(a);
    }
    expect_stdout: "PASS"
}
