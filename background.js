/* global browser */

async function getFromStorage(type, id, fallback) {
  const tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

function cleanString(input) {
  var output = "";
  for (var i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}

/*
function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}
*/

async function onCommand(cmd) {
  console.debug("onCommand", cmd);
  const anr = parseInt(cmd.split("_")[1]);

  browser.browserAction.openPopup({});

  let tmp = await browser.tabs.executeScript({
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
    const b64str = window.btoa(unescape(encodeURIComponent(tmp[0])));

    // send eval tab where we run the custom code
    const evalTab = await browser.tabs.create({
      active: false,
      url: "eval.html",
    });

    // get custom code from storage
    let selectors = await getFromStorage("object", "selectors", []);

    const mycode = cleanString(selectors[anr].code.replace(/\s+/g, " "));

    tmp = await browser.tabs.executeScript(evalTab.id, {
      code: `(async (inout) => {
inout=decodeURIComponent(escape(atob(inout)));
${mycode};
inout=btoa(unescape(encodeURIComponent(inout)));
return inout;
})("${b64str}");`,
    });

    browser.tabs.remove(evalTab.id);

    if (
      tmp &&
      tmp.length === 1 &&
      typeof tmp[0] === "string" &&
      tmp[0].length > 2
    ) {
      tmp = tmp[0];
      browser.runtime.sendMessage({ queryResult: tmp });
    }
  }
}

async function onInstalled(details) {
  if (details.reason === "install") {
    const resp = await fetch(browser.runtime.getURL("processors.json"));
    const json = await resp.json();
    browser.storage.local.set({ selectors: json });

    browser.runtime.openOptionsPage();
  }
}
browser.commands.onCommand.addListener(onCommand);
browser.runtime.onInstalled.addListener(onInstalled);

async function onStorageChange() {
  let tmp = await getFromStorage("object", "selectors", []);

  await browser.menus.removeAll();

  for (let i = 0; i < tmp.length; i++) {
    const row = tmp[i];
    await browser.menus.create({
      title: row.name,
      contexts: ["selection"],
      onclick: async (info) => {
        onCommand(`_${i}`);
      },
    });
  }
}

(async () => {
  await onStorageChange();
})();

browser.storage.onChanged.addListener(onStorageChange);
