export function filterDataGrid(searchItems, items) {
  let filterItems = items;

  searchItems.forEach((searchItem) => {
    const { filter, contains, searchText } = searchItem;
    let filtered = [];
    if (filter.toLowerCase() === 'price') {
      filtered = filterItems.filter((item) => {
        return item.data.rates.find(rate => contains === 0
          ? rate.price.toString().includes(searchText)
          : !rate.price.toString().includes(searchText));
      });
    } else {
      filtered = filterItems.filter((item) => {
        if (contains === 0) {
          return String(item.data[filter.toLowerCase()]).toLowerCase().includes(searchText.toLowerCase());
        }
        return !String(item.data[filter.toLowerCase()]).toLowerCase().includes(searchText.toLowerCase());
      });
    }

    filterItems = filtered;
  });

  return filterItems;
}
