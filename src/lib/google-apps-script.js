// ============================================================
// Google Apps Script - TodoList Backend
// ============================================================
// 배포 방법:
//   1. Google Sheets 새 스프레드시트 생성
//   2. 확장 프로그램 > Apps Script 클릭
//   3. 이 코드를 Code.gs에 붙여넣기
//   4. SPREADSHEET_ID를 본인의 스프레드시트 ID로 변경
//   5. 배포 > 새 배포 > 웹 앱
//      - 실행 주체: 본인
//      - 액세스 권한: 모든 사용자
//   6. 배포 후 웹 앱 URL을 복사하여 .env.local에 설정
// ============================================================

// 스프레드시트 ID (URL에서 /d/ 뒤의 값)
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
var SHEET_NAME = "Todos";
var CATEGORIES_SHEET_NAME = "Categories";

// 컬럼 매핑 (1-indexed)
var COL = {
  ID: 1,
  EMAIL: 2,
  TITLE: 3,
  DESCRIPTION: 4,
  CATEGORY: 5,
  PRIORITY: 6,
  DUE_DATE: 7,
  COMPLETED: 8,
  CREATED_AT: 9,
};

function getSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 9).setValues([
      [
        "id",
        "userEmail",
        "title",
        "description",
        "category",
        "priority",
        "dueDate",
        "completed",
        "createdAt",
      ],
    ]);
  }
  return sheet;
}

function getCategoriesSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CATEGORIES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CATEGORIES_SHEET_NAME);
    sheet.getRange(1, 1, 1, 2).setValues([["userEmail", "categories"]]);
  }
  return sheet;
}

function rowToTodo(row) {
  return {
    id: row[0],
    title: row[2],
    description: row[3] || "",
    category: row[4] || "기타",
    priority: row[5] || "medium",
    dueDate: row[6] || null,
    completed:
      row[7] === true || row[7] === "TRUE" || row[7] === "true",
    createdAt: row[8] || new Date().toISOString(),
  };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getUserCategories(email) {
  var defaultCats = ["업무", "개인", "공부", "건강", "기타"];
  var catSheet = getCategoriesSheet();
  var lastRow = catSheet.getLastRow();
  if (lastRow <= 1) return defaultCats;

  var data = catSheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === email) {
      try {
        var parsed = JSON.parse(data[i][1]);
        return parsed.length > 0 ? parsed : defaultCats;
      } catch (err) {
        return defaultCats;
      }
    }
  }
  return defaultCats;
}

function saveUserCategories(email, categories) {
  var catSheet = getCategoriesSheet();
  var lastRow = catSheet.getLastRow();

  if (lastRow > 1) {
    var data = catSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === email) {
        catSheet.getRange(i + 2, 2).setValue(JSON.stringify(categories));
        return;
      }
    }
  }

  catSheet.appendRow([email, JSON.stringify(categories)]);
}

// ============================================================
// GET 핸들러
// ============================================================
function doGet(e) {
  var action = e.parameter.action;
  var email = e.parameter.email;

  if (action === "getTodos" && email) {
    return getTodos(email);
  }

  return jsonResponse({ error: "Invalid request" });
}

// ============================================================
// POST 핸들러
// ============================================================
function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var action = payload.action;
  var email = payload.email;

  switch (action) {
    case "create":
      return createTodo(email, payload.todo);
    case "update":
      return updateTodoAction(email, payload.id, payload.updates);
    case "delete":
      return deleteTodoAction(email, payload.id);
    case "toggle":
      return toggleTodoAction(email, payload.id);
    default:
      return jsonResponse({ error: "Unknown action: " + action });
  }
}

// ============================================================
// CRUD 함수들
// ============================================================

function getTodos(email) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse({
      todos: [],
      categories: ["업무", "개인", "공부", "건강", "기타"],
    });
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var todos = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][COL.EMAIL - 1] === email) {
      todos.push(rowToTodo(data[i]));
    }
  }

  var categories = getUserCategories(email);
  return jsonResponse({ todos: todos, categories: categories });
}

function createTodo(email, todo) {
  var sheet = getSheet();
  sheet.appendRow([
    todo.id,
    email,
    todo.title,
    todo.description || "",
    todo.category || "기타",
    todo.priority || "medium",
    todo.dueDate || "",
    false,
    todo.createdAt || new Date().toISOString(),
  ]);

  var categories = getUserCategories(email);
  if (todo.category && categories.indexOf(todo.category) === -1) {
    categories.push(todo.category);
    saveUserCategories(email, categories);
  }

  return jsonResponse({
    id: todo.id,
    title: todo.title,
    description: todo.description || "",
    category: todo.category || "기타",
    priority: todo.priority || "medium",
    dueDate: todo.dueDate || null,
    completed: false,
    createdAt: todo.createdAt,
  });
}

function updateTodoAction(email, id, updates) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonResponse({ error: "Not found" });

  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][COL.ID - 1] === id && data[i][COL.EMAIL - 1] === email) {
      var rowIndex = i + 2;
      if (updates.title !== undefined)
        sheet.getRange(rowIndex, COL.TITLE).setValue(updates.title);
      if (updates.description !== undefined)
        sheet.getRange(rowIndex, COL.DESCRIPTION).setValue(updates.description);
      if (updates.category !== undefined)
        sheet.getRange(rowIndex, COL.CATEGORY).setValue(updates.category);
      if (updates.priority !== undefined)
        sheet.getRange(rowIndex, COL.PRIORITY).setValue(updates.priority);
      if (updates.dueDate !== undefined)
        sheet
          .getRange(rowIndex, COL.DUE_DATE)
          .setValue(updates.dueDate || "");
      if (updates.completed !== undefined)
        sheet.getRange(rowIndex, COL.COMPLETED).setValue(updates.completed);

      if (updates.category) {
        var categories = getUserCategories(email);
        if (categories.indexOf(updates.category) === -1) {
          categories.push(updates.category);
          saveUserCategories(email, categories);
        }
      }

      var updatedRow = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
      return jsonResponse(rowToTodo(updatedRow));
    }
  }

  return jsonResponse({ error: "Not found" });
}

function deleteTodoAction(email, id) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonResponse({ error: "Not found" });

  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][COL.ID - 1] === id && data[i][COL.EMAIL - 1] === email) {
      sheet.deleteRow(i + 2);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: "Not found" });
}

function toggleTodoAction(email, id) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonResponse({ error: "Not found" });

  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][COL.ID - 1] === id && data[i][COL.EMAIL - 1] === email) {
      var rowIndex = i + 2;
      var currentVal = data[i][COL.COMPLETED - 1];
      var newVal = !(
        currentVal === true ||
        currentVal === "TRUE" ||
        currentVal === "true"
      );
      sheet.getRange(rowIndex, COL.COMPLETED).setValue(newVal);

      var updatedRow = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
      return jsonResponse(rowToTodo(updatedRow));
    }
  }

  return jsonResponse({ error: "Not found" });
}
