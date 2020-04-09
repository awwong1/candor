/** Utility for controlling page appearance (dark/light mode).
 * Inspired by https://www.gwern.net/static/js/darkmode.js
 */

if (typeof(window.UDIA) == "undefined") {
  window.UDIA = {};
}

/***********/
/* HELPERS */
/***********/

/**
 * Run the given function immediately if the page is already loaded, or add a listener to run it as soon as the page loads.
 * @param {*} f 
 */
function doWhenPageLoaded(f) {
  if (document.readyState == "complete") {
    f();
  } else {
    window.addEventListener("load", f);
  }
}

/**
 * Adds an event listener to a button (or other clickable element), attaching
 * it to both "click" and "keyup" events (for use with keyboard navigation).
 * Optionally also attaches the listener to the 'mousedown' event, making the
 * element activate on mouse down instead of mouse up.
 * @param {*} func 
 * @param {*} includeMouseDown 
 */
function addActivateEvent(fn, includeMouseDown) {
  let ael = function (event) {
    if (event.button === 0 || event.key === ' ') fn(event);
  }
  this.activateEventListener = ael;
  if (includeMouseDown) this.addEventListener("mousedown", ael);
  this.addEventListener("click", ael);
  this.addEventListener("keyup", ael);
}
Element.prototype.addActivateEvent = addActivateEvent;

/**
 * Adds a scroll event listener to the page.
 * @param {*} fn 
 * @param {string?} name 
 */
function addScrollListener(fn, name) {
  let wrapper = (event) => {
    requestAnimationFrame(() => {
      fn(event);
      document.addEventListener("scroll", wrapper, { once: true, passive: true });
    });
  }
  document.addEventListener("scroll", wrapper, { once: true, passive: true });

  // Retain a reference to the scroll listener, if a name is provided.
  if (typeof name == "string")
    GW[name] = wrapper;
}

/************************/
/* ACTIVE MEDIA QUERIES */
/************************/

/*  This function provides two slightly different versions of its functionality,
    depending on how many arguments it gets.

    If one function is given (in addition to the media query and its name), it
    is called whenever the media query changes (in either direction).

    If two functions are given (in addition to the media query and its name),
    then the first function is called whenever the media query starts matching,
    and the second function is called whenever the media query stops matching.

    If you want to call a function for a change in one direction only, pass an
    empty closure (NOT null!) as one of the function arguments.

    There is also an optional fifth argument. This should be a function to be
    called when the active media query is canceled.
    */
function doWhenMatchMedia(mediaQuery, name, ifMatchesOrAlwaysDo, otherwiseDo = null, whenCanceledDo = null) {
  if (typeof GW.mediaQueryResponders == "undefined")
    GW.mediaQueryResponders = {};

  let mediaQueryResponder = (event, canceling = false) => {
    if (canceling) {
      if (whenCanceledDo != null)
        whenCanceledDo(mediaQuery);
    } else {
      let matches = (typeof event == "undefined") ? mediaQuery.matches : event.matches;

      if (otherwiseDo == null || matches) ifMatchesOrAlwaysDo(mediaQuery);
      else otherwiseDo(mediaQuery);
    }
  };
  mediaQueryResponder();
  mediaQuery.addListener(mediaQueryResponder);

  GW.mediaQueryResponders[name] = mediaQueryResponder;
}

/*  Deactivates and discards an active media query, after calling the function
    that was passed as the whenCanceledDo parameter when the media query was
    added.
    */
function cancelDoWhenMatchMedia(name) {
  GW.mediaQueryResponders[name](null, true);

  for ([key, mediaQuery] of Object.entries(GW.mediaQueries))
    mediaQuery.removeListener(GW.mediaQueryResponders[name]);

  GW.mediaQueryResponders[name] = null;
}

/******************/
/* MODE SELECTION */
/******************/

function injectModeSelector() {
  // retrieve the local theme mode setting
  let currentMode = localStorage.getItem("selected-mode") || "auto";

  let themeSelector = document.getElementById("theme-selector");
  themeSelector.style.setProperty("visibility", "visible");

  // by default, this is the 'auto' css styles
  let themeStyle = document.querySelector("#dark-theme");
  window.UDIA.themeSelector = themeSelector;
  window.UDIA.themeStyle = themeStyle;
  window.UDIA.themeStyleHTML = `${themeStyle.innerHTML}`;

  themeSelector.querySelectorAll("button").forEach(function(button) {
    button.addActivateEvent(function(event) {
      // Determine which setting was chosen (i.e., which button was clicked).
      let selectedMode = event.target.dataset.name;

      // Save the new setting.
      if (selectedMode == "auto") {
        localStorage.removeItem("selected-mode");
      } else {
        localStorage.setItem("selected-mode", selectedMode);
      }

      // Actually change the mode.
      setMode(selectedMode);
    });
  });

  setMode(currentMode);

  // We pre-query the relevant elements, so we do not have to run queryAll on
  // every firing of the scroll listener.
  // GW.scrollState = {
  //   "lastScrollTop": window.pageYOffset || document.documentElement.scrollTop,
  //   "unbrokenDownScrollDistance": 0,
  //   "unbrokenUpScrollDistance": 0,
  //   "modeSelector": document.querySelectorAll("#mode-selector"),
  // };
  // addScrollListener(updateModeSelectorVisibility, "updateModeSelectorVisibilityScrollListener");
  // GW.scrollState.modeSelector[0].addEventListener("mouseover", () => { showModeSelector(); });
  // doWhenMatchMedia(GW.mediaQueries.systemDarkModeActive, "updateModeSelectorStateForSystemDarkMode", () => { updateModeSelectorState(); });
}

/*  Show/hide the mode selector in response to scrolling.

    */
function updateModeSelectorVisibility(event) {
  let newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  GW.scrollState.unbrokenDownScrollDistance = (newScrollTop > GW.scrollState.lastScrollTop) ?
    (GW.scrollState.unbrokenDownScrollDistance + newScrollTop - GW.scrollState.lastScrollTop) :
    0;
  GW.scrollState.unbrokenUpScrollDistance = (newScrollTop < GW.scrollState.lastScrollTop) ?
    (GW.scrollState.unbrokenUpScrollDistance + GW.scrollState.lastScrollTop - newScrollTop) :
    0;
  GW.scrollState.lastScrollTop = newScrollTop;

  // Hide mode selector when scrolling a full page down.
  if (GW.scrollState.unbrokenDownScrollDistance > window.innerHeight) {
    hideModeSelector();
  }

  // On desktop, show mode selector when scrolling to top of page,
  // or a full page up.
  // On mobile, show mode selector on ANY scroll up.
  if (GW.mediaQueries.mobileNarrow.matches) {
    if (GW.scrollState.unbrokenUpScrollDistance > 0 || GW.scrollState.lastScrollTop <= 0)
      showModeSelector();
  } else if (GW.scrollState.unbrokenUpScrollDistance > window.innerHeight
    || GW.scrollState.lastScrollTop == 0) {
    showModeSelector();
  }
}

function hideModeSelector() {
  GW.scrollState.modeSelector[0].classList.add("hidden");
}

function showModeSelector() {
  GW.scrollState.modeSelector[0].classList.remove("hidden");
}

/*  Update the states of the mode selector buttons.
    */
function updateModeSelectorState() {
  // Get saved mode setting (or default).
  let currentMode = localStorage.getItem("selected-mode") || 'auto';

  // Clear current buttons state.
  window.UDIA.themeSelector.querySelectorAll("button").forEach(function(button) {
    button.classList.remove("active", "selected");
    button.disabled = false;
  });

  // Set the correct button to be selected.
  window.UDIA.themeSelector.querySelectorAll(`.select-mode-${currentMode}`).forEach(button => {
    button.classList.add("selected", "active");
    button.disabled = true;
  });

  // Ensure the right button (light or dark) has the 'currently active'
  // indicator, if the current mode is 'auto'
  if (currentMode == "auto") {
    if (matchMedia("(prefers-color-scheme: dark)").matches) {
      window.UDIA.themeSelector.querySelector(".select-mode-dark").classList.add("active");
    } else {
      window.UDIA.themeSelector.querySelector(".select-mode-light").classList.add("active");
    }
  }
}

/*  Set specified color mode (auto, light, dark).
    */
function setMode(modeOption) {
  // Inject the appropriate styles.
  if (modeOption == 'auto') {
    window.UDIA.themeStyle.innerHTML = window.UDIA.themeStyleHTML;
  } else if (modeOption == 'dark') {
    let re = /^.*{(\:root.*)\}\s*$/;
    window.UDIA.themeStyle.innerHTML = re.exec(window.UDIA.themeStyleHTML)[1];
  } else {
    window.UDIA.themeStyle.innerHTML = "";
  }

  // Update selector state.
  updateModeSelectorState();
}

doWhenPageLoaded(injectModeSelector);
