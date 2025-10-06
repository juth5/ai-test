let modelSelectElement = {};

document.addEventListener('DOMContentLoaded', () => {
  
  let textareaElement = document.getElementById("textarea");
  let questionContainerElement = document.getElementById("question-container");
  let formElement = document.getElementById("form");
  let resultElement = document.getElementById("result");
  let fileInputElement = document.getElementById("file-input");
  let selectedFileText = '';
  let overlayElement = document.getElementById("overlay");
  modelSelectElement = document.getElementById("model-select");

  fileInputElement.addEventListener("change", async (event) => {
      const file = event.target.files[0]; // 1つ目のファイルを取得

      if (!file) return; // 何も選ばれていないときは終了

      selectedFileText = await file.text(); // ← 中身を文字列として取得！
  });



const questions = [
  { id: "get", question: "一覧・詳細表示などの取得処理がある" },
  { id: "insert", question: "新規登録処理がある" },
  { id: "update", question: "更新処理がある" },
  { id: "delete", question: "削除処理がある" },
  { id: "bulk", question: "CSV取込処理がある" },
  { id: "number", question: "数値を扱う（桁数・小数点・0の扱いなど）" },
  { id: "string", question: "文字列の自由入力がある（全角・半角・特殊文字・制限）" },
  { id: "date", question: "日付・時刻を扱う（フォーマット、未来・過去制限）" },
  { id: "required", question: "必須項目の検証がある" },
  { id: "auth", question: "認証やセッション管理がある" },
  { id: "role", question: "権限によって表示や操作が変わる" },
  { id: "pagination", question: "一覧にページング機能がある" },
  { id: "sortFilter", question: "一覧にソート・フィルタ機能がある" },
  { id: "order", question: "一覧データ取得後の並びにはルールがある" },
  { id: "calc", question: "計算処理がある" },
  { id: "file", question: "ファイルのアップロード・ダウンロード機能がある" },
  { id: "export", question: "CSVやPDF出力機能がある" },
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




  

  formElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    overlayElement.classList.remove("hide");
    overlayElement.classList.add("show");

    let response_mail_text = textareaElement.value;

    //チェックボックスの値を配列に格納
    let check_box_options = [];
    document.querySelectorAll('.question-checkbox').forEach((checkbox) => {
      if (checkbox.checked) {
        check_box_options.push(checkbox.value);
      }
    });

    let selectedOptionsText = check_box_options.join('、'); // ← 日本語の読点で区切る
    let format_text = '以下のテキスト内容を汲み取って、ソフトウェアの単体と結合レベルのテスト項目を書いてください。こういう機能があれば、こういう観点のテストが必要なはずだという憶測、一般的な観点、まは見落としがちなことを書いてください。例えば、数値を扱う時に0をfalseとして判定していないかなどです。回答はCSV形式で返してください。ヘッダーは  ["テスト項目", "入力条件", "期待する結果"],です。回答は、```csv と ``` で囲んでください。';
    let final_text = `${format_text} ${response_mail_text} ${selectedOptionsText} 以下は、他の機能のテスト項目でこんな感じを参考にして書いても大丈夫です。 ${selectedFileText}`;
    
    let response_data = await getChatGptResponse(final_text);


    resultElement.textContent = response_data;
    let csv_text = extractCsv(response_data);




    if (!csv_text) return alert("CSVデータが見つかりません。");
    const blob = new Blob([csv_text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_cases.csv';
    a.click();
    URL.revokeObjectURL(url);
    overlayElement.classList.remove("show");
    overlayElement.classList.add("hide");
  });
});


let getChatGptResponse = async (final_text) => {
  let model = modelSelectElement.value;
  
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
};

let extractCsv = (md) => {
  const m = md.match(/```csv\s*([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
};




