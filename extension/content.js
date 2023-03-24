import $ from "jquery";
import { getCanonicalHostname } from "./hostname.js";
import { regexpFromWordList } from "./word_matcher.js";

window.hasAqi = true;

var AQI_PREFIX = "aqi-"

// Utility function for getting settings for the current host.
async function fetchStatusForHost(key, cb) {
  var current_host = getCanonicalHostname(window.location.host);
  const items = await chrome.storage.local.get(key);
  if (items[key] === undefined) {
    return false;
  }
  return items[key][current_host] === true;
}

var min_feed_neighbors = 3;

function isSimilar(my_rect, sib_rect) {
  let my_x = my_rect.left + my_rect.width / 2;
  let sib_x = sib_rect.left + sib_rect.width / 2;

  let my_y = my_rect.top + my_rect.height / 2;
  let sib_y = sib_rect.top + sib_rect.height / 2;

  let is_vertically_placed = Math.abs(my_y - sib_y) > Math.abs(my_x - sib_x);

  if (is_vertically_placed) {
    return sib_rect.height != 0 && my_rect.width == sib_rect.width;
  } else {
    return my_rect.height == sib_rect.height;
  }
}


function getFeedlikeAncestor(node){
  // parents ordered by document order
  var parents = $(node).add($(node).parents());
  var siblingness_counts = parents.map(function(index,elem){
    var num_children = $(elem).children().length;

    if ($(elem).prop("tagName") == "LI") {
      return min_feed_neighbors + 1; // Generic "big" number
    }

    // three siblings is good enough to be a list.
    // I used to check whether or not siblings were hidden, but this caused problems
    // when there were large hidden arrays of objects, e.g. in Youtube, which would
    // cause the whole page to be hidden. This new setting hopefully is less prone
    // to hiding entire lists.
    if (elem.nodeType != Node.ELEMENT_NODE) {
      return 0;
    }
    let myRect = elem.getBoundingClientRect();

    // Ignore elements with zero height.
    if (myRect.height == 0) {
      return 0;
    }

    var matching_siblings = $(elem).siblings().filter(function(index, sib){
      // Function returns true iff sibling has a class in common with the original.
      var $sib = $(sib)

      if (sib.nodeType != Node.ELEMENT_NODE) {
        return false;
      }
      let sibRect = sib.getBoundingClientRect();

      return isSimilar(myRect, sibRect);
    });
    return Math.min(matching_siblings.length, min_feed_neighbors);
  });

  var best_count = -1;
  var best_index = -1;

  // Note, parents were ordered by document order
  for (var i = siblingness_counts.length - 1; i >= 0; i--) {
    if (siblingness_counts[i] > best_count) {
      best_count = siblingness_counts[i];
      best_index = i;
    }
  }
  let chosen_dom_element = null;
  if (best_index < 0) {
    console.log("Uh oh: best_index < 0");
    chosen_dom_element = node
  } else {
    chosen_dom_element = parents[best_index]
  }
  return $(chosen_dom_element);
}

function findMyId() {
  var iframes = parent.document.getElementsByTagName("iframe");
  
  for (var i=0, len=iframes.length; i < len; ++i) {
    if (document == iframes[i].contentDocument ||
        self == iframes[i].contentWindow) {
        return iframes[i].id;
    }
  }
  return "";
}
try {
  var my_id = findMyId();
}
catch(err) {
  var my_id = "ignore";
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function addNotification(elem, put_inside) {
  var $elem = $(elem);
  if ($.isWindow($elem)) {
    console.log("Ignoring window");
    return;
  }
  if (put_inside && $elem.children(".aqi-notification").length !== 0) {
    return;
  }
  if (!put_inside && $elem.prev(".aqi-notification").length !== 0) {
    return;
  }
  var $positioner = $("<div/>").addClass("aqi-notification");
  var $contents = $("<div/>").addClass("aqi-inside")
    .css("max-width", $elem.width());
  var $arrow = $("<div/>").addClass("aqi-arrow");
  var $arrow_wrapper = $("<div/>").addClass("aqi-arrow-wrapper").click(function() {
      $elem.addClass("aqi-hide-exception");
      $positioner.addClass("aqi-disabled");
    }).append($arrow);
  
  $contents.append($arrow_wrapper);
  $positioner.append($contents);
  if (put_inside) {
    $elem.prepend($positioner);
  } else {
    $elem.before($positioner);
  }
}

// Assembles a regex from stored blacklist
async function makeRegex() {
  try {
    const items = await chrome.storage.local.get(["blacklist"/*, "enabled"*/])
    var bannedWords = items["blacklist"];
    return regexpFromWordList(Object.keys(bannedWords));
  } catch (err) {
    console.log("Ran into error while making regex:" + err.message);
  }
}

function processTextNode(node, hide_completely, regex) {
  if (regex.test(node.data)) {
    if ($(node).add($(node).parents()).filter(":hidden").length) {
      return;
    }

    var ancestor = getFeedlikeAncestor(node);
    try {
      if (hide_completely) {
        ancestor.addClass("aqi-hide-completely");
      } else {        
        let put_inside = (getCanonicalHostname(window.location.host) == "youtube.com");
        addNotification(ancestor, put_inside);
        ancestor.addClass("aqi-hide");
        if (put_inside) {
          ancestor.addClass("aqi-put-inside-mode");
        }

      }
    } catch (e) {
      console.log("hit error adding notification.", e);
    }
  }
}

var observer = null;

function startObservingChanges(processCallback) {
  const targetNode = document.documentElement;
  const config = {attributes: false, childList: true, characterData: true, subtree: true};
  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'characterData') {
        processCallback(mutation.target);
      } else if (mutation.type === 'childList') {
        for (let node of mutation.addedNodes) {
          let walk=document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
          while (walk.nextNode()) {
            processCallback(walk.currentNode);
          }
        }
      } else if (mutation.type === 'attributes') {
        let walk=document.createTreeWalker(mutation.target,NodeFilter.SHOW_TEXT,null,false);
        while (walk.nextNode()) {
          processCallback(walk.currentNode);
        }
      }
    }
  }
  if (observer) {
    observer.disconnect();
  }
  observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function clearAll() {
  if (observer) {
    observer.disconnect();
  }
  $(".aqi-hide").removeClass("aqi-hide");
  $(".aqi-put-inside-mode").removeClass("aqi-put-inside-mode");
  $(".aqi-hide-completely").removeClass("aqi-hide-completely");
  $(".aqi-notification").remove();
  $(".aqi-debug").removeClass("aqi-debug");
}

function render(enabled_everywhere, hide_completely, disable_site, regex) {
  clearAll();

  if (!enabled_everywhere || disable_site) {
    return;
  }

  let process = (node) => {processTextNode(node, hide_completely, regex)}
  startObservingChanges(process);

  let walk=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT,null,false);
  while (walk.nextNode()) {
    process(walk.currentNode);
  }
}

// Fetch all parameters and then redraw
async function restart() {
  // todo: Do it in one operation.
  try {
    const items = await chrome.storage.local.get({"enabled" : true});
    const enabled_everywhere = items["enabled"];
    const hide_completely = await fetchStatusForHost("hide_completely");
    const disable_site = await fetchStatusForHost("disable_site");
    const regex = await makeRegex();
    render(enabled_everywhere, hide_completely, disable_site, regex);

    // This sends a messages to the background script, which can see which tab ID this is.
    // The background script then makes an update to storage that triggers a change in the icon.
    // console.log(window.frameElement.getAttribute("Name"));
    if (my_id !== "ignore") {
      // For now, only count number of blocked things in outermost div.
      if (!inIframe()) {
        chrome.runtime.sendMessage({"count": $(".aqi-hide, .aqi-hide-completely").length});
      }
    }
  } catch(err) {
    console.log(err);
  }
}

// When the blacklist changes the regex needs to be updated
chrome.storage.onChanged.addListener(function(changes, namespace) {
  restart();
});

restart();