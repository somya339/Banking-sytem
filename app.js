const express = require("express");
const mongoose = require("mongoose");
const body = require("body-parser");
const _ = require("lodash");
const env = require('dotenv');
env.config();
const app = express();

app.use(body.urlencoded({
    extended: false
}));
app.use(express.static("public"))
app.set("view engine", "ejs");
mongoose.connect(`mongodb+srv://somyagupta:${process.env.DATAKEY}@shop.xcr2h.mongodb.net/product`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const historySchema = mongoose.Schema({
    day: Number,
    month: Number,
    year: Number,
    hour: Number,
    minute: Number,
    From: String,
    To: String,
    status: String,
    amountExchange: Number
});

const History = mongoose.model("History", historySchema);

const userSchema = mongoose.Schema({
    name: String,
    gender: String,
    accountNumber: Number,
    balance: Number,
    phone: Number,
    email: String,
    address: String,
    history: [historySchema]
});

const User = mongoose.model("User", userSchema);

const defaultUserNames = ["Somya Gupta", "George Silton", "Paul Wright", "Mark Waug", "Chris Green", "Helena Paul", "Mary Elizabeth", "Adam Heindarht", "Mack Wang", "Connor Hawke"];
const defaultUsersEmail = ["Somyagupta.un@gmail.com", "george2@gmail.com", "paul3@gmail.com", "mark4@gmail.com", "chris5@gmail.com", "helena6@gmail.com", "mary7@gmail.com", "adam8@gmail.com", "mack9@gmail.com", "connor10@gmail.com"];
const defaultUsersCountry = ["India", "Germany", "USA", "France", "Brazil", "Mexico", "Spain", "Zimbabwe", "Australia", "UAE"];

const defaultUsers = [];
for (let i = 0; i < defaultUserNames.length; i++) {
    if (defaultUserNames[i] === "Mary Elizabeth" || defaultUserNames[i] === "Helena Paul") {
        const newUser = new User({
            name: defaultUserNames[i],
            gender: "Female",
            accountNumber: Math.floor(Math.random() * Math.pow(10, 11)),
            balance: (1000 + Math.floor(Math.random() * 10000)),
            phone: (6 * Math.pow(10, 9) + Math.floor(Math.random() * 3 * Math.pow(10, 9))),
            email: defaultUsersEmail[i],
            address: defaultUsersCountry[Math.floor(Math.random() * 6)],
        });
        defaultUsers.push(newUser);
    } else {
        const newUser = new User({
            name: defaultUserNames[i],
            gender: "Male",
            accountNumber: Math.floor(Math.random() * Math.pow(10, 11)),
            balance: (1000 + Math.floor(Math.random() * 10000)),
            phone: (6 * Math.pow(10, 9) + Math.floor(Math.random() * 3 * Math.pow(10, 9))),
            email: defaultUsersEmail[i],
            address: defaultUsersCountry[Math.floor(Math.random() * 6)],
        });
        defaultUsers.push(newUser);
    }

}


app.get("/", function (req, res) {
    User.find({}, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers.length === 0) {
                User.insertMany(defaultUsers, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                })
                res.redirect("/");
            } else {
                const users = JSON.stringify(defaultUserNames);
                res.render("bank", {
                    usersNames: users
                });
            }
        }
    });

});


app.get("/users", function (req, res) {
    User.find({}, function (err, foundUsers) {
        const users = JSON.stringify(defaultUserNames);
        res.render("users", {
            users: foundUsers,
            usersNames: users
        });
    });
});



app.get("/all-transections", function (req, res) {
    History.find({}, function (err, foundHistory) {
        const users = JSON.stringify(defaultUserNames);
        res.render("history", {
            history: foundHistory,
            usersNames: users
        });
    });
});

app.get("/invalid-search", function (req, res) {
    const users = JSON.stringify(defaultUserNames);
    res.render("invalidSearch", {
        usersNames: users
    });
});


app.post("/search-user", function (req, res) {
    const searchedUser = req.body.user;
    User.find({
        name: searchedUser
    }, function (err, foundUsers) {

        if (foundUsers.length === 0) {

            res.redirect("/invalid-search");
        } else {
            res.redirect("/user-profile/" + searchedUser);
        }
    });
});

app.get("/other-details", function (req, res) {
    const users = JSON.stringify(defaultUserNames);
    res.render("otherDetails", {
        usersNames: users
    });
});


app.post("/user", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/user-profile/" + user.name);
});

app.get("/user-profile/:userName", function (req, res) {
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({
        name: userName
    }, function (err, foundUser) {
        res.render("userProfile", {
            currentUser: foundUser,
            usersNames: users
        });
    });
});

app.post("/transferMoney", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/transferMoney-get/" + user.name);
});

app.get("/transferMoney-get/:userName", function (req, res) {
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({
        name: userName
    }, function (err, foundUser) {
        if (!err) {
            res.render("transferMoney", {
                currentUserBalance: foundUser.balance,
                currentUserName: foundUser.name,
                users: defaultUserNames,
                usersNames: users
            });
        }
    });
});

app.get("/user-history-get/:userName", function (req, res) {
    const userName = req.params.userName;
    const users = JSON.stringify(defaultUserNames);
    User.findOne({
        name: userName
    }, function (err, foundUser) {
        res.render("userHistory", {
            currentUser: foundUser,
            usersNames: users
        })
    });
});

app.post("/user-history", function (req, res) {
    const user = JSON.parse(req.body.user);
    res.redirect("/user-history-get/" + user.name);

});

app.post("/success", function (req, res) {
    const amount = Number(req.body.balance);
    const from = req.body.from;
    const to = req.body.to;

    User.findOne({
        name: from
    }, function (err, sender) {

        updateSenderBalace(sender.balance - amount);
    });

    function updateSenderBalace(newBalance) {
        const date = new Date();
        const newHistory = new History({
            day: date.getDate(),
            month: (date.getMonth() + 1),
            year: date.getFullYear(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            From: from,
            To: to,
            status: "negative",
            amountExchange: amount
        });
        newHistory.save();
        User.findOneAndUpdate({
            name: from
        }, {
            $set: {
                balance: newBalance
            },
            $push: {
                history: newHistory
            }
        }, {
            new: true
        }, function (err, sender) {

        });
    }

    User.findOne({
        name: to
    }, function (err, receiver) {

        updateReceiverBalance(receiver.balance + amount);
    });

    function updateReceiverBalance(newBalance) {
        const date = new Date();
        const newHistory = new History({
            day: date.getDate(),
            month: (date.getMonth() + 1),
            year: date.getFullYear(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            From: to,
            To: from,
            status: "positive",
            amountExchange: amount
        });
        User.findOneAndUpdate({
            name: to
        }, {
            $set: {
                balance: newBalance
            },
            $push: {
                history: newHistory
            }
        }, {
            new: true
        }, function (err, receiver) {

        });
    }

    User.findOne({
        name: from
    }, function (err, user) {
        const remainingAmount = user.balance - amount;
        res.redirect("/success-get/" + amount + "/" + to + "/" + remainingAmount);
    });

});

app.get("/success-get/:amount/:to/:remainingAmount", function (req, res) {
    const users = JSON.stringify(defaultUserNames);
    res.render("success", {
        balance: Number(req.params.amount),
        anotherPerson: req.params.to,
        remainingBalance: Number(req.params.remainingAmount),
        usersNames: users
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}



app.listen(port, function () {
    console.log("App running on port 3000");
});