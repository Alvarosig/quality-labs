import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { World } from './world';

setDefaultTimeout(30_000);

Before(async function (this: World) {
  await this.openBrowser();
});

After(async function (this: World) {
  await this.closeBrowser();
});
