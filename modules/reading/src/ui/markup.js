export const pickerMarkup = `  <div class="reader-shell">
    <header class="topbar">
      <a class="brand" href="#/reading/picker" aria-label="Reader Picker home">Reader Picker</a>
      <button id="settingsButton" class="icon-button" type="button" aria-label="Open settings">Settings</button>
    </header>

    <section class="hero" aria-labelledby="pageTitle">
      <p class="eyebrow">READWISE READER</p>
      <h1 id="pageTitle">Pick something to finish.</h1>
      <p id="summary" class="summary">Choose a reading window and get unfinished items that fit.</p>
    </section>

    <form id="reader-controls" class="controls" aria-label="Picker options">
      <label>
        <span>Time left</span>
        <select id="minutesInput">
          <option value="5">5 minutes</option>
          <option value="10" selected>10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="0">Any length</option><option value="custom">Custom</option>
        </select>
      </label>
      <label>
        <span>Options</span>
        <select id="countInput">
          <option value="1">1 option</option>
          <option value="3" selected>3 options</option>
          <option value="5">5 options</option><option value="custom">Custom</option>
        </select>
      </label>
      <button id="pickButton" class="primary-button" type="button">Pick for me</button>
      <label id="customMinutesLabel" hidden><span>Custom minutes</span><input id="customMinutes" type="number" min="1" max="10000" step="1"></label>
      <label id="customCountLabel" hidden><span>Custom count</span><input id="customCount" type="number" min="1" max="20" step="1"></label>
    </form>

    <p id="readerFreshness" class="summary" data-reader-freshness hidden></p>
    <p id="status" class="status" role="status" aria-live="polite"></p>
    <section id="lastItemSection" class="last-item hidden" aria-labelledby="lastItemTitle">
      <p class="eyebrow">CONTINUE READING</p>
      <h2 id="lastItemTitle">Last opened item</h2>
      <div id="lastItem" class="results"></div>
    </section>
    <section id="results" class="results" aria-label="Reader picks"></section>

    <footer>
      <button id="refreshButton" class="text-button" type="button">Refresh Reader</button>
      <button id="againButton" class="text-button hidden" type="button">Pick different items</button>
    </footer>
  </div>

  <dialog id="settingsDialog">
    <form id="settingsForm" method="dialog">
      <div class="dialog-header">
        <div>
          <p class="eyebrow">LOCAL SETTINGS</p>
          <h2>Settings</h2>
        </div>
        <button id="closeSettings" class="icon-button" type="button" aria-label="Close settings">Close</button>
      </div>

      <label class="field">
        <span>Readwise access token</span>
        <input id="tokenInput" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Paste token" autofocus />
        <small id="tokenStorageHelp">Kept in memory unless you choose to retain it for this browser session. It is never added to the URL.</small>
      </label>

      <label class="check">
        <input id="rememberToken" type="checkbox" />
        <span id="rememberTokenLabel">Keep token until this browser session ends</span>
      </label>

      <fieldset id="reader-location-order">
        <legend>Locations, in priority order</legend>
        <div class="location-row" data-location="new"><label class="check"><input id="locationNew" type="checkbox" checked /> Inbox</label><button type="button" data-location-up="new" aria-label="Move up">↑</button><button type="button" data-location-down="new" aria-label="Move down">↓</button></div>
        <div class="location-row" data-location="later"><label class="check"><input id="locationLater" type="checkbox" checked /> Later</label><button type="button" data-location-up="later" aria-label="Move up">↑</button><button type="button" data-location-down="later" aria-label="Move down">↓</button></div>
        <div class="location-row" data-location="shortlist"><label class="check"><input id="locationShortlist" type="checkbox" checked /> Shortlist</label><button type="button" data-location-up="shortlist" aria-label="Move up">↑</button><button type="button" data-location-down="shortlist" aria-label="Move down">↓</button></div>
      </fieldset>

      <label class="field">
        <span>Progress</span>
        <select id="progressInput">
          <option value="unfinished" selected>Unread + started, excluding completed</option>
          <option value="started">Started but not completed</option>
          <option value="unread">Unread only</option>
        </select>
      </label>

      <label class="field">
        <span>Cache duration</span>
        <select id="cacheMinutesInput">
          <option value="5">5 minutes</option>
          <option value="15" selected>15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </label>

      <label class="field">
        <span>Maximum documents scanned per location</span>
        <select id="scanLimitInput">
          <option value="100">100</option>
          <option value="300">300</option>
          <option value="500" selected>500</option>
          <option value="1000">1,000</option><option value="2000">2,000</option>
        </select>
        <small>Higher values produce broader randomness but require more API requests.</small>
      </label>

      <fieldset>
        <legend>Picker behavior</legend>
        <label class="check">
          <input id="updateUrlOnPick" type="checkbox" />
          Update the URL when picking
        </label>
        <small>The URL will contain the current options and run automatically when opened, so you can copy or bookmark it.</small>
        <label class="check">
          <input id="autoOpenSingle" type="checkbox" />
          Open automatically when Options is 1
        </label>
        <label class="check">
          <input id="rememberLastItem" type="checkbox" />
          Remember the last item opened
        </label>
        <small>Shows it again next time unless it has been archived or finished.</small>
      </fieldset>

      <label class="field"><span>Selection policy</span><select id="policyInput"><option value="started-first">Started first</option><option value="uniform">Uniform random</option></select></label>
      <label class="check"><input id="includeUnknown" type="checkbox"> Include unknown durations within a time budget</label>
      <div class="dialog-actions">
        <button id="testButton" class="secondary-button" type="button">Test token</button>
        <button class="primary-button" value="save" type="submit">Save</button>
      </div>
      <div class="privacy-actions">
        <button id="forgetTokenButton" class="text-button" type="button">Forget token and cache</button>
        <button id="clearDataButton" class="text-button danger-button" type="button">Clear all local data</button>
      </div>
      <p id="settingsStatus" class="status" role="status" aria-live="polite"></p>
    </form>
  </dialog>

`;
