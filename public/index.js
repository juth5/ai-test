let modelSelectElement = {};
let imageUrl = '';

document.addEventListener('DOMContentLoaded', () => {
  
  let textareaElement = document.getElementById("textarea");
  let questionContainerElement = document.getElementById("question-container");
  let formElement = document.getElementById("form");
  let resultElement = document.getElementById("result");
  let fileInputElement = document.getElementById("file-input");
  let selectedFileText = '';
  let overlayElement = document.getElementById("overlay");
  modelSelectElement = document.getElementById("model-select");
  let sideSelectElement = document.getElementById("side-select");

  //let imageInputElement = document.getElementById("image-input");

  // fileInputElement.addEventListener("change", async (event) => {
  //   const file = event.target.files[0]; // 1つ目のファイルを取得
  //   if (!file) return; // 何も選ばれていないときは終了
  //   selectedFileText = await file.text(); // ← 中身を文字列として取得！
  // });

  // imageInputElement.addEventListener("change", (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
    
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const img = document.createElement("img");
  //     img.src = e.target.result;
  //     imageUrl = e.target.result;

  //     img.style.maxWidth = "300px";
  //     img.style.maxHeight = "300px";
      
  //     const previewContainer = document.getElementById("image-preview");
  //     previewContainer.innerHTML = ""; // 既存のプレビューをクリア
  //     previewContainer.appendChild(img); // 新しい画像を追加
  //   };
  //   reader.readAsDataURL(file);
  // });


//考慮事項を入れる
const questions = [
  { 
    id: "get", 
    question: "一覧・詳細表示などの取得処理がある(GET)", 
    consideration: "0件の場合の考慮があるか（フロントエンド）, 件数が多い場合のスクロール考慮はあるか（フロントエンド）" 
  },
  { 
    id: "insert", 
    question: "新規登録処理がある(Insert)",
    consideration: "二重登録の防止（連打対策）は考慮されているか（フロントエンド）, 登録完了後の画面遷移は考慮されているか（フロントエンド）, トランザクションの適切な使用はされているか（バックエンド）"
  },
  { 
    id: "update", 
    question: "更新処理がある(Update)",
    consideration: "更新対象が見つからない場合の考慮はしているか（バックエンド）, 一時保存でその場にとどまる際、必要な変数は更新されているか（フロントエンド）, 更新後、再度続けて更新ができるか（フロントエンド）"
  },
  { 
    id: "delete", 
    question: "削除処理がある(Delete)",
    consideration: "削除確認ダイアログを出しているか, 削除後のフィードバックを出しているか, 消すべきデータが完全に消えているか(バックエンド)"
  },
  { 
    id: "bulk", 
    question: "CSV取込処理がある",
    consideration: "文字コード（UTF-8/Shift-JIS）の考慮をしているか, 空行や不正な行の扱いを考慮しているか, 大容量ファイル（1万行以上）のタイムアウト"
  },
  { 
    id: "number", 
    question: "数値を扱う",
    consideration: "小数点以下の桁数と丸め処理, 0が表示されているか, 0をfalseとして判定していないか"
  },
  { 
    id: "string", 
    question: "文字列の自由入力がある", 
    consideration: "英語、数字の際に折り返すようになっているか, XSS対策（スクリプトタグの無害化）, SQLインジェクション対策, 絵文字・サロゲートペアの扱い, トリム処理をしているか（前後空白）, 最大文字数のバリデーションをしているか"
  },
  { 
    id: "date", 
    question: "日付・時刻を扱う",
    consideration: "存在しない日付を入れた場合の考慮はできているか, 開始日＞終了日の逆転の考慮はできているか, 閏年の扱い, 日付表示のフォーマットはサービスないで統一されているか"
  },
  { 
    id: "required", 
    question: "必須項目がある",
    consideration: "クライアント側とサーバー側両方でのバリデーションが考慮されているか, エラーメッセージの表示位置と内容はユーザー目線か,入力補助（プレースホルダー）の適切性"
  },
  { 
    id: "role", 
    question: "権限やユーザーの役割によって表示や操作が変わる",
    consideration: "一般ユーザーでは問題ないが、管理者など特殊ユーザーの場合も問題なく表示されるか"
  },
  { 
    id: "pagination", 
    question: "一覧にページング機能がある",
    consideration: "1ページ以外目以外で検索して1ページしかない場合に、正しく表示されるか, 件数変更時に現在のページが範囲外になる場合の考慮, フィルター条件変更を変更した際、ページネーションもそれに合わせて変わるか"
  },
  { 
    id: "order", 
    question: "一覧データ取得後の並びに何らかの規則がある",
    consideration: "並び順が業務ルールに適合しているか"
  },
  { 
    id: "calc", 
    question: "計算処理がある",
    consideration: "浮動小数点演算の誤差対策, 除算時のゼロ除算エラー（0で割り算してないか）"
  },
  { 
    id: "file", 
    question: "ファイルのアップロード・ダウンロード機能がある",
    consideration: "許可する拡張子の制限は考慮されているか, ファイルサイズ上限は考慮されているか, ファイル名の特殊文字処理, 同名ファイルの上書き防止はされているか（一意なファイル名になっているか）, MIMEタイプの検証"
  },
  { 
    id: "export", 
    question: "CSVやPDF出力機能がある",
    consideration: "大量データ出力時のタイムアウト, 文字化けの考慮, 改行やカンマを含むデータのエスケープ, 出力ファイル名の命名規則はあるか"
  },
  {
    id: "responsive",
    question: "レスポンシブ対応を考慮する必要がある",
    consideration: "画面サイズごとのレイアウト崩れはないか"
  },
  {
    id: "feedback",
    question: "ローディングなどのフィードバックがある",
    consideration: "正常処理は正しく、フィードバックできるが、エラー時も正しくフィードバックできるか, エラー時にもローディングなどのフィードバクが消えるか",
  },

];



  questions.forEach((question) => {
    let div = document.createElement("div");
    let label = document.createElement("label");
    let checkbox = document.createElement("input");
    let p = document.createElement("p");

    checkbox.type = "checkbox";
    checkbox.id = question.id;
    checkbox.className = "question-checkbox mr12";
    checkbox.value = question.question;
    p.textContent = question.question;

    label.className = "f fm";
    label.appendChild(checkbox);
    label.appendChild(p);

    div.className = "mb8";
    div.appendChild(label);
    questionContainerElement.appendChild(div);

  });

  //フォーム送信時の処理
  formElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    openLoadingModal(overlayElement);

    let response_mail_text = textareaElement.value;
    let side = sideSelectElement.value;

    //チェックボックスの値を配列に格納
    let check_box_options = [];
    document.querySelectorAll('.question-checkbox').forEach((checkbox) => {
      if (checkbox.checked) {
        check_box_options.push(checkbox.value);
      }
    });

    let selectedOptionsText = check_box_options.join('、'); // ← 日本語の読点で区切る
    let format_text = '以下のテキスト内容を汲み取って、ソフトウェアの単体,結合のテスト項目を書いてください。こういう機能があれば、こういう観点のテストが必要なはずだという一般的な観点で書いてください。見落としがちなあるあるネタがあるといいです。例えば、数値を扱う時に0をfalseとして判定していないかなどです。回答はCSV形式で返してください。ヘッダーは  ["テスト項目", "入力条件", "期待する結果"],です。回答は、```csv と ``` で囲んでください。';
    let final_text = `${format_text} 今回は${side}の観点を重視して回答してください。多くても30項目くらいでお願いします。 以下は、ユーザーが今回のテストについて記載した情報です。以下の情報から推測して書いてください。${response_mail_text} ${selectedOptionsText}`;
    
    try {
      let response_data = await getChatGptResponse(final_text);
      let csv_text = getExtractCsv(response_data);
      
      if (!csv_text) {
        resultElement.textContent = response_data;
        alert("CSV形式の回答が取得できませんでしたが、出力結果には反映されました。");
      }
      else {
        resultElement.textContent = response_data;
        const blob = new Blob([csv_text], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test_cases.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert(e.message);
      console.error("Error logging final_text:", e);
    }
    finally {
      closeLoadingModal(overlayElement);
    }
  });
});


let getChatGptResponse = async (final_text) => {
  let model = modelSelectElement.value;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: final_text, model: model }),
    });
    const data = await res.json();
    const message = data.reply || "（応答を取得できませんでした）";
    return message;
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
};

let getExtractCsv = (md) => {
  const m = md.match(/```csv\s*([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
};

let openLoadingModal = (overlayElement) => {
    overlayElement.classList.remove("hide");
    overlayElement.classList.add("show");
};

let closeLoadingModal = (overlayElement) => {
    overlayElement.classList.remove("show");
    overlayElement.classList.add("hide");
}
