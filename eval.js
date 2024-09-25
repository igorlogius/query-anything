/* global browser */

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

const txta_out = document.getElementById("output");

async function getFromStorage(type, id, fallback) {
  const tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

function sanitizeJSON(unsanitized) {
  return unsanitized
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\&/g, "\\&");
}

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

async function doQuery(tabId) {
  let selectors = await getFromStorage("object", "selectors", []);

  const params = new URL(document.location.href).searchParams;
  const aid = parseInt(params.get("aid"));
  const input_text = utf8_to_b64(params.get("in"));

  let tmp;

  if (aid < selectors.length) {
    const mycode = selectors[aid].code.replace(/\s+/, "");
    tmp = await browser.tabs.executeScript(tabId, {
      code: `(async (inout) => { ${mycode}; return inout;
    })("${input_text}");`,
    });

    if (
      tmp &&
      tmp.length === 1 &&
      typeof tmp[0] === "string" &&
      tmp[0].length > 2
    ) {
      tmp = tmp[0];
      tmp = utf8_to_b64(tmp);
      console.debug(tmp);
      browser.runtime.sendMessage({ queryResult: tmp });
    }
  }
}

// on open
async function onLoad() {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    url: "moz-extension://*/*",
  });

  doQuery(tabs[0].id);
}

document.addEventListener("DOMContentLoaded", onLoad);
