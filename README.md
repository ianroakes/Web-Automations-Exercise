<h1 align="center">Welcome to My Web Automations Exercise 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> This is a web scraping/automation bot that uses Puppeteer to automate the ordering process on https://opencart.abstracta.us/.
> The bot pulls customer data from a JSON payload, navigates the website, places orders, and verifies the orders were placed.
> After completion, the bot outputs a JSON containing the customer order IDs and reference OpenCart order IDs. I was given 1 
> week to complete this challenge, and I had zero prior experience in Puppeteer and JS.

## Installation
Required packages: Node.js, npm, Puppeteer, Jest (optional)

1. Install Node.js. To install Node.js visit https://nodejs.dev/download/ and follow the install instructions for your operating system.

npm Should be installed automatically with Node.Js. To verify open a terminal window and run:
```sh
npm --version
```
You should see the installed version.

2. Install Puppeteer.
   Install Puppeteer by running this command:
```sh
npm install puppeteer
```

3. Clone the repository. Next, clone the repository into a local directory of your choice. If you have Git installed you can use this to clone the repository:
```sh
git clone https://github.com/ianroakes/Web-Automations-Exercise.git
```
If you do not have Git installed, download the repository files manually into a local directory of your choice.

4. (Optional) Install Jest. 
   If you want to run the test code in this repository, Jest must be installed.
   To install Jest run:
```sh
npm install --save-dev jest
```

## Usage

To run the bot, open a terminal/cmd window and cd to the project directory (where you cloned the repository) and run:
```sh
node orderbot.js
```
The bot will run by default in headless mode. The console will display progress messages as the bot runs.

**Note - Make sure the Opencart account cart is empty before running the bot. Any existing items left in cart will be ordered. (This could be an automated check/fix, didn't have time to implement.)

## Run tests

Jest must be installed to run the test file in the repository. 
```sh
jest run
```
**Note - the test file is not complete, it is included for demonstration only ( I didn't have time to finish it:) ).
The package.json file is included in the repository because it is required to initiliaze Jest as the test script, otherwise, it is not needed.

## Notes

### Explanation of Additional Packages
I installed Jest to experiment with test frameworks. I did not have time to complete a test version of the ordering bot, but I created a test file to learn how to use the Jest framework with Puppeteer. This framework would be very helpful for isolating sections of code, and providing verification that each step is functioning properly. A better approach might have been to complete the code in the Jest testing framework first, then migrate to production ready code.

### Tradeoffs and Changes I'd Make With More Time
I have never used Puppeteer, and my experience with JS is very limited, therefore it was a definitely a learn-as-you-go process. As I learned more I continually found ways to improve the bot, but for the sake of time I was not able to implement all of the changes. Here is a highlight of areas I would like to improve:

1. Error handling. I experimented with using try...catch to error handle, but I did not have time to add custom exceptions, or implement more focused checks on specific portions of my code. Given more time I would lock down individual sections of code that were more less consistent. Additionally, I would like to implement more checks/logic to verify that each step is working appropriately, and to account for errors, should they arise. The Jest test framework seems to be very helpful for this.

2. Explicit vs Implicit waits. In order to make the code function properly, I had to resort to using implicit waits to slow down the bot, and ensure items loaded correctly. I encountered issues using Puppeteer's explicit waits such as page.waitForNavigation(), which caused the script to hang indefinitely. Given more time I would use other methods to reduce the usage of implicit waits in the code.

4. Reduce repetitive code blocks. The script has a few sections of repetitive code. Ideally these would be reduced by creating universal functions that can be called upon throughout the script. 

5. Improve bot efficiency. This is a combination of the other points - the code can be refined to speed up the bot ordering process (for example replace implicit waits with explicit). Additionally, the console log commands could be removed to speed up the bot, I kept them for visibility. 

6. Improve bot compatibility and logic. While this script works great for this use-case, several changes could be implemented to make the code more universal to all order scenarios. For instance, one item, the Canon EOS 5D has checkout configuration options. I tailored the code to detect these options and select them, but they are not universal to all items (some items have different options entirely). Ideally, this code would be able to handle all different product configurations. Fpr the sake of time I often prioritized making the code work with this specific payload, over developing a universal solution to handle every possible product configuration.

7. Coding consistency/uniformity/conventions. As I prioritized learning and rapid prototyping to make the code function, I did not spend as much time ensuring the code was consistent in conventions and uniformity, as I would have liked. Given more time, I would like to tidy things up a bit more. For instance, I used different methods of querying and clicking elements throughout the code, when one method may have been more advantageous.   

### Time Spent
Since I was new to this, much of my time was spent reading/researching and learning along the way. I spent around 4 solid hours of dedicated coding on this project plus several more hours of debugging and documenting. In total I would estimate I spent around 8-9 hours on this project from start-finish. I am confident that my next attempt would have been much more efficient, now that I have an understanding of Puppeteer and more comfortability with JS fundamentals. 

### Final Notes
Although I went into this knowing essentially nothing about Puppeteer, I enjoyed the learning and problem-solving process. It was rewarding to get the bot working correctly and see positive results. Thanks for taking the time to evaluate my work! 

-Ian

## Author

👤 **Ian Oakes**

* Github: [@ianroakes](https://github.com/ianroakes)
* LinkedIn: [@ianroakes](https://linkedin.com/in/ianroakes)
* Website: [ianroakes.com](https://ianroakes.com)

## Credits
Credit to calebgrove https://gist.github.com/calebgrove/c285a9510948b633aa47, for the handy state abbreviation to name converter function!

***
