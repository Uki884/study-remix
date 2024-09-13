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
  now: dayjs.Dayjs;

  constructor({ browserId }: SuicaPayload) {
    this.browserId = browserId;
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
    console.log('available', available)
    if (!available.result) {
      return { data: [], error: available.message };
    }
  
    const result = await this.extractTransactionData()
    console.log('result', result)
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
      const thisYear = this.now.format('YYYY');
      const formatDate = `${thisYear}/${cellsText[0]}`;
      const data = {
        date: dayjs(formatDate).format('M/D (dd)'),
        originalDate: dayjs(formatDate, 'MM/DD'),
        weekDay: dayjs(formatDate).format('ddd'),
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
      // 今日が1週目だったら前月分のデータを取得。それ以外は今月分のデータを取得
      const prevMonth = this.now.subtract(1, 'month');
      // その月の最初の日
      const startOfMonth = this.now.startOf('month');
      // 渡された日付と月初めとの週の差分
      const weekOffset = this.now.diff(startOfMonth, 'week');
      const thisWeekNumber = weekOffset + 1;

      if (thisWeekNumber === 1) {
        if (prevMonth.startOf('month').format('MM') !== data.originalDate.format('MM')) return false;
      } else {
        if (this.now.startOf('month').format('MM') !== data.originalDate.format('MM')) return false;
      }
      return true;
    });
    return filteredData;
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
  }
}

export type SuicaResponse = Awaited<ReturnType<Suica['retrieveSuicaHistory']>>['data'];