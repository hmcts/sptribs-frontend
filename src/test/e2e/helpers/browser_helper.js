module.exports = class BrowserHelpers extends Helper {
  getHelper() {
    return this.helpers['Playwright'];
  }

  isPlaywright() {
    return this.helpers['Playwright'];
  }

  async getBrowser() {
    const helper = this.getHelper();
    return this.isPlaywright() ? helper.browser() : helper.config.browser;
  }

  async clickBrowserBack() {
    const helper = this.getHelper();
    return this.isPlaywright() ? helper.goBack() : helper.page.goBack();
  }

  async reloadPage() {
    const helper = this.getHelper();
    return this.isPlaywright() ? helper.reload() : helper.refreshPage();
  }

  async locateSelector(selector) {
    const helper = this.getHelper();
    return helper.locator(selector);
  }

  async hasSelector(selector) {
    return (await this.locateSelector(selector)).length > 0;
  }

  async waitForSelector(locator, sec) {
    const helper = this.getHelper();
    try {
      const waitTimeout = sec ? sec * 1000 : helper.options.waitForTimeout;
      return await helper.waitForSelector(locator, { timeout: waitTimeout });
    } catch (error) {
      return undefined;
    }
  }

  async waitForAnySelector(selectors, maxWaitInSecond) {
    return this.waitForSelector([].concat(selectors).join(','), maxWaitInSecond);
  }

  async canSee(selector) {
    const helper = this.getHelper();
    try {
      const elements = await this.locateSelector(selector);
      return elements.length > 0 && await elements[0].isVisible();
    } catch (err) {
      return false;
    }
  }

  async grabText(locator) {
    const elements = await this.locateSelector(locator);
    return elements.length > 0 ? await elements[0].textContent() : undefined;
  }

  async grabAttribute(locator, attr) {
    const elements = await this.locateSelector(locator);
    return elements.length > 0 ? await elements[0].getAttribute(attr) : undefined;
  }

  async canClick(selector) {
    const elements = await this.locateSelector(selector);
    return elements.length > 0 && await elements[0].isClickable();
  }

  async scrollToElement(selector) {
    const helper = this.getHelper();
    const elements = await this.locateSelector(selector);
    if (elements.length > 0) {
      return this.isPlaywright()
        ? helper.evaluate((selectorArg) => document.querySelector(selectorArg).scrollIntoView(), selector)
        : helper.executeScript('arguments[0].scrollIntoView()', elements[0]);
    }
  }
};
