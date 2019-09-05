const requestLib = require('request');
const dateformat = require('dateformat');
const cheerio = require('cheerio')

var FileCookieStore = require('tough-cookie-filestore');
// NOTE - currently the 'cookies.json' file must already exist!
var j = requestLib.jar(new FileCookieStore('cookies.json'));
request = requestLib.defaults({ jar : j })

class CourseCare {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }

  remote(url, form) {
    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        url,
        form
      }, (err, res, body) => {
        if (err) return reject(err);
        resolve({ res, body });
      });
    });
  }

  async login() {
    let { username, password } = this;
    try {
      var { res, body } = await this.remote('https://course.care/login', {
        email: username, password
      });
    } catch (err) {
      throw err;
    }
  }

  async addOfficeHour({ name, start, end, location }) {
    var template = {
      type: "Office Hours",
      description: '',
      openAtDate: dateformat(start, 'mm/dd/yyyy'),
      openAtTime: dateformat(start, 'HH:MM'),
      closeAtTime: dateformat(end, 'HH:MM'),
      location: 95,
      checkinMethod: "Queue",
      id: ""
    };

    var { res, body } = await this.remote('https://course.care/course/31/event', template);
  }

  getRemote(url) {
    return new Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if (err) return reject(err);
        const $ = cheerio.load(body);
        resolve($);
      })
    });
  }

  async getOfficeHour() {
    var ans = [];
    var addr = [];
    var $ = await this.getRemote('https://course.care/course/31/events');
    var btns = $('td.align-middle > a.btn');

    btns.each((d, e) => {
      addr.push($(e).attr('href'));
    });

    for (var i = 0; i < addr.length; ++ i) {
      var v = addr[i];
      $ = await this.getRemote('https://course.care' + v);
      let arr = $('form').serializeArray();
      var data = {};
      arr.map(v => {
        data[v.name] = v.value;
      });
      ans.push(data);
    }

    console.log(ans);
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

    this.events = ans;

    this.addOfficeHour(ans[1]).then((info) => {
    });
  }
}

module.exports = CourseCare;
