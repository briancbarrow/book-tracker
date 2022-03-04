import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
const useUser = defineStore("user", {
  state: () => {
    return {
      user: {},
    };
  },
  // getters: {
  //   fullName: (state) => `${state.firstName} ${state.lastName}`,
  // },
  // actions: {
  //   increment() {
  //     this.counter++;
  //   },
  // },
});

export default useUser;
