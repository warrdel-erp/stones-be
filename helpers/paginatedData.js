export const PaginatedData = (result, limit, page) => {
    return {
        totalRecords: result.count, // Total number of records
        totalPages: Math.ceil(result.count / limit), // Total number of pages
        currentPage: page, // Current page
        limit, // Records per page
        data: result.rows, // Paginated records
    };
}