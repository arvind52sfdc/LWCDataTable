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

    // Use String internally to match combobox options and metadata type
    _pageSize = '10';
    @api
    get pageSize() { return this._pageSize; }
    set pageSize(value) {
        this._pageSize = value ? String(value) : '10';
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
        const numericPageSize = Number(this._pageSize) || 10;
        if (this.paginationEnabled) {
            const start = (this.currentPage - 1) * numericPageSize;
            const end = start + numericPageSize;
            this.displayedRecords = this.filteredRecords.slice(start, end);
        } else {
            this.displayedRecords = [...this.filteredRecords];
        }

        // 3. Force selection refresh for the UI
        this.selectedRowIds = [...this.selectedRowIds];
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

    handlePageSizeChange(event) {
        this.pageSize = event.detail.value;
    }

    get pageSizeOptions() {
        return [
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '25', value: '25' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
    }

    get totalRecordsCount() {
        return this.filteredRecords.length;
    }

    get recordRangeStart() {
        if (this.totalRecordsCount === 0) return 0;
        const numericPageSize = Number(this._pageSize) || 10;
        return (this.currentPage - 1) * numericPageSize + 1;
    }

    get recordRangeEnd() {
        const numericPageSize = Number(this._pageSize) || 10;
        const end = this.currentPage * numericPageSize;
        return end > this.totalRecordsCount ? this.totalRecordsCount : end;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        const numericPageSize = Number(this._pageSize) || 10;
        return this.currentPage >= Math.ceil(this.totalRecordsCount / numericPageSize) || this.totalRecordsCount === 0;
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
