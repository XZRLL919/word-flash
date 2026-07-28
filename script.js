// ========== 单词数据 ==========
var currentBank = "cet4";
var wordList = cet4Words;

// ========== 变量 ==========
var currentIndex = 0;
var dailyGoal = 10;
var todayLearned = 0;
var randomMode = false;

// ========== 获取页面元素 ==========
var card = document.getElementById("card");
var wordElement = document.getElementById("word");
var backWordElement = document.getElementById("backWord");
var meaningElement = document.getElementById("meaning");
var currentNumElement = document.getElementById("currentNum");
var totalNumElement = document.getElementById("totalNum");
var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");
var btnForgot = document.getElementById("btnForgot");
var btnRemember = document.getElementById("btnRemember");
var speakBtn = document.getElementById("speakBtn");
var homePage = document.getElementById("homePage");
var appPage = document.getElementById("appPage");
var startBtn = document.getElementById("startBtn");
var comingSoonBtn = document.getElementById("comingSoonBtn");

// ========== 本地存储功能 ==========
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key, defaultValue) {
  var data = localStorage.getItem(key);
  if (data === null) {
    return defaultValue;
  }
  return JSON.parse(data);
}

function saveCurrentIndex() {
  saveData("flashcard-currentIndex-" + currentBank, currentIndex);
}

function loadCurrentIndex() {
  return loadData("flashcard-currentIndex-" + currentBank, 0);
}

function saveHardWords(hardWordsList) {
  saveData("flashcard-hardWords-" + currentBank, hardWordsList);
}

function loadHardWords() {
  return loadData("flashcard-hardWords-" + currentBank, []);
}

function saveWordStatus(wordStatus) {
  saveData("flashcard-wordStatus-" + currentBank, wordStatus);
}

function loadWordStatus() {
  return loadData("flashcard-wordStatus-" + currentBank, {});
}

// ========== 单词状态 ==========
var wordStatus = loadWordStatus();
var hardWords = loadHardWords();

// ========== 函数 ==========
function showWord(index) {
  card.classList.remove("flipped");
  var word = wordList[index];
  wordElement.textContent = word.english;
  if (backWordElement) {
    backWordElement.textContent = word.english;
  }
  meaningElement.textContent = word.chinese;
  var exampleElement = document.getElementById("example");
  if (word.example) {
    exampleElement.textContent = simplifyText(word.example, 100);
    exampleElement.style.display = "block";
  } else {
    exampleElement.style.display = "none";
  }
  currentNumElement.textContent = index + 1;
  totalNumElement.textContent = wordList.length;
  currentIndex = index;
  saveCurrentIndex();
  updateCardMark();
}

function simplifyText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  var trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength - 1).replace(/\s+$/, "") + "…";
}

function updateCardMark() {
  var status = wordStatus[currentIndex];
  var markText = "";
  if (status === "know") {
    markText = " ✅已认识";
  } else if (status === "unknown") {
    markText = " ❌不认识";
  }
  wordElement.textContent = wordList[currentIndex].english + markText;
}

function nextWord() {
  if (randomMode) {
    // 随机模式：随机选一个单词
    var randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * wordList.length);
    } while (randomIndex === currentIndex && wordList.length > 1);
    showWord(randomIndex);
  } else {
    // 顺序模式
    var newIndex = currentIndex + 1;
    if (newIndex >= wordList.length) {
      newIndex = 0;
    }
    showWord(newIndex);
  }
}

function prevWord() {
  if (randomMode) {
    // 随机模式：随机选一个单词
    var randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * wordList.length);
    } while (randomIndex === currentIndex && wordList.length > 1);
    showWord(randomIndex);
  } else {
    // 顺序模式
    var newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = wordList.length - 1;
    }
    showWord(newIndex);
  }
}

function flipCard() {
  if (card.classList.contains("flipped")) {
    card.classList.remove("flipped");
  } else {
    card.classList.add("flipped");
  }
}

function markAsKnow() {
  wordStatus[currentIndex] = "know";
  saveWordStatus(wordStatus);
  updateCardMark();
  recordStudy();
  alert("👍 已记录：认识");
  nextWord();
}

function markAsUnknown() {
  wordStatus[currentIndex] = "unknown";
  saveWordStatus(wordStatus);
  var word = wordList[currentIndex];
  var alreadyInHard = false;
  for (var i = 0; i < hardWords.length; i++) {
    if (hardWords[i].english === word.english) {
      alreadyInHard = true;
      break;
    }
  }
  if (!alreadyInHard) {
    hardWords.push(word);
    saveHardWords(hardWords);
  }
  updateCardMark();
  recordStudy();
  alert("📝 已记录：不认识（已加入生词本）");
  nextWord();
}

// 发音功能
function speakWord() {
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance();
    utterance.text = wordList[currentIndex].english;
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("抱歉，你的浏览器不支持发音功能");
  }
}

// ========== 事件监听 ==========
speakBtn.addEventListener("click", function(event) {
  event.stopPropagation();
  speakWord();
});

card.addEventListener("click", flipCard);
nextBtn.addEventListener("click", nextWord);
prevBtn.addEventListener("click", prevWord);
btnRemember.addEventListener("click", markAsKnow);
btnForgot.addEventListener("click", markAsUnknown);

document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowRight") {
    nextWord();
  } else if (event.key === "ArrowLeft") {
    prevWord();
  } else if (event.key === " ") {
    event.preventDefault();
    flipCard();
  } else if (event.key === "s" || event.key === "S") {
    event.preventDefault();
    speakWord();
  }
});

// ========== 生词本页面功能 ==========
var hardWordsBtn = document.getElementById("hardWordsBtn");
var hardWordsPage = document.getElementById("hardWordsPage");
var hardWordsList = document.getElementById("hardWordsList");
var backBtn = document.getElementById("backBtn");
var homeBackBtn = document.getElementById("homeBackBtn");
var mainElements = document.querySelectorAll(".container > *:not(#hardWordsPage):not(#statsPage)");

function showHardWordsPage() {
  homePage.style.display = "none";
  appPage.style.display = "none";
  hardWordsPage.style.display = "block";
  statsPage.style.display = "none";
  renderHardWordsList();
}

function showAppPage() {
  homePage.style.display = "none";
  appPage.style.display = "block";
  hardWordsPage.style.display = "none";
  statsPage.style.display = "none";
  showWord(currentIndex);
}

function showMainPage() {
  showAppPage();
}

function renderHardWordsList() {
  hardWords = loadHardWords();
  hardWordsList.innerHTML = "";
  if (hardWords.length === 0) {
    hardWordsList.innerHTML = '<p class="empty-hint">🎉 太棒了！生词本里还没有单词</p>';
    return;
  }
  for (var i = 0; i < hardWords.length; i++) {
    var word = hardWords[i];
    var itemDiv = document.createElement("div");
    itemDiv.className = "hard-word-item";
    itemDiv.innerHTML =
      '<div>' +
        '<p class="hw-english">' + word.english + '</p>' +
        '<p class="hw-chinese">' + word.chinese + '</p>' +
      '</div>' +
      '<button class="hw-remove" data-index="' + i + '" title="从生词本移除">✕</button>';
    hardWordsList.appendChild(itemDiv);
  }
  var removeButtons = document.querySelectorAll(".hw-remove");
  for (var j = 0; j < removeButtons.length; j++) {
    removeButtons[j].addEventListener("click", function() {
      var indexToRemove = parseInt(this.getAttribute("data-index"));
      hardWords.splice(indexToRemove, 1);
      saveHardWords(hardWords);
      renderHardWordsList();
    });
  }
}

hardWordsBtn.addEventListener("click", showHardWordsPage);
backBtn.addEventListener("click", showMainPage);

if (homeBackBtn) {
  homeBackBtn.addEventListener("click", function() {
    if (homePage && appPage) {
      homePage.style.display = "block";
      appPage.style.display = "none";
    }
  });
}

// ========== 学习记录与统计功能 ==========

function recordStudy() {
  var today = getTodayString();
  var studyLog = loadStudyLog();
  
  if (studyLog[today]) {
    studyLog[today] = studyLog[today] + 1;
  } else {
    studyLog[today] = 1;
  }
  
  saveStudyLog(studyLog);
  
  todayLearned = studyLog[today];
  updateProgressBar();
  
  if (todayLearned === dailyGoal) {
    setTimeout(function() {
      alert("🎉 恭喜！你已完成今日目标 " + dailyGoal + " 个单词！");
    }, 300);
  }
}

function getTodayString() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  
  return year + "-" + month + "-" + day;
}

function updateProgressBar() {
  var progressDiv = document.getElementById("goalProgress");
  var progressFill = document.getElementById("progressFill");
  var goalText = document.getElementById("goalText");
  
  if (dailyGoal > 0) {
    progressDiv.style.display = "block";
    goalText.textContent = todayLearned + "/" + dailyGoal;
    
    var percent = (todayLearned / dailyGoal) * 100;
    if (percent > 100) {
      percent = 100;
    }
    progressFill.style.width = percent + "%";
    
    if (todayLearned >= dailyGoal) {
      progressFill.style.background = "linear-gradient(90deg, #f6ad55, #ed8936)";
      goalText.textContent = "🔥 " + todayLearned + "/" + dailyGoal + " 已完成！";
    }
  }
}

function saveStudyLog(log) {
  saveData("flashcard-studyLog", log);
}

function loadStudyLog() {
  return loadData("flashcard-studyLog", {});
}

// ========== 统计页面功能 ==========
var statsBtn = document.getElementById("statsBtn");
var statsPage = document.getElementById("statsPage");
var backBtn2 = document.getElementById("backBtn2");

function showStatsPage() {
  homePage.style.display = "none";
  appPage.style.display = "none";
  hardWordsPage.style.display = "none";
  statsPage.style.display = "block";
  renderStats();
}

function showMainPageFromStats() {
  showAppPage();
}

function renderStats() {
  document.getElementById("goalInput").value = dailyGoal;
  
  var studyLog = loadStudyLog();
  var today = getTodayString();
  
  var daysCount = 0;
  var totalWords = 0;
  for (var date in studyLog) {
    if (studyLog.hasOwnProperty(date)) {
      daysCount = daysCount + 1;
      totalWords = totalWords + studyLog[date];
    }
  }
  
  var todayCount = studyLog[today] || 0;
  
  document.getElementById("statDays").textContent = daysCount;
  document.getElementById("statTotal").textContent = totalWords;
  document.getElementById("statToday").textContent = todayCount;
  
  renderCalendar(studyLog);
}

function renderCalendar(studyLog) {
  var calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = "";
  
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();
  
  var monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  
  var monthTitle = document.createElement("p");
  monthTitle.className = "calendar-month";
  monthTitle.textContent = currentYear + "年 " + monthNames[currentMonth];
  calendarDiv.appendChild(monthTitle);
  
  var grid = document.createElement("div");
  grid.className = "calendar-grid";
  
  var dayLabels = ["日", "一", "二", "三", "四", "五", "六"];
  for (var d = 0; d < 7; d++) {
    var label = document.createElement("div");
    label.className = "calendar-day-label";
    label.textContent = dayLabels[d];
    grid.appendChild(label);
  }
  
  var firstDay = new Date(currentYear, currentMonth, 1).getDay();
  var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (var i = 0; i < firstDay; i++) {
    var emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    grid.appendChild(emptyDay);
  }
  
  for (var day = 1; day <= daysInMonth; day++) {
    var dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.textContent = day;
    
    var monthStr = (currentMonth + 1);
    if (monthStr < 10) {
      monthStr = "0" + monthStr;
    }
    var dayStr = day;
    if (dayStr < 10) {
      dayStr = "0" + dayStr;
    }
    var dateStr = currentYear + "-" + monthStr + "-" + dayStr;
    
    if (studyLog[dateStr]) {
      dayDiv.classList.add("learned");
    }
    
    var todayDate = new Date();
    if (day === todayDate.getDate() && currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear()) {
      dayDiv.style.border = "2px solid #667eea";
    }
    
    grid.appendChild(dayDiv);
  }
  
  calendarDiv.appendChild(grid);
}

statsBtn.addEventListener("click", showStatsPage);
backBtn2.addEventListener("click", showMainPageFromStats);

// ========== 每日目标设置功能 ==========
var goalSaveBtn = document.getElementById("goalSaveBtn");
var goalInput = document.getElementById("goalInput");

goalSaveBtn.addEventListener("click", function() {
  var newGoal = parseInt(goalInput.value);
  
  if (isNaN(newGoal) || newGoal < 5) {
    alert("目标最少为5个单词哦");
    goalInput.value = dailyGoal;
    return;
  }
  
  if (newGoal > 100) {
    alert("目标最多为100个单词");
    goalInput.value = dailyGoal;
    return;
  }
  
  dailyGoal = newGoal;
  saveData("flashcard-dailyGoal", dailyGoal);
  
  var studyLog = loadStudyLog();
  var today = getTodayString();
  todayLearned = studyLog[today] || 0;
  updateProgressBar();
  
  alert("✅ 每日目标已设为 " + dailyGoal + " 个单词！");
});

// ========== 词库切换功能 ==========
var btnCET4 = document.getElementById("btnCET4");
var btnCET6 = document.getElementById("btnCET6");

function switchBank(bankName) {
  currentBank = bankName;
  
  if (bankName === "cet4") {
    wordList = cet4Words;
    btnCET4.classList.add("active");
    btnCET6.classList.remove("active");
  } else if (bankName === "cet6") {
    wordList = cet6Words;
    btnCET6.classList.add("active");
    btnCET4.classList.remove("active");
  }
  
  // 重新加载该词库的状态
  wordStatus = loadWordStatus();
  hardWords = loadHardWords();
  currentIndex = loadCurrentIndex();
  
  showWord(currentIndex);
  totalNumElement.textContent = wordList.length;
}

btnCET4.addEventListener("click", function() {
  if (currentBank !== "cet4") {
    switchBank("cet4");
  }
});

btnCET6.addEventListener("click", function() {
  如果 (currentBank !== "cet6") {
    切换银行("cet6");
  }
});

如果 (startBtn) {
  startBtn.addEventListener("click", function() {
    if (homePage && appPage) {
      homePage.style.display = "none";
      appPage.style.display = "block";
    }
  });
}

如果 (comingSoonBtn) {
  comingSoonBtn.addEventListener("click", function(event) {
    事件.preventDefault();
  });
}

// ========== 页面加载 ==========
currentIndex = loadCurrentIndex();
显示单词(当前索引);
totalNumElement.文本内容 = wordList.长度;
控制台.日志("当前生词本：", hardWords);

// 初始化每日目标
dailyGoal = loadData("flashcard-dailyGoal", 10);
todayLearned = loadStudyLog()[getTodayString()] || 0;
updateProgressBar();
// ========== 夜间模式功能 ==========
var darkModeBtn = document.getElementById("darkModeBtn");

// 页面加载时，检查之前是否开启了夜间模式
var darkMode = loadData("flashcard-darkMode", false);
if (darkMode) {
  document.body.classList.add("dark-mode");
  darkModeBtn.textContent = "☀️";
}

darkModeBtn.addEventListener("click", function() {
  // 切换夜间模式
  如果 (document.body.classList.包含("dark-mode")) {
    // 关闭夜间模式
    文档.body.classList.移除("dark-mode");
    darkModeBtn.textContent = "🌙";
    saveData("flashcard-darkMode", false);
  } 否则 {
    // 开启夜间模式
    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️";
    saveData("flashcard-darkMode", true);
  }
});
// ========== 随机模式功能 ==========
var randomToggle = document.getElementById("randomToggle");

randomToggle.addEventListener("change", function() {
  randomMode = randomToggle.checked;
  // 保存随机模式状态
  saveData("flashcard-randomMode", randomMode);
});

// 页面加载时，恢复随机模式状态
randomMode = loadData("flashcard-randomMode", false);
randomToggle.checked = randomMode;
