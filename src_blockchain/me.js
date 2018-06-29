"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var Me = /** @class */ (function () {
    function Me() {
        this.name = "";
        this.file = 'user.txt';
    }
    Me.prototype.load = function () {
        if (fs_1.existsSync(this.file)) {
            var buffer = fs_1.readFileSync(this.file, 'utf8');
            this.name = buffer.toString();
        }
    };
    Me.prototype.save = function () {
        if (!fs_1.existsSync(this.file)) {
            fs_1.writeFileSync(this.file, this.name);
        }
    };
    return Me;
}());
exports.Me = Me;
