const [readPlatformGrades, pasteGrades, clearGrades, selectPasteFromCourse, selectGradeSystem, divPasteFromCourse] = document.querySelectorAll("#readPlatformGrades, #pasteGrades, #clearGrades, #selectPasteFromCourse, #selectGradeSystem, #pasteFromCourse");

const fullName = studentRow.querySelector("a.username").textContent;

const students = [...table.querySelectorAll("tr[data-uid]")].map(studentRow => {
  const fullName = studentRow.querySelector("a.username").textContent;

  const grades = [...studentRow.querySelectorAll("td span.gradevalue")].map(gradeCell => {
    const grade = parseFloat(gradeCell.textContent);

    return grade ? grade : 1;
  });

  return { fullName, grades };
});

document.addEventListener('DOMContentLoaded', function () {
  loadDataFromStorage();
});

const loadDataFromStorage = () => {
  try {
    getFromStorage(["students", "coursesNames"], ({ students, coursesNames }) => {
      if (!(students && coursesNames)) {
        divPasteFromCourse.style.display = "none";
        return;
      }

      let studentsParsed;
      let coursesNamesParsed;
      try {
        studentsParsed = parseJSON(students);
        coursesNamesParsed = parseJSON(coursesNames);
      } catch (error) {
        // handle the error, e.g. display an error message or fallback to default values
        studentsParsed = [];
        coursesNamesParsed = [];
      }

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

      studentsParagraph.textContent = content;
    });
  } catch (error) {
    // handle the error, e.g. display an error message to the user or log the error
  }
};

const getFromStorage = (keys, callback) => {
  chrome.storage.sync.get(keys, (result) => {
    if (chrome.runtime.lastError) {
      // handle the error, e.g. display an error message or log the error
      return;
    }
    callback(result);
  });
};

const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    // handle the error, e.g. display an error message or fallback to default values
    return [];
  }
};

const setToStorage = (data, callback) => {
  const serializedData = JSON.stringify(data);
  chrome.storage.sync.set(serializedData, () => {
    if (chrome.runtime.lastError) {
      // handle the error, e.g. display an error message or log the error
      return;
    }
    callback();
  });
};
