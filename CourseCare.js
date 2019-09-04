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
      if (res.headers["set-cookie"] && res.headers["set-cookie"].length && res.headers["location"] === '/') {
        var cookie = res.headers["set-cookie"][0];
        callback(null, cookie);
      } else callback(new Error('Wrong Login Credentials'), null);
    });
  }

  merge(a, b) {
    a.start = a.start < b.start ? a.start : b.start;
    a.end = a.end > b.end ? a.end : b.end;;
    return a;
  }

  trim(t) {
    var ans = [];

    for (var i = 0; i < t.length;) {
      var pivot = t[i];

      ++ i;

      if (i >= t.length) {
        ans.push(pivot);
        break;
      }

      while (this.intersect(pivot, t[i])) {
        pivot = this.merge(pivot, t[i]);
        ++ i;

        if (i >= t.length) break;
      }

      ans.push(pivot);
    }

    return ans;
  }

  intersect(d1, d2) {
    if (d1.start > d2.start) {
      t = d1;
      d1 = d2;
      d2 = t;
    }
    return d1.end >= d2.start;
  }

  sync(data) {
    var table = {};
    var ans = [];

    data.map((d) => {
      if (!table[d.location]) table[d.location] = [];
      
      table[d.location].push(d);
    });

    for (var loc in table) {
      table[loc] = this.trim(table[loc]);
      ans = ans.concat(table[loc]);
    }

    console.log(ans);
  }
}

module.exports = CourseCare;
