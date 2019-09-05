const CourseCare = require('./CourseCare');
const config = require('./config.json');

const app = new CourseCare({
  username: config.username,
  password: config.password
});

app.getOfficeHour().then((d) => {
  d.map(v => {
    app.deleteOfficeHour(v.id);
  });
});

