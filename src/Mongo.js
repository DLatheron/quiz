const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

module.exports = () => {
    const connectionUri = "mongodb://Quiz:{wj+dPB0`7-ta4wRensZVG9OXs@cluster0-shard-00-00-upqcx.mongodb.net:27017,cluster0-shard-00-01-upqcx.mongodb.net:27017,cluster0-shard-00-02-upqcx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";

    let mongoDb;

    return {
        connect: (next) => {
            MongoClient.connect(connectionUri, function (error, db) {
                mongoDb = db;
                next(error, db);
            });
        },
        disconnect: () => {
            mongoDb.disconnect();
        },
        getQuestion: (callback) => {
            const questions = mongoDb.collection('Questions');
            questions.findOne({}, (error, question) => {
                callback(question);
            });
        }
    };
};
