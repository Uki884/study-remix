import { page } from "@/context.server";

export const formatTableData = async () => {
  // 外側のtdタグを基準にテーブルを特定するセレクタ
  const selector = ".historyTable table";

  // テーブル内の全ての行を取得
  const rows = await page.$$(`${selector} > tbody > tr`);
  rows.shift();
  // 行データを格納するための配列
  const tableData = [];
  rows.shift();

  for (const row of rows) {
    // 各行のセルデータを取得
    const cellsText = await row.$$eval("td", (cells) =>
      cells.map((cell) => {
        // fontタグ内のテキストまたはセルのテキストを取得
        const font = cell.querySelector("font");
        return font ? font.innerText.trim() : cell.innerText.trim();
      })
    );
    // 1行目はヘッダなのでスキップ
    // [ '', '月日', '種別', '利用場所', '種別', '利用場所', '残高', '入金・利用額' ]

    // [ '', '01/02', '物販', '', '', '', '\\1,612', '-213' ]
    cellsText.shift();
    const data = {
      date: cellsText[0],
      startType: cellsText[1],
      startStation: cellsText[2],
      endType: cellsText[3],
      endStation: cellsText[4],
      balance: cellsText[5],
      fare: cellsText[6],
    };
    // 行データを配列に追加
    tableData.push(data);
  }
  const filtererData = tableData.filter((data) => !['物販', 'ｶｰﾄﾞ'].includes(data.startType));

  return filtererData;
};