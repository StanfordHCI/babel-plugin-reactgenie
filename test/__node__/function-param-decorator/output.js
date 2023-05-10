"use strict";

var _based = _interopRequireDefault(require("based"));

var _decorator = _interopRequireDefault(require("decorator"));

var _some = require("some");

var _graphql = require("@nestjs/graphql");

var _xyz = require("xyz");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _class, _class2, _class3;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

class SomeClass {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

}

let Named = (_dec = function (target, key) {
  return (0, _decorator.default)(_some.Some)(target, undefined, 0);
}, _dec2 = function (target, key) {
  return (0, _decorator.default)(target, undefined, 1);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _some.Some === "undefined" ? "Some" : _some.Some, typeof _some.Some === "undefined" ? "Some" : _some.Some]), _dec5 = (0, _based.default)(), _dec6 = function (target, key) {
  return (0, _graphql.Args)()(target, key, 0);
}, _dec7 = function (target, key) {
  return (0, _graphql.Context)()(target, key, 1);
}, _dec8 = function (target, key) {
  return (0, _decorator.default)(_xyz.Xyz)(target, key, 2);
}, _dec9 = Reflect.metadata("design:type", Function), _dec10 = Reflect.metadata("design:paramtypes", [typeof _graphql.Args === "undefined" ? "Args" : _graphql.Args, typeof _graphql.Context === "undefined" ? "Context" : _graphql.Context, Object]), _dec11 = Reflect.metadata("design:returntype", "void"), _dec12 = (0, _based.default)(), _dec13 = Reflect.metadata("design:type", Function), _dec14 = Reflect.metadata("design:paramtypes", [String, Number, Boolean]), _dec15 = Reflect.metadata("design:returntype", Number), _dec16 = Reflect.metadata("design:is_static", true), _dec17 = (0, _based.default)(), _dec18 = Reflect.metadata("design:type", Function), _dec19 = Reflect.metadata("design:paramtypes", [Object]), _dec20 = Reflect.metadata("design:returntype", String), _dec21 = Reflect.metadata("design:destructuringparamtypes", [{
  arg1: String,
  arg2: Number,
  arg3: {
    elementType: typeof SomeClass === "undefined" ? "SomeClass" : SomeClass,
    type: Array
  }
}]), _dec22 = (0, _based.default)(), _dec23 = Reflect.metadata("design:type", Function), _dec24 = Reflect.metadata("design:paramtypes", []), _dec25 = Reflect.metadata("design:returntype", {
  elementType: typeof SomeClass === "undefined" ? "SomeClass" : SomeClass,
  type: Array
}), (0, _based.default)(_class = _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = (_class3 = class Named {
  constructor(param, param2) {
    this.param = param;
    this.param2 = param2;
    this.memberProperty = "member";
  }

  methodName(args, context, xyz) {}

  static staticMethod(arg1, arg2, arg3) {
    return 0;
  }

  destructuringMethod({
    arg1,
    arg2 = 0,
    arg3
  }) {
    return "success";
  }

  arrayMethod() {
    return [new SomeClass("a", 1, true)];
  }

}, _class3.staticProperty = 0, _class3), (_applyDecoratedDescriptor(_class2.prototype, "methodName", [_dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "methodName"), _class2.prototype), _applyDecoratedDescriptor(_class2, "staticMethod", [_dec12, _dec13, _dec14, _dec15, _dec16], Object.getOwnPropertyDescriptor(_class2, "staticMethod"), _class2), _applyDecoratedDescriptor(_class2.prototype, "destructuringMethod", [_dec17, _dec18, _dec19, _dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "destructuringMethod"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "arrayMethod", [_dec22, _dec23, _dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "arrayMethod"), _class2.prototype)), _class2)) || _class) || _class) || _class) || _class) || _class);

function testFunction({
  arg1,
  arg2 = 0,
  arg3
}) {
  return "success";
}
