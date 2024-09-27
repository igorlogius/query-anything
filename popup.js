/* global browser */

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

// receive data from eval.js
browser.runtime.onMessage.addListener((data, sender) => {
  if (data.text) {
    const txta_out = document.getElementById("output");
    txta_out.value = data.text;
    textAreaAdjust(txta_out);
  } else if (data.html) {
    document.body.innerHTML = data.html;
  }
});
