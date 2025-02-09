export function filterDataGrid(searchItems, items) {
  let filterItems = items;

  searchItems.forEach((searchItem) => {
    const { filter, contains, searchText } = searchItem;

    const filtered = filterItems.filter((item) => {
      if (contains === 1) {
        return String(item.data[filter.toLowerCase()]) === searchText;
      }
      return String(item.data[filter.toLowerCase()]) !== searchText;
    });

    filterItems = filtered;
  });

  return filterItems;
}
