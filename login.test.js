const LOGIN = require('./logininfo.json');
//console.log(LOGIN[0].usr_name);

const puppeteer = require('puppeteer');


let browser
let page

beforeAll(async () => {
    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
})

describe('OpenCart Login Page', () => {
  test('has login field', async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://opencart.abstracta.us/index.php?route=account/login', { waitUntil: 'networkidle0' });
    const loginField = await page.$('#input-email');
    expect(loginField).toBeTruthy();
  })
})

describe('Login Test', () => {
  test('logged in successfully', async () => {
    await page.waitForSelector('#input-email');
    await page.click('#input-email');
    await page.type('#input-email', LOGIN[0].usr_name);
    await page.click('#input-password');
    await page.type('#input-password', LOGIN[0].password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
    const loggedIn = await page.title();
    //console.log(loggedIn);
    expect(loggedIn).toEqual('My Account');
  })

  afterAll(async () => {
    await browser.close()
  })
})


/*
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://opencart.abstracta.us/index.php?route=account/login');
    //await page.waitForNavigation();
    await page.waitForSelector('#input-email');
    await page.click('#input-email');
    await page.type('#input-email', LOGIN[0].usr_name);
    await page.click('#input-password');
    await page.type('#input-password', LOGIN[0].password);
    await page.keyboard.press('Enter');

    //await page.click("#content > div > div:nth-child(2) > div > form > input");
    //await page.click("#input.btn.btn-primary");
    
  })();
*/
