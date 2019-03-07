var express = require('express');
var puppeteer = require('puppeteer');
var cheerio = require('cheerio');
var fs = require('fs');
var secret = require('../config/secret.json');

var router = express.Router();

const URL =
  'https://www.kau.ac.kr/page/login.jsp?ppage=&target_page=act_Portal_Check.jsp@chk1-1';
const URL_CLASS =
  'https://portal.kau.ac.kr/sugang/LectDeptSchTop.jsp?year=2018&hakgi=20&hakgwa_name=%C7%D0%BA%CE&hakgwa_code=A0000&gwamok_name=&selhaknyun=%&selyoil=%&jojik_code=A0000&nowPage=1';

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

router.get('/all-timetable/:year/:hakgi', function(req, res) {
  var strArr = new Array();

  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    browser.newPage({ context: 'another-context' });

    const page = await browser.newPage();

    await page.goto(URL); // lms 로그인창으로 이동

    // await page.goto('http://127.0.0.1:3000/lms_before_arr.html') // 테스트용

    await page.type('[name=p_id]', secret.userId); // id찾아서 넣기

    await page.type('[name=p_pwd]', secret.userPw); // 비밀번호 찾아서 넣기

    await page.click(
      'body > div.aside > div.articel > table:nth-child(2) > tbody > tr:nth-child(3) > td > form > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > a > img'
    ); // 로그인 버튼 클릭

    await delay(2000);

    var listClass = Array();
    var listClassTemp = Array();
    var classTemp = '';
    var k = 0;
    var o = 0;
    var temptepm = '';

    for (var p = 1; p < 45; p++) {
      var urlClass =
        'https://portal.kau.ac.kr/sugang/LectDeptSchTop.jsp?year=' +
        String(req.params.year) +
        '&hakgi=' +
        String(req.params.hakgi) +
        '&hakgwa_name=%C7%D0%BA%CE&hakgwa_code=A0000&gwamok_name=&selhaknyun=%&selyoil=%&jojik_code=A0000&nowPage=' +
        String(p);

      await page.goto(urlClass);

      // await delay (1000)

      var html = await page.content();
      var $ = cheerio.load(html);

      for (var i = 2; i < 17; i++) {
        $(
          'body > form > table:nth-child(2) > tbody > tr > td > center > table:nth-child(2) > tbody > tr:nth-child(2) > td > center > table.table1 > tbody > tr:nth-child(' +
            String(i) +
            ')'
        ).each(function() {
          var strTemp = $(this).text();
          var listTemp = strTemp.split('\n');

          for (var j = 0; j < listTemp.length; j++) {
            listClassTemp[o] = listTemp[j].replace(/^\s*/, '');
            o++;
          }

          var result = Array();

          var result =
            listClassTemp[5] +
            '//' +
            listClassTemp[11] +
            '//' +
            listClassTemp[12] +
            '//' +
            listClassTemp[14] +
            '//' +
            listClassTemp[15];

          listClass[k] = result;

          temptepm += result + '\n';

          k++;
          o = 0;
          listClassTemp = Array();
          classTemp = '';
        });
      }
    }

    fs.writeFile('list_timetable.txt', temptepm, 'utf-8', function(e) {
      if (e) {
        // 3. 파일생성 중 오류가 발생하면 오류출력
        console.log(e);
      } else {
        // 4. 파일생성 중 오류가 없으면 완료 문자열 출력
        console.log('01 WRITE DONE!');
      }
    });

    res.send('done');

    await browser.close();
  })();
});

module.exports = router;
