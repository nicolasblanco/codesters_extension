

describe('loadDataFromStorage', () => {

    // Verify that the function displays the correct number of courses and students when both 'students' and 'coursesNames' are present in storage.
    it('should display the correct number of courses and students when both "students" and "coursesNames" are present in storage', () => {
      // Mock the chrome.storage.sync.get method to return the expected values
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ students: JSON.stringify([{ fullName: "John Doe", grades: [90, 85, 95] }]), coursesNames: JSON.stringify(["Math", "Science", "English"]) });
      });

      // Call the function
      loadDataFromStorage();

      // Verify that the divPasteFromCourse style display is set to "block"
      expect(divPasteFromCourse.style.display).toBe("block");

      // Verify that the selectPasteFromCourse options length is set to the correct value
      expect(selectPasteFromCourse.options.length).toBe(3);

      // Verify that the studentsParagraph content is set to the correct value
      expect(studentsParagraph.textContent).toContain("3 courses are currently loaded.");
      expect(studentsParagraph.textContent).toContain("Grades of 1 students are currently loaded.");
    });
});


