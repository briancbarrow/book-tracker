import { defineStore } from "pinia";
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
const useMain = defineStore("main", {
  state: () => {
    return {
      userBookLists: [],
      statuses: [],
    };
  },
  // getters: {
  //   fullName: (state) => `${state.firstName} ${state.lastName}`,
  // },
  actions: {
    updateBookLists(data) {
      this.userBookLists = data;
    },
    addBookToListToBookLists(book) {
      this.userBookLists.push(book);
    },
    updateStatuses(data) {
      this.statuses = data;
    },
  },
});

export default useMain;
