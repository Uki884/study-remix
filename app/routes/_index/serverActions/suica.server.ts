import { getPageById } from "@/context.server";
import { dayjs } from "@/lib/dayjs";

export const sfHistoryElement = "#btn_sfHistory";
export const logoutElement = '.logoutBox a';

type SuicaPayload = {
  browserId: string;
  startStation?: string;
  endStation?: string;
}
export class Suica {
  browserId: string;
  startStation: string;
  endStation: string;
  now: dayjs.Dayjs;

  constructor({ browserId, startStation, endStation }: SuicaPayload) {
    this.browserId = browserId;
    this.startStation = startStation || "";
    this.endStation = endStation || "";
    this.now = dayjs();
  }

  async isLoggedIn() {
    const page = await getPageById(this.browserId);
    if (await page.isVisible(sfHistoryElement) || await page.isVisible('#btn_mobtop_node')) {
      return true;
    }
    return false;
  }

  public async gotoSuicaTop() {
    const page = await getPageById(this.browserId);
    await page.goto('https://www.mobilesuica.com/index.aspx');
  }

  public async retrieveSuicaHistory() {
    const page = await getPageById(this.browserId);
    const isLoggedIn = await this.isLoggedIn();
    if (!isLoggedIn) {
      return { data: [], error: 'ログインに失敗しました' };
    }
  
    await this.gotoSuicaTop();
    // 「SF(電子マネー)利用履歴」をクリック
     await page.waitForSelector(sfHistoryElement);
    // btn_sfHistoryの中のaタグをクリック
    await page.click(`${sfHistoryElement} a`);
  
    const available = await this.checkAvailability();
  
    if (!available.result) {
      return { data: [], error: available.message };
    }
  
    const result = await this.extractTransactionData()
    return { data: result, error: "" }
  }

  async checkAvailability() {
    const page = await getPageById(this.browserId);

    const closeText =
      "利用履歴表示が可能な時間は5:00～翌日0:50です。時間をお確かめの上、再度実行してください。";
    const pageContent = await page.textContent("body");
  
    if (pageContent?.includes(closeText)) {
      return { result: false, message: closeText };
    }
  
    return { result: true, message: "" };
  }

  public async extractTransactionData() {
    const page = await getPageById(this.browserId);
    // 外側のtdタグを基準にテーブルを特定するセレクタ
    const selector = ".historyTable table";
    await page.waitForSelector(selector);
    // テーブル内の全ての行を取得
    const rows = await page.$$(`${selector} > tbody > tr`);

    rows.shift();
    // 行データを格納するための配列
    const tableData = rows.map(async (row)=> {
      // 各行のセルデータを取得
        const cellsText = await row.$$eval("td", (cells) => {
          return cells.map((cell) => {
            return cell.innerText.trim();
          })
        }
      );
      cellsText.shift();
      const data = {
        date: dayjs(cellsText[0]).format('M/D (dd)'),
        originalDate: dayjs(cellsText[0], 'MM/DD'),
        weekDay: dayjs(cellsText[0]).format('ddd'),
        startType: cellsText[1],
        startStation: cellsText[2],
        endType: cellsText[3],
        endStation: cellsText[4],
        balance: cellsText[5],
        fare: cellsText[6],
      };
      return data;
    })

    const result = await Promise.all(tableData);
    const filteredData = result.filter((data) => {
      if (['物販', 'ｶｰﾄﾞ', '繰'].includes(data.startType)) return false
      if (['土', '日'].includes(data.weekDay)) return false;
      // 今月のデータのみを抽出
      if (this.now.startOf('month').format('MM') !== data.originalDate.format('MM')) return false;
      return true;
    });
 
    const filteredByStation = filteredData.filter((item) => {
      if (this.startStation === '' && this.endStation === '') return true
  
      // 乗車駅と降車駅が一致する場合
      if (item?.startStation === this.startStation && item?.endStation === this.endStation) return true
      // 乗車駅と降車駅が逆の場合
      if (item?.startStation === this.endStation && item?.endStation === this.startStation) return true
  
      if (item?.startStation === this.endStation) return true
    
      return false;
    });
    return filteredByStation;
  }

  public async getCaptchaImage () {
    const page = await getPageById(this.browserId);
    const captchaElement = '.igc_TrendyCaptchaImage';

    const visibleImage = await page.isVisible(captchaElement);
  
    if (!visibleImage) {
      return null;
    }
  
    const captcha = page.locator(captchaElement)
  
    try {
      const buffer = await captcha.screenshot();
      return buffer.toString('base64');
    } catch (e) {
      console.error(e);
      await page.screenshot({ path: 'error.png', fullPage: false });
      return null;
    }
  }

  public async login({ email, password, captcha }: {
    email: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
    captcha: FormDataEntryValue | null;
  }) {
    const page = await getPageById(this.browserId);
    // htmlのname属性がMailAddressのinputにemailを入力
    await page.locator('input[name="MailAddress"]').fill(email as string);
    // // htmlのname属性がPasswordのinputにpasswordを入力
    await page
      .getByRole("textbox", { name: "パスワード(半角)" })
      .fill(password as string);
    // // htmlのname属性がCaptchaのinputにcaptchaを入力
    await page.locator("#WebCaptcha1__editor").fill(captcha as string);
    // // ここで必要な情報を入力してログインボタンをクリック
    await page.click('button[name="LOGIN"]');
  }

  public async logout() {
    const page = await getPageById(this.browserId);
    await this.gotoSuicaTop();
    await page.click('.logoutBox a');
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
  };
}