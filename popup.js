/* global browser */

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

// receive data from eval.js
browser.runtime.onMessage.addListener((data, sender) => {
  const txta_out = document.getElementById("output");
  txta_out.value = decodeURIComponent(escape(window.atob(data.queryResult)));
  textAreaAdjust(txta_out);
});
