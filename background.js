/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

// todo: create menu item for each processor
/*
browser.menus.create({
  title: extname,
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"],
  onclick: async (info) => {
    browser.browserAction.openPopup({});
  },
});
*/

async function onCommand(cmd) {
  const anr = parseInt(cmd.split("_")[1]);

  browser.browserAction.openPopup({});

  tmp = await browser.tabs.executeScript({
    code: `(() => {
            return getSelection().toString();
    })();
          `,
  });

  if (
    tmp &&
    tmp.length === 1 &&
    typeof tmp[0] === "string" &&
    tmp[0].length > 2
  ) {
    input_text = tmp[0];

    // send data to popup from eval
    browser.tabs.create({
      active: false,
      url: "eval.html?aid=" + anr + "&in=" + encodeURIComponent(input_text),
    });
  }
}

browser.commands.onCommand.addListener(onCommand);
