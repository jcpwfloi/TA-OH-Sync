const request = require('request');

class CourseCare {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }

  login(callback) {
    let { username, password } = this;
    request({
      method: 'POST',
      url: 'https://course.care/login',
      form: {
        email: username, password
      }
    }, (err, res, body) => {
      if (err) return callback(err, null);
      if (res.headers["set-cookie"] && res.headers["set-cookie"].length) {
        var cookie = res.headers["set-cookie"][0];
        callback(null, cookie);
      } else callback(new Error('Wrong Login Credentials'), null);
    });
  }

  sync(data) {
    this.login((err, cookie) => {
    });
  }
}

module.exports = CourseCare;
