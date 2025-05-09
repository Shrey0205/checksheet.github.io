document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const filterOptions = document.querySelectorAll('.filter-option');
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');
    const tasksTable = document.getElementById('tasks-table');
    const exportBtn = document.getElementById('export-btn');
    const addProblemBtn = document.getElementById('add-problem-btn');
    const abnormalityBody = document.getElementById('abnormality-body');
    const checksheetForm = document.getElementById('checksheet-form');
    let abnormalityCounter = 1;
    
    // Initialize current date for due dates
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const dueDateInputs = document.querySelectorAll('input[name^="due_date_"]');
    dueDateInputs.forEach(input => {
        input.value = formattedDate;
    });
    
    // Filter functionality
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Update active state
            filterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const rows = tasksTable.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else {
                    const rowFrequency = row.getAttribute('data-frequency');
                    row.style.display = (rowFrequency === filter) ? '' : 'none';
                }
            });
            
            // Update calendar view if active
            if (calendarView.style.display === 'flex') {
                generateCalendarView(filter);
            }
        });
    });
    
    // View toggle functionality
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            if (view === 'list') {
                listView.style.display = 'block';
                calendarView.style.display = 'none';
            } else {
                listView.style.display = 'none';
                calendarView.style.display = 'flex';
                
                // Generate calendar view based on current filter
                const activeFilter = document.querySelector('.filter-option.active').getAttribute('data-filter');
                generateCalendarView(activeFilter);
            }
        });
    });
    
    // Function to generate calendar view
    function generateCalendarView(filter) {
        calendarView.innerHTML = '';
        const rows = tasksTable.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            const rowFrequency = row.getAttribute('data-frequency');
            if (filter === 'all' || rowFrequency === filter) {
                const activity = row.cells[0].textContent;
                const frequency = row.cells[2].textContent;
                const dueDate = row.querySelector('input[name^="due_date_"]').value;
                const status = row.querySelector('select').value || 'Not Started';
                
                const card = document.createElement('div');
                card.className = 'task-card status-' + status.toLowerCase().replace(' ', '-');
                card.setAttribute('data-row-index', index + 1);
                
                card.innerHTML = `
                    <div class="task-card-header">${activity}</div>
                    <div class="task-card-body">
                        <div class="task-meta">
                            <span>Due: ${formatDate(dueDate)}</span>
                            <span class="task-badge">${frequency}</span>
                        </div>
                        <div class="task-status">Status: ${status}</div>
                    </div>
                `;
                
                // Allow clicking on card to edit in list view
                card.addEventListener('click', function() {
                    // Switch to list view
                    viewToggleBtns[0].click();
                    
                    // Highlight the corresponding row
                    const rowIndex = this.getAttribute('data-row-index');
                    const targetRow = tasksTable.querySelector(`tbody tr:nth-child(${rowIndex})`);
                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetRow.style.backgroundColor = '#e8f0fe';
                    setTimeout(() => {
                        targetRow.style.backgroundColor = '';
                    }, 2000);
                });
                
                calendarView.appendChild(card);
            }
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Add new problem row
    addProblemBtn.addEventListener('click', function() {
        abnormalityCounter++;
        const newRow = document.createElement('tr');
        newRow.id = `abnormality-row-${abnormalityCounter}`;
        
        newRow.innerHTML = `
            <td>${abnormalityCounter}</td>
            <td><input type="text" name="problem_${abnormalityCounter}"></td>
            <td><input type="date" name="problem_date_${abnormalityCounter}"></td>
            <td><input type="text" name="technician_${abnormalityCounter}"></td>
            <td><input type="text" name="report_no_${abnormalityCounter}"></td>
            <td><input type="text" name="problem_action_${abnormalityCounter}"></td>
            <td><input type="text" name="result_${abnormalityCounter}"></td>
        `;
        
        abnormalityBody.appendChild(newRow);
    });
    
    // Export to Excel functionality (client-side)
    exportBtn.addEventListener('click', function() {
        exportToExcel();
    });
    
    // Function to export form data to Excel (client-side)
    function exportToExcel() {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add header row
        csvContent += "Activity,Tool/Method,Frequency,Due Date,Done Date,Responsible,Status,Observation,Action Taken\n";
        
        // Get all rows and add to CSV
        const rows = tasksTable.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const rowNum = index + 1;
            const activity = row.cells[0].textContent;
            const tool = row.cells[1].textContent;
            const frequency = row.cells[2].textContent;
            const dueDate = document.querySelector(`input[name="due_date_${rowNum}"]`).value;
            const doneDate = document.querySelector(`input[name="done_date_${rowNum}"]`).value || "";
            const resp = document.querySelector(`input[name="resp_${rowNum}"]`).value || "";
            const status = document.querySelector(`select[name="status_${rowNum}"]`).value || "";
            const observation = document.querySelector(`input[name="observation_${rowNum}"]`).value || "";
            const action = document.querySelector(`input[name="action_taken_${rowNum}"]`).value || "";
            
            csvContent += `"${activity}","${tool}","${frequency}","${dueDate}","${doneDate}","${resp}","${status}","${observation}","${action}"\n`;
        });
        
        // Add blank row between sections
        csvContent += "\n";
        
        // Add abnormality report section
        csvContent += "EQUIPMENT ABNORMALITY SUMMARY REPORT\n";
        csvContent += "Sr. No.,Major Problem Reported,Date,Technician,A3 Report No.,Action Taken,Result After Repairing\n";
        
        // Get all abnormality rows
        for (let i = 1; i <= abnormalityCounter; i++) {
            const problem = document.querySelector(`input[name="problem_${i}"]`).value || "";
            const problemDate = document.querySelector(`input[name="problem_date_${i}"]`).value || "";
            const technician = document.querySelector(`input[name="technician_${i}"]`).value || "";
            const reportNo = document.querySelector(`input[name="report_no_${i}"]`).value || "";
            const problemAction = document.querySelector(`input[name="problem_action_${i}"]`).value || "";
            const result = document.querySelector(`input[name="result_${i}"]`).value || "";
            
            csvContent += `${i},"${problem}","${problemDate}","${technician}","${reportNo}","${problemAction}","${result}"\n`;
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `RO_Plant_Checksheet_${formatDateForFilename(new Date())}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Format date for filename
    function formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Form submission
    checksheetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if all required fields are filled
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let allFieldsFilled = true;
        
        requiredFields.forEach(field => {
            if (!field.value) {
                allFieldsFilled = false;
                field.style.borderColor = '#ea4335';
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (!allFieldsFilled) {
            alert('Please fill all required fields.');
            return;
        }
        
        // If using client-side only approach, just export to Excel
        exportToExcel();
        alert('Checksheet submitted successfully! Data has been exported to Excel.');
        
        // Reset form if needed
        // checksheetForm.reset();
    });
});