import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class MyFlowDataTable extends LightningElement {
    // Flow Inputs
    @api tableLabel = '';
    _allRecords = [];
    @api
    get allRecords() {
        return this._allRecords;
    }
    set allRecords(value) {
        this._allRecords = value || [];
        this.currentPage = 1;
        this.applyFiltersAndPagination();
    }

    @api fieldsToDisplay = '';
    @api searchEnabled = false;
    @api selectionEnabled = false;
    @api paginationEnabled = false;

    _pageSize = 50;
    @api
    get pageSize() { return this._pageSize; }
    set pageSize(value) {
        this._pageSize = value ? Number(value) : 50;
        this.applyFiltersAndPagination();
    }

    @api selectionMode = 'multiple';

    // Flow Outputs
    @api selectedRecords = [];

    // Internal State
    @track columns = [];
    @track filteredRecords = [];
    @track displayedRecords = [];
    @track selectedRowIds = [];
    @track currentPage = 1;
    @track isLoading = false;
    @track searchTerm = '';

    connectedCallback() {
        this.isLoading = true;
        this.initializeColumns();
        this.applyFiltersAndPagination();
        this.isLoading = false;
    }

    initializeColumns() {
        if (!this.fieldsToDisplay) {
            this.columns = [];
            return;
        }

        const fieldNames = this.fieldsToDisplay.split(',').map(f => f.trim());
        this.columns = fieldNames.map(fieldName => {
            let label = fieldName.replaceAll('__c', '').replaceAll('_', ' ');
            label = label.charAt(0) ? label.charAt(0).toUpperCase() + label.slice(1) : fieldName;

            return {
                label: label,
                fieldName: fieldName,
                type: 'text',
                sortable: true
            };
        });
    }

    applyFiltersAndPagination() {
        // 1. Apply Search
        if (this.searchTerm && this.searchEnabled) {
            const lowerSearch = this.searchTerm.toLowerCase();
            this.filteredRecords = this.allRecords.filter(record => {
                return Object.values(record).some(val =>
                    val && String(val).toLowerCase().includes(lowerSearch)
                );
            });
        } else {
            this.filteredRecords = [...this.allRecords];
        }

        // 2. Apply Pagination
        if (this.paginationEnabled) {
            const start = (this.currentPage - 1) * this._pageSize;
            const end = start + Number(this._pageSize);
            this.displayedRecords = this.filteredRecords.slice(start, end);
        } else {
            this.displayedRecords = [...this.filteredRecords];
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1;
        this.applyFiltersAndPagination();
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.applyFiltersAndPagination();
        }
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.applyFiltersAndPagination();
        }
    }

    handleRowSelection(event) {
        if (!this.selectionEnabled) return;

        const selectedOnCurrentPage = event.detail.selectedRows;
        const selectedIdsOnCurrentPage = new Set(selectedOnCurrentPage.map(row => row.Id));
        const displayedIds = new Set(this.displayedRecords.map(row => row.Id));

        const currentSelectedSet = new Set(this.selectedRowIds);
        displayedIds.forEach(id => {
            if (!selectedIdsOnCurrentPage.has(id)) {
                currentSelectedSet.delete(id);
            }
        });

        selectedIdsOnCurrentPage.forEach(id => {
            currentSelectedSet.add(id);
        });

        this.selectedRowIds = Array.from(currentSelectedSet);
        this.selectedRecords = this.allRecords.filter(record =>
            currentSelectedSet.has(record.Id)
        );

        this.dispatchEvent(new FlowAttributeChangeEvent('selectedRecords', this.selectedRecords));
    }

    get totalRecordsCount() {
        return this.filteredRecords.length;
    }

    get recordRangeStart() {
        if (this.totalRecordsCount === 0) return 0;
        return (this.currentPage - 1) * this._pageSize + 1;
    }

    get recordRangeEnd() {
        const end = this.currentPage * this._pageSize;
        return end > this.totalRecordsCount ? this.totalRecordsCount : end;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= Math.ceil(this.totalRecordsCount / this._pageSize) || this.totalRecordsCount === 0;
    }

    get isNoData() {
        return this.filteredRecords.length === 0;
    }

    get isCheckboxHidden() {
        return !this.selectionEnabled;
    }

    get maxRowSelection() {
        if (!this.selectionEnabled) return 0;
        return this.selectionMode === 'single' ? 1 : 1000;
    }
}
