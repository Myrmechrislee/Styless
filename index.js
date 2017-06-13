#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const package = require("./package.json");
var bash = require("commander");
__dirname = process.cwd();
var now = new Date();


bash
    .version(package.version)
    .usage("<cmd> [options...]")
    .on('--help', function() {
        console.log(" Commands:\n")
        console.log("\t- help\t\t === displays help")
        console.log("\t- create\t === creates an unpackaged file")
        console.log("\t- package\t === packages the file")
        console.log("\t- disp\t\t === displays the packaged file")
    })
    .parse(process.argv);

function createError (msg, a, apos1, apos2) {
    console.log("Error:".bgRed.white, msg.red)
    if(a) {
        var a = [a.slice(0, apos1), a.slice(apos1, apos2).underline, a.slice(apos2, a.length)];
        console.log(a.join(""));
    }
    process.exit(1);
}
function create(name) {
    if(!name){
        createError("missing file name")
        return;
    }
    fs.writeFileSync(path.join(__dirname, name) + ".termdoc.json", JSON.stringify({
        "title": "",
        "styles": {
            "title": ["bold", "green"]
        },
        "body": {},
        "meta": {
            "version": package.version,
            "date-created": [now.getDate(), now.getMonth(), now.getFullYear()].join("/") + " " + now.getHours() + ":" + now.getMinutes() + "." + now.getSeconds(),
            "joinWith": "\n"
        }
    }, "", 4))
}
function packageFile(fname) {
    if(!fname){
        createError("missing file name")
        return;
    }
    var out = "";
    function getKeys(Obj) {
        var results = [];
        for(var x in Obj) {
            if(x != '_keys') {
                results.push(x);
            }
        }
        return results;
    }
    var file = {}
    file = require(path.join(__dirname, fname + ".termdoc.json"));
    out += styler(file.title, file.styles["title"]) + "\n"
    getKeys(file.body).forEach(function(item) {
        if(getKeys(file.styles).indexOf(item) > -1) {
            out += styler(file.body[item], file.styles[item], file.styles) + file.meta.joinWith;
        } else {
            out += "\x1B[0m" + file.body[item] + file.meta.joinWith;
        };
    });
    fs.writeFileSync(path.join(__dirname, fname + ".styless.pack"), out.toString().replace(/\n/g, "\\n"));
    console.log("Sucessfully Packaged!".green)
}
function styler(txt, st, dict) {
    var o = txt;
    st.forEach(function(item) {
        if(o[item]) {
            o = o[item] + "\x1B[0m"
        } else {
            var searchFor = '"' + item + '"';
            createError("Unknown style `" + item + "`", JSON.stringify(dict, undefined, 4), JSON.stringify(dict, undefined, 4).indexOf(searchFor), JSON.stringify(dict, undefined, 4).indexOf(searchFor) + searchFor.length);
        }
    });
    return o;
}
function testS(fname) {
    if(!fname){
        createError("missing file name")
        return;
    }
    var out = "";
    function getKeys(Obj) {
        var results = [];
        for(var x in Obj) {
            if(x != '_keys') {
                results.push(x);
            }
        }
        return results;
    }
    var file = {}
    file = require(path.join(__dirname, fname + ".termdoc.json"));
    out += styler(file.title, file.styles["title"]) + "\n"
    getKeys(file.body).forEach(function(item) {
        if(getKeys(file.styles).indexOf(item) > -1) {
            out += styler(file.body[item], file.styles[item], file.styles) + file.meta.joinWith;
        } else {
            out += "\x1B[0m" + file.body[item] + file.meta.joinWith;
        };
    });
    console.log(out.toString())
}

function parseCMD(cmd){
    switch (cmd[0]) {
        case "help":
            console.log(bash.outputHelp());
            break;
        case "create":
            create(cmd[1]);
            console.log("Sucessfully Created!".green);
            break;
        case "package":
            packageFile(cmd[1])
            break;
        case "disp":
            console.log(fs.readFileSync(path.join(__dirname, cmd[1] + ".styless.pack")).toString().replace(/\\n/g, "\n") + "\x1B[0m\n");
            break;
        case "test":
            testS(cmd[1])
            break;
        default:
            createError(`unknown command '${cmd[0]}'`);
            break;
    }
}
parseCMD(bash.args)