// DEPENDENCIES
// ============
var express = require("express"),
    i18n = require("i18n"),
    http = require("http"),
    port = (process.env.PORT || 8001),
    app = server = module.exports = express(),
    mysql = require('mysql'),
    fs = require('fs');

var debugging = true;

var config = {
    mysql : {
        host     : 'localhost',
        user     : 'runnersweb',
        password : 'runnersweb',
        database : 'runnersweb'
    }
}

function handleDisconnect(myconnection) {
    myconnection.on('error', function(err) {
        console.log('Re-connecting lost connection');
        connection.destroy();
        connection = mysql.createConnection(config.mysql);
        handleDisconnect(connection);
        connection.connect();
    });
}

var db = mysql.createConnection(config.mysql);
handleDisconnect(db);

//var db = connection.getConnection();



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

        data = data.replace(/\$\{currentLanguage\}/g, res.getLocale());
        console.log(res.getLocale());

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

    db.query('SELECT ' +
            'post.id, ' +
            'post.`when`, ' +
            'post.member_id, ' +
            'member.first_name, ' +
            'member.last_name, ' +
            'IF( SUBSTRING_INDEX(post.message," ", 40) = post.message, post.message, CONCAT( SUBSTRING_INDEX(post.message," ", 40) , "...") ) as message, ' +
            'post.location_id, ' +
            'location.town, ' +
            'country.name as country_name, ' +
            'workout.duration, ' +
            'workout.distance, ' +
            'COUNT(comment.id) as comments_count ' +
        'FROM post ' +
        'JOIN member ON (member.id=post.member_id) ' +
        'LEFT JOIN workout ON (post.workout_id=workout.id) ' +
        'LEFT JOIN location ON (post.location_id=location.id) ' +
        'LEFT JOIN country ON (location.country_id=country.id) ' +
        'LEFT JOIN comment ON (comment.post_id=post.id AND comment.deleted_date IS NULL) ' +
        'WHERE post.deleted_date IS NULL ' +
        'GROUP BY post.id ' +
        'ORDER BY id DESC ' +
        'LIMIT 20 OFFSET '+(20*(req.params.page-1)), function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });

});

app.get('/post/list/friends/:page', function(req,res) {

    if( typeof req.session.member == 'undefined' && req.session.member != null) {
        res.send({state: 1, message: res.__('Please sign in or register first')});
    } else {
        var query = 'SELECT ' +
                'post.id, ' +
                'post.`when`, ' +
                'post.member_id, ' +
                'member.first_name, ' +
                'member.last_name, ' +
                'IF( SUBSTRING_INDEX(post.message," ", 40) = post.message, post.message, CONCAT( SUBSTRING_INDEX(post.message," ", 40) , "...") ) as message, ' +
                'post.location_id, ' +
                'location.town, ' +
                'country.name as country_name, ' +
                'workout.duration, ' +
                'workout.distance, ' +
                'COUNT(comment.id) as comments_count ' +
            'FROM post ' +
            'JOIN member ON (member.id=post.member_id) ' +
            'LEFT JOIN workout ON (post.workout_id=workout.id) ' +
            'LEFT JOIN following ON (followed_member_id=post.member_id AND follower_member_id='+req.session.member.id+') ' +
            'LEFT JOIN location ON (post.location_id=location.id) ' +
            'LEFT JOIN country ON (location.country_id=country.id) ' +
            'LEFT JOIN comment ON (comment.post_id=post.id AND comment.deleted_date IS NULL) ' +
            'WHERE post.deleted_date IS NULL AND (following.id IS NOT NULL OR post.member_id = ' + req.session.member.id + ') ' +
            'GROUP BY post.id ' +
            'ORDER BY post.id DESC ' +
            'LIMIT 20 OFFSET '+(20*(req.params.page-1));


        if(debugging) {
            console.log(query);
        }

        db.query(query, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });
    }
});

app.get('/post/list/member/:memberId/:page', function(req,res) {

    if( typeof req.session.member == 'undefined' && req.session.member != null) {
        res.send({state: 1, message: res.__('Please sign in or register first')});
    } else {
        var query = 'SELECT ' +
                'post.id, ' +
                'post.`when`, ' +
                'post.member_id, ' +
                'member.first_name, ' +
                'member.last_name, ' +
                'post.message, ' +
                'post.location_id, ' +
                'location.town, ' +
                'country.name as country_name, ' +
                'workout.duration, ' +
                'workout.distance, ' +
                'COUNT(comment.id) as comments_count ' +
            'FROM post ' +
            'JOIN member ON (member.id=post.member_id) ' +
            'LEFT JOIN workout ON (post.workout_id=workout.id) ' +
            'LEFT JOIN location ON (post.location_id=location.id) ' +
            'LEFT JOIN country ON (location.country_id=country.id) ' +
            'LEFT JOIN comment ON (comment.post_id=post.id AND comment.deleted_date IS NULL) ' +
            'WHERE post.deleted_date IS NULL AND post.member_id = ' + parseInt(req.params.memberId) + ' ' +
            'GROUP BY post.id ' +
            'ORDER BY post.id DESC ' +
            'LIMIT 20 OFFSET '+(20*(req.params.page-1));

        if(debugging) {
            console.log(query);
        }

        db.query(query, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });
    }
});

app.post('/post/add', function(req,res) {

    if( typeof req.session.member == 'undefined' && req.session.member != null) {
        res.send({state: 1, message: res.__('Please sign in or register first')});
    } else {

        var addWorkout = function(form, callback) {
                var location = parseInt(form.location) == 0 ? 'NULL' : parseInt(form.location),
                    distance = parseInt(form.distance) == 0 ? 'NULL' : parseInt(form.distance),
                    duration = parseInt(form.duration) == 0 ? 'NULL' : parseInt(form.duration);

                //var query = 'INSERT INTO workout (`when`, distance, duration, member_id, location_id) VALUES (NOW(), '+distance+','+duration+', '+req.session.member.id+','+location+')';
                var query = 'INSERT INTO workout SET ?';

                if(debugging) {
                    console.log(query);
                }
                db.query(query, {member_id:req.session.member.id, when:new Date(), distance: form.distance, location_id:form.location, duration:form.duration}, function(err, rows, fields) {
                    console.log(err);

                    var query = 'SELECT LAST_INSERT_ID() as workoutId';
                    if(debugging) {
                        console.log(query);
                    }
                    db.query(query, function(err, rows, fields) {
                        console.log(err);
                        if(typeof callback != 'undefined') {
                            callback(rows[0].workoutId);
                        }
                    });
                });
            },

            addPost = function(workoutId) {

                var query = 'INSERT INTO post SET ?';
                if(debugging) {
                    console.log(query);
                }
                db.query(query, {member_id:req.session.member.id, message:req.body.message, workout_id:workoutId, location_id:req.body.location, when:new Date()}, function(err, rows, fields) {
                    console.log(err);
                    res.send({state: 0});
                });
            }

        if( parseInt(req.body.distance) > 0 && parseInt(req.body.duration) > 0) {
            addWorkout(req.body, addPost)
        } else {
            addPost();
        }
    }

});

app.post('/post/delete', function(req,res) {

    if( typeof req.session.member == 'undefined' || req.session.member == null ) {
        res.send({message: '[[[Please log in to delete post]]]', state: 1});
        return;
    }

    var query = 'UPDATE post SET ? WHERE ? AND ?';
    db.query(query, [{deleted_date:new Date()}, {id:req.body.id}, {member_id:req.session.member.id}], function(err, rows, fields) {
        if (err) { res.send({state: 1, message: err}); return; }
        res.send({state: 0});
    });

});

app.get('/post/:id', function(req,res) {

    var query = 'SELECT post.id as post_id, post.message as message, post.`when` as `when`, CONCAT(member.first_name, \' \', member.last_name) as member_name, member.id as member_id, post.location_id, location.town, country.name as country_name, workout.duration, workout.distance ' +
        'FROM post ' +
        'JOIN member ON (post.member_id = member.id) ' +
        'LEFT JOIN workout ON (post.workout_id=workout.id) ' +
        'LEFT JOIN location ON (post.location_id=location.id) ' +
        'LEFT JOIN country ON (location.country_id=country.id) ' +
        'WHERE post.deleted_date IS NULL AND post.id='+req.params.id;

    if(debugging) {
        console.log(query);
    }

    db.query(query, [req.params.id],
        function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }

            res.send({state: 0, res: rows[0]});

        }
    );

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
        if (err) { res.send({state: 1, message: err}); return; }
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
        if (err) { res.send({state: 1, message: err}); return; }
        res.send({res: rows, state: 0});
    });

});


app.get('/api/me', function(req,res) {

    if( typeof req.session.member != 'undefined' && req.session.member != null) {
        db.query('SELECT member.id, member.first_name, member.last_name, member.email ' +
            'FROM member ' +
            'WHERE member_id = ' + req.session.member.id, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows[0], state: 0});
        });
    } else {
        res.send({state: 1});
    }

});


app.post('/comment/get-list', function(req,res) {

    if( req.body.type == 'post' ) {

        var query = 'SELECT comment.id, comment.post_id, comment.`when`, comment.member_id, IF(comment.deleted_date IS NOT NULL, true, false) as deleted, IF(comment.deleted_date IS NOT NULL, \'\', comment.message) as message, CONCAT(member.first_name, \' \', member.last_name) as member_name, member.id as member_id ' +
            'FROM comment ' +
            'JOIN member ON (member.id = comment.member_id) ' +
            'WHERE comment.post_id = ' + parseInt(req.body.id) +  ' ' +
            'ORDER BY comment.id ASC';

        if(debugging) {
            console.log(query);
        }

        db.query(query, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });
    }

});

app.post('/comment/add', function(req,res) {

    if( typeof req.session.member == 'undefined' || req.session.member == null ) {
        res.send({message: '[[[Please log in to add comment]]]', state: 1});
        return;
    }

    var query = 'INSERT INTO comment SET ?';

    if(debugging) {
        console.log(query);
    }

    if(req.body.message.length == 0) {
        res.send({message: '[[[You forgot about the comment body]]]', state: 1});
        return;
    }

    if(parseInt(req.body.id) == 0 || req.body.id == '') {
        res.send({message: '[[[Please refresh the page and try adding again]]]', state: 1});
        return;
    }

    if( req.body.type == 'post') {
        db.query(query, {post_id:req.body.id, message:req.body.message, member_id:req.session.member.id, when:new Date()}, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });
    } else if( req.body.type == 'event') {
        db.query(query, {event_id:req.body.id, message:req.body.message, member_id:req.session.member.id, when:new Date()}, function(err, rows, fields) {
            if (err) { res.send({state: 1, message: err}); return; }
            res.send({res: rows, state: 0});
        });
    }

});

app.post('/comment/delete', function(req,res) {

    if( typeof req.session.member == 'undefined' || req.session.member == null ) {
        res.send({message: '[[[Please log in to add comment]]]', state: 1});
        return;
    }

    var query = 'UPDATE comment SET ? WHERE ? AND ?';
    db.query(query, [{deleted_date:new Date()}, {id:req.body.id}, {member_id:req.session.member.id}], function(err, rows, fields) {
        if (err) { res.send({state: 1, message: err}); return; }
        res.send({state: 0});
    });

});



app.post('/api/login', function(req,res) {

    db.query('SELECT member.id, member.first_name, member.last_name, member.email ' +
        'FROM member ' +
        'WHERE member.email = "' + req.param('login') + '" AND member.password="'+req.param('password')+'"'
        , function(err, rows, fields) {
        if (err) { res.send({state: 1, message: err}); return; }
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
            if (err) { res.send({state: 1, message: err}); return; }

            res.send(rows);
        });
});

