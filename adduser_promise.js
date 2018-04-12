const request = require('request')
const cheerio = require('cheerio')
const Sequelize = require('sequelize');
var config = require(__dirname + '\\config.js')['development'];

const url = 'https://www.facebook.com/zuck'

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
});

var User = sequelize.define('user', {
    userId: { type: Sequelize.STRING, unique: true },
    userName: Sequelize.STRING
})

var options = {
    url: url,
    headers: {
        "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) chrome/56.0.2924.87 Safari/537.36'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body)
        const userId = $('meta[property="al:android:url"]').attr('content').replace('fb://profile/', '');
        const userName = $('title').text().split('|')[0];

        User.sync({ force: true }).then(() => {
            return User.create({
                userId: userId,
                userName: userName.trim()
            });
        });
    }
}

request(options, callback)