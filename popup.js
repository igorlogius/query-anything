/* global browser */

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

const txta_out = document.getElementById("output");

// receive data from eval.js
browser.runtime.onMessage.addListener((data, sender) => {
  txta_out.value = b64_to_utf8(data.queryResult);
  textAreaAdjust(txta_out);
  browser.tabs.remove(sender.tab.id);
});

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}
