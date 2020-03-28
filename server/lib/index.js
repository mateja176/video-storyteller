"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var request_1 = __importDefault(require("request"));
dotenv_1.default.config();
var app = express_1.default();
app.get('/token', function (req, res) {
    request_1.default.post('https://www.iconfinder.com/api/v3/oauth2/token', {
        form: {
            grant_type: 'jwt_bearer',
            client_id: process.env.ICONFINDER_CLIENT_ID,
            client_secret: process.env.ICONFINDER_CLIENT_SECRET,
        },
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        }
        else {
            console.log(error, response, body);
        }
    });
});
var port = process.env.PORT || 3001;
var origin = "http://localhost:" + port;
app.listen(port, function () { return console.log(origin); });
