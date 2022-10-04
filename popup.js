let readPlatformGrades = document.getElementById("readPlatformGrades");
let pasteGrades = document.getElementById("pasteGrades");
let clearGrades = document.getElementById("clearGrades");
let selectPasteFromCourse = document.getElementById("selectPasteFromCourse");
let selectGradeSystem = document.getElementById("selectGradeSystem");
let divPasteFromCourse = document.getElementById("pasteFromCourse");

const loadDataFromStorage = () => {
  chrome.storage.sync.get(["students", "coursesNames"], ({ students, coursesNames }) => {
    if (!(students && coursesNames)) {
      divPasteFromCourse.style.display = "none";

      return;
    }

    let studentsParsed = JSON.parse(students);
    let coursesNamesParsed = JSON.parse(coursesNames);
    let studentsParagraph = document.getElementById("studentsList");
    let content = '';

    divPasteFromCourse.style.display = "block";
    selectPasteFromCourse.options.length = 0;

    coursesNamesParsed.forEach(courseName => {
      selectPasteFromCourse.options[selectPasteFromCourse.options.length] = new Option(courseName, selectPasteFromCourse.options.length)
    });

    content += `${coursesNamesParsed.length} courses are currently loaded.`
    content += `<br><br>`;
    content += `Grades of ${studentsParsed.length} students are currently loaded.`;

    studentsParagraph.innerHTML = content;
  });
};

readPlatformGrades.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: function () {
      const table = document.getElementById("user-grades");

      if (table) {
        let students = Array.from(table.querySelectorAll("tr[data-uid]")).map(studentRow => {
          let fullName = studentRow.querySelector("a.username").innerText;

          let grades = Array.from(studentRow.querySelectorAll("td span.gradevalue")).map(gradeCell => {
            let grade = parseFloat(gradeCell.innerText);

            return grade ? grade : null;
          });

          return { fullName, grades };
        });

        let coursesNames = Array.from(table.querySelectorAll("tr.heading th[data-itemid] a.gradeitemheader")).map(courseCell => courseCell.innerText);

        chrome.storage.sync.set({ students: JSON.stringify(students), coursesNames: JSON.stringify(coursesNames) });
      }
    },
  });

  loadDataFromStorage();
});

pasteGrades.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let { students } = await chrome.storage.sync.get("students");

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: function (students, courseIndex, gradeSystem) {

      const studentsList = document.body.querySelectorAll(".studentListElement");
      const studentsRows = document.body.querySelectorAll("tr.student_row");
      const studentsParsed = JSON.parse(students);

      const sameNames = function (name1, name2) {
        let splitName1 = name1.trim().replace(/\s/, " ").replace('&nbsp;', " ").replace(",", "").replace("-", " ").split(" ");
        let splitName2 = name2.trim().replace(/\s/, " ").replace('&nbsp;', " ").replace(",", "").replace("-", " ").split(" ");

        return splitName1.length === splitName2.length && splitName1.every((n) => splitName2.includes(n));
      };

      const convertGrade = function (studentGrade, system) {
        if (!studentGrade) return "";

        const letters = ["F", "E", "D", "C", "B", "A"];
        const convertedGrade = Math.round(studentGrade / 20.0);

        if (system === "letters") {
          return letters[convertedGrade];
        } else {
          return convertedGrade;
        }
      }

      Array.from(studentsList).forEach(studentLine => {
        let studentFullName = studentLine.querySelector(".studentName").innerText;

        studentsParsed.forEach(student => {
          let studentGrade = student.grades[courseIndex];

          if (sameNames(student.fullName, studentFullName)) {
            let gradeInput = studentLine.querySelector(".gradeinput");

            gradeInput.value = convertGrade(studentGrade, gradeSystem);
          }
        });
      });

      Array.from(studentsRows).forEach(studentLine => {
        let studentFullName = studentLine.querySelector("th a").innerText;


        studentsParsed.forEach(student => {
          let studentGrade = student.grades[courseIndex];

          if (sameNames(student.fullName, studentFullName)) {
            let gradeInput = studentLine.querySelector("div.grade_entry input[type='text']");

            gradeInput.value = convertGrade(studentGrade, gradeSystem);
          }
        });
      });
    },
    args: [students, parseInt(selectPasteFromCourse.value, 10), selectGradeSystem.value]
  });

  window.close();
});

clearGrades.addEventListener("click", async () => {
  await chrome.storage.sync.set({ students: null, coursesNames: null });

  loadDataFromStorage();
});

window.onload = function () {
  loadDataFromStorage();
}
