// DEPENDENCIES
// ============
var express = require("express"),
    i18n = require("i18n"),
    http = require("http"),
    port = (process.env.PORT || 8001),
    app = server = module.exports = express(),
    mysql = require('mysql'),
    fs = require('fs');

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'runnersweb',
    password : 'runnersweb',
    database : 'runnersweb'
});

var debugging = true;

db.connect();


i18n.configure({
    locales:['en', 'pl'],
//    defaultLocale: 'en',
    directory: __dirname + '/locales'
});

// SERVER CONFIGURATION
// ====================
app.configure(function() {
    app.use(i18n.init);
    app.use(express.bodyParser());
    app.use(express["static"](__dirname + "/app"));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
      }));
    app.use(express.cookieParser());
    var store = new express.session.MemoryStore;
    app.use(express.session({ secret: 'whatever', store: store }));

    app.use(server.router);
});




app.listen(port);

var translationFn = function(req,res) {
    res.charset = 'utf-8';
    if((req.params.file && req.params.file.indexOf('..') != -1) || (req.params.dir && req.params.dir.indexOf('..') != -1)) {
        res.send('');
        return false;
    }
    if(typeof req.params.file == 'undefined') {
        req.params.file = 'layout.html';
        req.params.dir = '';
    }

    fs.readFile('app/'+req.params.dir+'/'+req.params.file, 'utf8', function(err,data) {

        data = data.replace(/\[\[\[((?!]]]).)*]]]/g, function(string) {
            string = string.substring(3, string.length-3);
            return res.__(string);
        });

        res.send(data);
    });
}

app.get('/r/:dir/:file', translationFn);
app.get('/', function(req,res) {
    res.charset = 'utf-8';
    var member = '';
    if( typeof req.session.member != 'undefined') {
        member = req.session.member;
    }
    res.cookie('member', JSON.stringify(member));

    translationFn(req,res);
});

app.get('/post/list/global/:page', function(req,res) {

    db.query('SELECT post.id, post.when, member_id, member.first_name, member.last_name, SUBSTRING_INDEX(post.message," ", 40) as message ' +
        'FROM post ' +
        'JOIN member ON (member.id=post.member_id) ' +
        'ORDER BY id DESC ' +
        'LIMIT 20 OFFSET '+(20*(req.params.page-1)), function(err, rows, fields) {
            if (err) throw err;
            res.send({res: rows, state: 0});
        });

});

app.get('/post/list/friends/:page', function(req,res) {
    if( typeof req.session.member == 'undefined' && req.session.member != null) {
        res.send({state: 1, message: res.__('Please sign in or register first')});
    } else {
        var query = 'SELECT post.id, post.when, post.member_id, member.first_name, member.last_name, SUBSTRING_INDEX(post.message," ", 40) as message ' +
            'FROM post ' +
            'JOIN member ON (member.id=post.member_id) ' +
            'LEFT JOIN following ON (followed_member_id=post.member_id AND follower_member_id='+req.session.member.id+') ' +
            'WHERE following.id IS NOT NULL OR post.member_id = ' + req.session.member.id + ' ' +
            'ORDER BY post.id DESC ' +
            'LIMIT 20 OFFSET '+(20*(req.params.page-1));

        if(debugging) {
            console.log(query);
        }

        db.query(query, function(err, rows, fields) {
            if (err) throw err;
            res.send({res: rows, state: 0});
        });
    }
});

app.get('/events/upcoming/short', function(req,res) {
    if( typeof req.session.member != 'undefined'  && req.session.member != null ) {
        var query = 'SELECT event.id, event.name, location.town, country.name as country, COUNT(event_participant.event_id) as friends_attending ' +
            'FROM event ' +
            'JOIN location ON (event.location_id = location.id) ' +
            'JOIN country ON (location.country_id = country.id) ' +
            'LEFT JOIN event_participant ON (event_participant.event_id=event_id AND event_participant.member_id IN (SELECT followed_member_id FROM following WHERE follower_member_id='+req.session.member.id+')) ' +
            'GROUP BY event.id ' +
            'ORDER BY event.when DESC ' +
            'LIMIT 30';
    } else {
        var query = 'SELECT event.id, event.name, location.town, country.name as country, 0 as friends_attending ' +
            'FROM event ' +
            'JOIN location ON (event.location_id = location.id) ' +
            'JOIN country ON (location.country_id = country.id) ' +
            'GROUP BY event.id ' +
            'ORDER BY event.when DESC ' +
            'LIMIT 30';
    }
    if(debugging) {
        console.log(query);
    }

    db.query(query, function(err, rows, fields) {
        if (err) throw err;
        res.send({res: rows, state: 0});
    });
});


app.post('/events/upcoming', function(req,res) {
    if( typeof req.session.member != 'undefined'  && req.session.member != null ) {
        var query = 'SELECT event.id, event.name, event.description, location.town, country.name as country, COUNT(event_participant.event_id) as friends_attending ' +
            'FROM event ' +
            'JOIN location ON (event.location_id = location.id) ' +
            'JOIN country ON (location.country_id = country.id) ' +
            'LEFT JOIN event_participant ON (event_participant.event_id=event_id AND event_participant.member_id IN (SELECT followed_member_id FROM following WHERE follower_member_id='+req.session.member.id+')) ' +
            'WHERE event.when>NOW() ' +
            'GROUP BY event.id ' +
            'ORDER BY event.when DESC '

    } else {
        var query = 'SELECT event.id, event.name, event.description, location.town, country.name as country, 0 as friends_attending ' +
            'FROM event ' +
            'JOIN location ON (event.location_id = location.id) ' +
            'JOIN country ON (location.country_id = country.id) ' +
            'WHERE event.when>NOW() ' +
            'GROUP BY event.id ' +
            'ORDER BY event.when DESC ';
    }
    if(debugging) {
        console.log(query);
    }

    db.query(query, function(err, rows, fields) {
        if (err) throw err;
        res.send({res: rows, state: 0});
    });
});


app.get('/api/me', function(req,res) {
    if( typeof req.session.member != 'undefined' && req.session.member != null) {
        db.query('SELECT member.id, member.first_name, member.last_name, member.email ' +
            'FROM member ' +
            'WHERE member_id = ' + req.session.member.id, function(err, rows, fields) {
            if (err) throw err;
            res.send({res: rows[0], state: 0});
        });
    } else {
        res.send({state: 1});
    }
});


app.post('/api/login', function(req,res) {
    db.query('SELECT member.id, member.first_name, member.last_name, member.email ' +
        'FROM member ' +
        'WHERE member.email = "' + req.param('login') + '" AND member.password="'+req.param('password')+'"'
        , function(err, rows, fields) {
        if (err) throw err;
        if(rows.length > 0){
            req.session.member = rows[0];
            res.send({res: rows[0], state: 0});
        } else {
            res.status(403).send('Forbidden');
        }

    });
});

app.post('/api/logout', function(req,res) {
    req.session.member = null;
    res.send({state: 0});
});

app.get('/api/location/:town', function(req,res) {

    var query = 'SELECT CONCAT(location.town, ", ", country.name) as town, location.id ' +
        'FROM location ' +
        'JOIN country ON (country.id = location.country_id) ' +
        'WHERE location.town LIKE "' + req.params.town + '%" OR location.town_lang LIKE "%,' + req.params.town +'%" GROUP BY location.id ORDER BY population DESC LIMIT 10';

    if(debugging) {
        console.log(query);
    }

    db.query(query
        , function(err, rows, fields) {
            if (err) throw err;

            res.send(rows);


        });

});
