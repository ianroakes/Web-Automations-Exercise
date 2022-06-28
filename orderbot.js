/**
 * @name Web Automations Exercise
 * 
 * @desc Automated ordering bot that orders product from the opencart demo website, using customer data from a JSON payload.
 */

//JSON payload parsing, login credentials
const orderPayload = require('./orders.json');
const LOGIN = require('./logininfo.json');


//Initialize puppeteer
const puppeteer = require('puppeteer');
const { format } = require('path');

//Using try...catch to error handle, ideally would implement more of these in specific code blocks
try {

(async () => {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    
    /**
     * --Login--
     * 
     * @desc Automatically login to the Opencart website with credentials provided in 'logininfo.json'
     */

    await page.goto('https://opencart.abstracta.us/index.php?route=account/login', { waitUntil: 'networkidle0' });

    //Close bitnami banner popup to avoid clicking it with page.click commands
    const bitnami = await page.$eval('#bitnami-banner', () => true).catch(() => false);

    if (bitnami == true) {
        console.log('Bitnami banner detected, closing');
        await page.evaluate(()=>document.querySelector('#bitnami-close-banner-button').click());
    } else {
        console.log('Banner not detected, continuing');
    }
    //Input login credentials
    await page.waitForSelector('#input-email');
    await page.click('#input-email');
    await page.type('#input-email', LOGIN[0].usr_name);
    await page.click('#input-password');
    await page.type('#input-password', LOGIN[0].password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    //For loop to execute complete order sequence per customer in the 'orders.json' payload

    for (let n = 0; n < orderPayload.length; n++){

      /**
       * --ADD ITEMS TO CART--
       * 
       * @desc Iterate through the 'orders.json' payload, individually adding items from the payload to the cart (per customer)
       *        
       */
     
      //Initialize
      //Convert customer state abbreviation in 'order.json' to full name using function convertRegion, defined at the end of the script
      var statename = convertRegion(orderPayload[n].customerState, TO_NAME);

      //Iterate through the customer data "items" array (per customer), to add each item to the cart
      for (let i = 0; i < orderPayload[n].items.length; i++){
        
        //Use website search bar to search "itemnames" from 'order.json'
        await page.waitForSelector('#search');
        await page.click('#search');
        await page.type('#search', orderPayload[n].items[i].itemName);
        await page.click('#search .btn-lg');
        await page.waitForSelector('a');
  
        //Check if search yielded appropriate result - looking for linked text of itemname
        const query = orderPayload[n].items[i].itemName;
        await page.evaluate(query => {
          //query all <a> tags
          const elements = [...document.querySelectorAll('a')];
           // find element with filter by pulling "itemname", look for an a tag with innertext of 'itemname'
          const targetElement = elements.filter(e => e.innerText.includes(query))[0];
           // make sure the element exists, and only then click it - if given more time, I would setup an error handle if element did not exist
          targetElement && targetElement.click();
        }, query)
        
        //Wait for 2.5 sec to ensure page has loaded (better to use explicit wait, but I encountered issues with page.waitforNavigation() causing script to hang)
        await page.waitForTimeout(2500);

        
        //Check to see if the selected product has configuration options
        //  if configuration options exist, select. 
        //  This was tailored to customer1, since no other products had options, given more time I would expand this to capture other cases.
        const ifOption = await page.$eval('#input-option226', () => true).catch(() => false);
  
        if (ifOption == true) {
          console.log('Product configuration options found for ' + orderPayload[n].items[i].itemName + 'configuring.');
          await page.click('#input-option226');
          await page.type('#input-option226', 'Red');
          await page.click('#input-option226');
        } else {
          console.log('No product configuration options found for ' + orderPayload[n].items[i].itemName + '.');
        }
        //Wait for navigation 
        await page.waitForTimeout(1500);
  
        //Add item to cart
        await page.waitForSelector('#button-cart');
        //page.click was inconsistent in pressing the button, sometimes it only highlighted the bounding box
        //seems to be a known issue with page.click(), using page.evaluate instead to click the element itself
        await page.evaluate(()=>document.querySelector('#button-cart').click());

        //Loop to repeatedly try to add item to cart until success notification is displayed
        //  Sometimes the click did not register, this ensures that items are added to cart before proceeding
        //  This tries for 20 attempts, an alternative is to loop forever until success is displayed, but to ensure code did not hang, 20 was set
        for (let j = 0; j < 20; j++){
          //Using try...catch to error handle since page.$eval expects a promise
          const exists1 = await page.$eval('#product-product > div.alert.alert-success.alert-dismissible', () => true).catch(() => false);
          
          if (exists1 == true) {
          console.log(query + ' Added to cart!');
          break; 

        } else {
          console.log(query + ' not added to cart, retrying, try number ' + (j+1));
          await page.evaluate(()=>document.querySelector('#button-cart').click());
          await page.waitForTimeout(500);
        }
        }
  
        //Clear search bar in prep for next search
        await page.waitForSelector('#search');
        await page.click("#search", {clickCount: 3});
        await page.keyboard.press('Backspace');
      }
      console.log("Items added to cart for customer " + orderPayload[n].customerFirstName + ' ' + orderPayload[n].customerLastName + ' entering checkout.');
      
      /**
       * --CHECKOUT--
       * 
       * @desc This portion of the code automates the checkout process, per customer.
       */
      
      //Click cart total
      await page.waitForSelector('#cart-total');
      await page.click('#cart-total');
      
      //Look for checkout link (linked text element) and press it, same technique as above
      const query = 'Checkout';
  
      await page.evaluate(query => {
  
        const elements = [...document.querySelectorAll('strong')];
  
        // find element with filter, inner text including "Checkout"
        const targetElement = elements.filter(e => e.innerText.includes(query))[0];
  
        // make sure the element exists, and only then click it
        targetElement && targetElement.click();
      }, query)
      
      await page.waitForTimeout(1000);
      
      //Check for existing payment info, if it exists, enter new info anyway, to ensure info is up to date
      const exists = await page.$eval('#payment-existing', () => true).catch(() => false);
  
      if (exists == true) {
          console.log('Existing billing addresses detected.');
          await page.click('#collapse-payment-address > div > form > div:nth-child(3) > label > input[type=radio]');
      } else {
          console.log('No existing billing addresses detected.');
      }
  
      await page.waitForTimeout(2000);
      
      //--CUSTOMER INFO FIELD POPULATION--
      //Enter Customer Info
      await page.waitForSelector('#input-payment-firstname');
      await page.click('#input-payment-firstname');
      await page.type('#input-payment-firstname', orderPayload[n].customerFirstName);
  
      await page.waitForSelector('#input-payment-lastname');
      await page.click('#input-payment-lastname');
      await page.type('#input-payment-lastname', orderPayload[n].customerLastName);
      
      await page.waitForSelector('#input-payment-address-1');
      await page.click('#input-payment-address-1');
      await page.type('#input-payment-address-1', orderPayload[n].customerAddress);
      
      await page.waitForSelector('#input-payment-city');
      await page.click('#input-payment-city');
      await page.type('#input-payment-city', orderPayload[n].customerCity);
  
      await page.waitForSelector('#input-payment-postcode');
      await page.click('#input-payment-postcode');
      await page.type('#input-payment-postcode', orderPayload[n].customerZip);
      
      //Country assumed to be USA since none given in payload
      await page.waitForSelector('#input-payment-country');
      await page.select('#input-payment-country','223')
      await page.waitForTimeout(1000);

      await page.waitForSelector('#input-payment-zone');
      await page.waitForTimeout(1000);
      //Search for dropdown option value based on a search of the option tag with filter statename, select appropriate option
      await page.evaluate(statename => {
        const payzone = document.querySelector('#input-payment-zone');
        const example_options = payzone.querySelectorAll('option');
        const selected_option = [...example_options].find(option => option.text === statename);
      
        selected_option.selected = true;
      }, statename);
  
      await page.waitForSelector('#button-payment-address');
      await page.evaluate(()=>document.querySelector('#button-payment-address').click());
  
      await page.waitForSelector('#shipping-existing');
      await page.waitForTimeout(1000);
      
      //Check for existing shipping info, if it exists, enter new info anyway, to ensure it is up to date
      const exists2 = await page.$eval('#shipping-existing', () => true).catch(() => false);
  
      if (exists2 == true) {
          console.log('Existing delivery addresses detected.');
          await page.click('#collapse-shipping-address > div > form > div:nth-child(3) > label > input[type=radio]');
      } else {
          console.log('No existing delivery addresses detected.');
      }
  
      await page.waitForSelector('#input-shipping-firstname');
      await page.click('#input-shipping-firstname');
      await page.type('#input-shipping-firstname', orderPayload[n].customerFirstName);
  
      await page.waitForSelector('#input-shipping-lastname');
      await page.click('#input-shipping-lastname');
      await page.type('#input-shipping-lastname', orderPayload[n].customerLastName);
      
      await page.waitForSelector('#input-shipping-address-1');
      await page.click('#input-shipping-address-1');
      await page.type('#input-shipping-address-1', orderPayload[n].customerAddress);
      
      await page.waitForSelector('#input-shipping-city');
      await page.click('#input-shipping-city');
      await page.type('#input-shipping-city', orderPayload[n].customerCity);

      await page.waitForSelector('#input-shipping-postcode');
      await page.click('#input-shipping-postcode', {clickCount: 3});
      await page.keyboard.press('Backspace');
      await page.type('#input-shipping-postcode', orderPayload[n].customerZip);
      
      //Country assumed to be USA since none given in payload
      await page.waitForSelector('#input-shipping-country');
      await page.select('#input-shipping-country','223')
      await page.waitForTimeout(500);
      //Search for dropdown option value based on a search of the option tag with filter statename, select appropriate option
      await page.waitForSelector('#input-shipping-zone');
      await page.waitForTimeout(500);
      await page.evaluate(statename => {
        const shipzone = document.querySelector('#input-shipping-zone');
        const example_options = shipzone.querySelectorAll('option');
        const selected_option = [...example_options].find(option => option.text === statename);
      
        selected_option.selected = true;
      }, statename);
    
      await page.waitForSelector('#button-shipping-address');
      await page.evaluate(()=>document.querySelector('#button-shipping-address').click());
      await page.waitForSelector('#collapse-shipping-method > div > div.radio > label > input[type=radio]');
      
      
      //Check if deliverynotes exist in payload, enter in comments if they do, if not continue through checkout
      const deliveryNotes = orderPayload[n].deliveryNotes;
      await page.waitForTimeout(500);
      
      if (deliveryNotes == null || deliveryNotes == '') { //check if null or empty, if so skip to next section
        
        await page.waitForSelector('#button-shipping-method');
        await page.evaluate(()=>document.querySelector('#button-shipping-method').click());
  
      } else { //if delivernotes notnull or empty then enter notes and continue
        await page.click('#collapse-shipping-method > div > p:nth-child(5) > textarea', {clickCount: 3});
        await page.type('#collapse-shipping-method > div > p:nth-child(5) > textarea', deliveryNotes);
        await page.waitForTimeout(500);
        await page.waitForSelector('#button-shipping-method');
        await page.evaluate(()=>document.querySelector('#button-shipping-method').click());
      }
      
      //Select payment method
      //Select cash or bank transfer based on 'orders.json' payload
      const paymentType = orderPayload[n].paymentMethod;
      const paymentNotes = orderPayload[n].paymentNotes;
      
      await page.waitForTimeout(500);
  
      if (paymentType == 'Cash') {
  
        await page.waitForSelector('#collapse-payment-method > div > div:nth-child(3) > label > input[type=radio]');
        await page.click('#collapse-payment-method > div > div:nth-child(3) > label > input[type=radio]');
  
      } else if (paymentType == 'Bank') {
  
        await page.waitForSelector('#collapse-payment-method > div > div:nth-child(2) > label > input[type=radio]');
        await page.click('#collapse-payment-method > div > div:nth-child(2) > label > input[type=radio]');

      } else {
        console.log('No payment method specified.'); //if none, defaults to first selection
    
      }

      //Check if paymentnotes exist in payload, enter in comments if they do, if not continue through checkout
      if (paymentNotes == null || paymentNotes == ''){
         //Agree to terms and conditions
        await page.waitForSelector('#collapse-payment-method > div > div.buttons > div > input[type=checkbox]:nth-child(2)');
        await page.click('#collapse-payment-method > div > div.buttons > div > input[type=checkbox]:nth-child(2)');
    
        await page.waitForSelector('#button-payment-method');
        await page.click('#button-payment-method');
        await page.waitForTimeout(500);
      } else {

        await page.waitForTimeout(500);
        await page.click('#collapse-payment-method > div > p:nth-child(5) > textarea', {clickCount: 3});
        await page.waitForTimeout(500);
        await page.type('#collapse-payment-method > div > p:nth-child(5) > textarea', paymentNotes);
        await page.waitForTimeout(500);

        //Agree to terms and conditions
        await page.waitForSelector('#collapse-payment-method > div > div.buttons > div > input[type=checkbox]:nth-child(2)');
        await page.click('#collapse-payment-method > div > div.buttons > div > input[type=checkbox]:nth-child(2)');
    
        await page.waitForSelector('#button-payment-method');
        await page.click('#button-payment-method');
        await page.waitForTimeout(500);
      }
  
      //--ORDER CONFIRMATION - didn't have time to finish this section
      //Confirm that the correct items are included before checking out
      //Given more time, this section would check the order confirmation table against the payload to ensure the correct items were added as a last check
    
      //Confirm checkout
      await page.waitForSelector('#button-confirm');
      await page.evaluate(()=>document.querySelector('#button-confirm').click());
      await page.waitForTimeout(1500);
      console.log('Order successfully placed for ' + orderPayload[n].customerFirstName + ' ' + orderPayload[n].customerLastName + '.')

      /**
       * --ORDER VERIFICATION/OUTPUT JSON--
       * 
       * @desc Navigates to the orderhistory page to pull the latest orderID and export it to outputBot.JSON
       */

      //Check Order History for OrderID
      const orderHistory = 'history';
      await page.waitForTimeout(1000);
      await page.evaluate(orderHistory => {
        const elements = [...document.querySelectorAll('a')];
        // find element with filter, inner text including "history"
        const targetElement = elements.filter(e => e.innerText.includes(orderHistory))[0];
        // make sure the element exists, and only then click it
        targetElement && targetElement.click();
      }, orderHistory)
  
      await page.waitForTimeout(1000);
      //Select the orderID from the history table, newest orders populate to position 1:1
      const elements2 = await page.waitForSelector('#content > div.table-responsive > table > tbody > tr:nth-child(1) > td:nth-child(1)');
      const orderIDText = await elements2.evaluate(el => el.textContent, elements2);

      //On first loop (customer 0), create obj var with orderID info, on subsequent passes push new orderIDs to the variable
      if (n == 0) {
        var obj = [{ "orderId": orderPayload[n].orderId, "externalOrderId": orderIDText}];
      } else {
        obj.push({ "orderId": orderPayload[n].orderId, "externalOrderId": orderIDText});
      }
      
      //JSON Creation
      //Create output JSON containing orderIDs and ExternalorderIDs from the website
      //Convert obj to string for JSON
      var json = JSON.stringify(obj);
      //Write JSON
      var fs = require('fs');
      fs.writeFile('outputBot.json', json, 'utf8', function(err, result) {
        if(err) console.log('error', err);
      });
  
    }

    //Bot completion!
    console.log('Complete! Check "outputBot.JSON" for order ID.');
    await browser.close();
    

  })();
} catch (err) {
    console.error(err)
  } 







  //State Name Converter (Abbreviation to Name/Vice-Versa) From https://gist.github.com/calebgrove/c285a9510948b633aa47

  const TO_NAME = 1;
  const TO_ABBREVIATED = 2;

function convertRegion(input, to) {
    var states = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['American Samoa', 'AS'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['Armed Forces Americas', 'AA'],
        ['Armed Forces Europe', 'AE'],
        ['Armed Forces Pacific', 'AP'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Marshall Islands', 'MH'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Northern Mariana Islands', 'NP'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Puerto Rico', 'PR'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['US Virgin Islands', 'VI'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    // So happy that Canada and the US have distinct abbreviations
    var provinces = [
        ['Alberta', 'AB'],
        ['British Columbia', 'BC'],
        ['Manitoba', 'MB'],
        ['New Brunswick', 'NB'],
        ['Newfoundland', 'NF'],
        ['Northwest Territory', 'NT'],
        ['Nova Scotia', 'NS'],
        ['Nunavut', 'NU'],
        ['Ontario', 'ON'],
        ['Prince Edward Island', 'PE'],
        ['Quebec', 'QC'],
        ['Saskatchewan', 'SK'],
        ['Yukon', 'YT'],
    ];

    var regions = states.concat(provinces);

    var i; // Reusable loop variable
    if (to == TO_ABBREVIATED) {
        input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        for (i = 0; i < regions.length; i++) {
            if (regions[i][0] == input) {
                return (regions[i][1]);
            }
        }
    } else if (to == TO_NAME) {
        input = input.toUpperCase();
        for (i = 0; i < regions.length; i++) {
            if (regions[i][1] == input) {
                return (regions[i][0]);
            }
        }
    }
}
