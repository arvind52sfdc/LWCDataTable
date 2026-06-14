# Advanced Flow Data Table (myFlowDataTable)

A high-performance, configurable data table Lightning Web Component (LWC) designed for Salesforce Screen Flows.

## Overview

This component provides a feature-rich data table that can be easily integrated into Salesforce Flow screens. It supports search, pagination, row selection, and customizable column display.

## Features

- **Search Functionality**: Search across all columns in the table
- **Pagination**: Navigate through large datasets with configurable page sizes (5, 10, 25, 50, 100)
- **Row Selection**: Support for single or multiple row selection
- **Customizable Columns**: Display only the fields you need by specifying API names
- **Responsive Design**: Built with SLDS (Salesforce Lightning Design System)
- **Loading State**: Visual feedback during data loading
- **Empty State**: User-friendly message when no records are found

## Installation

1. Clone this repository to your local machine
2. Deploy the `myFlowDataTable` folder to your Salesforce org using your preferred method:
   - Salesforce CLI
   - Change Sets
   - Metadata API
   - VS Code with Salesforce Extensions

### Using Salesforce CLI

```bash
sfdx force:source:deploy -p myFlowDataTable
```

## Usage in Flow

### Prerequisites

- Salesforce org with Lightning Web Components enabled
- API Version 60.0 or later

### Adding to a Flow

1. Open Flow Builder
2. Drag a **Screen** element onto the canvas
3. In the screen designer, find **Advanced Flow Data Table** in the components palette
4. Drag the component onto the screen

### Configuration Properties

#### Input Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| Table Title | String | The title displayed on the table card | No |
| Object Name | SObject | The SObject type for the records | Yes |
| Records to Display | Collection | The collection of records to display in the table | Yes |
| Columns (Field API Names) | String | Comma-separated list of field API names to display | Yes |
| Show Search Bar | Boolean | Enable/disable the search functionality | No (default: false) |
| Enable Pagination | Boolean | Enable/disable pagination | No (default: false) |
| Page Size | String | Number of records per page (5, 10, 25, 50, 100) | No (default: 10) |
| Enable Row Selection | Boolean | Enable/disable row selection | No (default: false) |
| Selection Mode | String | Allow single or multiple row selection | No (default: multiple) |

#### Output Properties

| Property | Type | Description |
|----------|------|-------------|
| Selected Records | Collection | The collection of records selected by the user |

## Example Configuration

### Displaying Account Records

1. **Get Records Element**: Fetch Account records
2. **Screen Element**: Add Advanced Flow Data Table
   - **Table Title**: "Account List"
   - **Records to Display**: `{!Get_Accounts}`
   - **Columns**: `Name, Industry, Phone, BillingCity`
   - **Show Search Bar**: `true`
   - **Enable Pagination**: `true`
   - **Page Size**: `10`
   - **Enable Row Selection**: `true`
   - **Selection Mode**: `multiple`
3. **Use Selected Records**: Connect the `Selected Records` output to downstream flow elements

### Example Fields Configuration

For standard objects:
```
Name, Industry, Phone, BillingCity, AnnualRevenue
```

For custom objects:
```
Name, Custom_Field__c, Another_Field__c, OwnerId
```

## Component Files

```
myFlowDataTable/
├── myFlowDataTable.html          # Component template
├── myFlowDataTable.js            # Component logic
└── myFlowDataTable.js-meta.xml   # Component metadata
```

## Technical Details

### API Version
- Requires API Version 60.0 or later

### Supported Targets
- `lightning__FlowScreen`

### Events
- `FlowAttributeChangeEvent`: Dispatched when selected records change

### Methods

| Method | Description |
|--------|-------------|
| `connectedCallback()` | Initializes columns and applies filters |
| `initializeColumns()` | Parses fieldsToDisplay and creates column definitions |
| `applyFiltersAndPagination()` | Applies search filters and pagination |
| `handleSearchChange()` | Handles search input changes |
| `handleRowSelection()` | Handles row selection events |
| `handleNext()` / `handlePrevious()` | Handles pagination navigation |
| `handlePageSizeChange()` | Handles page size dropdown changes |

## Best Practices

1. **Field Selection**: Only include necessary fields in `fieldsToDisplay` to improve performance
2. **Pagination**: Enable pagination for large datasets (>50 records)
3. **Search**: Enable search when users need to find specific records quickly
4. **Selection**: Use single selection mode when only one record should be chosen

## Troubleshooting

### No Records Displayed
- Verify the `allRecords` input contains data
- Check that `fieldsToDisplay` includes valid field API names
- Ensure field names are comma-separated without extra spaces

### Columns Not Showing Correctly
- Verify field API names are correct (including `__c` for custom fields)
- Check that the fields exist on the specified SObject

### Selection Not Working
- Ensure `selectionEnabled` is set to `true`
- Verify records have valid `Id` fields

## License

This project is provided as-is for use in Salesforce environments.

## Contributing

Feel free to submit issues and enhancement requests!