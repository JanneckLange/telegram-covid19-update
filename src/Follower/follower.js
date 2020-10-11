"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var FollowerSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    username: String,
    regionId0: String,
    regionId1: String,
});
var FollowerModel = mongoose.model('Follower', FollowerSchema);
exports.FollowerModel = FollowerModel;
