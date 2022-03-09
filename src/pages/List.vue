<template>
  <div class="q-pa-md">
    <q-table
      :title="`${listData.name} - ${listData.year}`"
      :columns="['Title']"
      :rows="bookData"
      :pagination="{
        rowsPerPage: 20,
        sortBy: 'title',
      }"
    >
      <template v-slot:top-right>
        <q-btn
          @click="showAddBookDialog = true"
          label="Add Book"
          icon="add"
          color="primary"
          aria-label="Add new book"
          class="q-mt-md"
        ></q-btn>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="text-left flex items-center">
            <q-img
              style="width: 50px"
              :ratio="1"
              class="rounded-borders"
              :src="props.row.image"
            />
          </q-td>
          <q-td key="title"> {{ props.row.title }} </q-td>
          <q-td key="author">
            {{ props.row.author }}
          </q-td>
          <q-td key="status">
            <q-badge class="text-black" :color="props.row.statusColor">
              {{ props.row.status }}
            </q-badge>
          </q-td>
          <q-td key="pages">
            {{ props.row.pages }}
          </q-td>
          <q-td key="edit">
            <q-btn
              size="sm"
              color="secondary"
              @click="openEditBookModal(props.row.id)"
              >Edit</q-btn
            >
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <q-dialog ref="editDialogRef" v-model="showEditBookDialog">
    <q-card>
      <q-card-section>
        <q-form class="editForm">
          <h5>Edit Book</h5>
          <q-input label="Title" v-model="bookToEdit.title" />
          <q-input label="Author" v-model="bookToEdit.author" />
          <q-select
            label="List"
            v-model="selectedList"
            :options="store.userBookLists"
            :option-label="(item) => (item === null ? 'Null value' : item.name)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.year }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            label="Status"
            v-model="selectedStatus"
            :options="store.statuses"
            :option-label="(item) => (item === null ? 'Null value' : item.name)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input label="Pages" v-model="bookToEdit.pages" />
          <q-btn class="q-mt-md" color="cyan" @click="updateBook">Update</q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog ref="addDialogRef" v-model="showAddBookDialog">
    <q-card>
      <q-card-section>
        <q-form class="addForm">
          <h5>Add Book</h5>
          <q-input label="Search for a Book" v-model="bookSearch" />
          <q-list bordered separator>
            <q-item
              v-for="book in googlePredictions"
              :key="book.id"
              clickable
              @click="populateFields(book)"
              v-ripple
            >
              <q-item-section avatar>
                <q-avatar>
                  <img
                    v-if="
                      book.volumeInfo.imageLinks &&
                      book.volumeInfo.imageLinks.smallThumbnail
                    "
                    :src="book.volumeInfo.imageLinks.smallThumbnail"
                  />
                  <q-icon v-else name="menu_book" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <p class="text-weight-bold">{{ book.volumeInfo.title }}</p>
                <p>
                  {{
                    book.volumeInfo.authors ? book.volumeInfo.authors[0] : ""
                  }}
                </p>
              </q-item-section>
            </q-item>
          </q-list>
          <q-input label="Title" v-model="bookToAdd.title" />
          <q-input label="Author" v-model="bookToAdd.author" />
          <q-select
            label="List"
            v-model="selectedList"
            :options="store.userBookLists"
            :option-label="(item) => (item === null ? 'Null value' : item.name)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.year }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            label="Status"
            v-model="selectedStatus"
            :options="store.statuses"
            :option-label="(item) => (item === null ? 'Null value' : item.name)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input label="Pages" v-model="bookToAdd.pages" />
          <q-btn class="q-mt-md" color="cyan" @click="addBook">Add</q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";
import axios from "axios";
import useMain from "../pinia/main";
import { useAuthState } from "@vueauth/core";
import debounce from "lodash/debounce";

const isSmall = computed(() => $q.screen.xs);
const columns = [
  // {
  //   name: "id",
  //   required: false,
  //   label: "",
  //   align: "left",
  //   sortable: false,
  //   field: "id",
  // },
  {
    name: "image",
    required: false,
    label: "",
    align: "left",
    sortable: false,
    field: (row) => row.image_url,
  },
  {
    name: "title",
    required: false,
    label: "Title",
    align: "left",
    field: (row) => row.title,
    sortable: true,
  },
  {
    name: "author",
    align: "center",
    label: "Author",
    field: (row) => row.author,
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: (row) => row.status,
    sortable: true,
  },
  { name: "pages", label: "Pages", field: (row) => row.pages },
  { name: "edit", label: "", field: "" },
];
const { user } = useAuthState();
const alert = ref(false);
const listData = ref({});
const selectedList = ref(null);
const selectedStatus = ref({ id: 1, name: "To Read" });
const books = ref([]);
const loading = ref(true);
const route = useRoute();
const router = useRouter();
const store = useMain();
const bookToEdit = ref(null);
const bookToAdd = ref({
  imageUrl: null,
  title: null,
  author: null,
  status: { id: 1, name: "To Read" },
  pages: null,
});
const bookSearch = ref("");
const googlePredictions = ref([]);
const editDialogRef = ref(null);
const addDialogRef = ref(null);
const tagColors = {
  1: "white",
  2: "amber-3",
  3: "green-3",
  4: "red-3",
};
const showEditBookDialog = ref(false);
const showAddBookDialog = ref(false);
const bookData = computed(() => {
  if (store.statuses.length > 0) {
    return books.value.map((book) => {
      return {
        id: book.id,
        image: book.image_url,
        title: book.title,
        author: book.author,
        status: getReadingStatus(book.reading_status_id),
        pages: book.pages,
        statusColor: tagColors[book.reading_status_id],
      };
    });
  } else {
    return [];
  }
});

const getGoogleBookList = debounce(async function () {
  const predictions = await axios.get(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${bookSearch.value}&maxResults=5`
  );

  googlePredictions.value = predictions.data.items;
}, 500);

watch(bookSearch, (currentValue, oldValue) => {
  getGoogleBookList();
});

function populateFields(book) {
  bookToAdd.value.title = book.volumeInfo.title;
  bookToAdd.value.author = book.volumeInfo.authors[0];
  bookToAdd.value.pages = book.volumeInfo.pageCount;
  bookToAdd.value.imageUrl =
    book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail
      ? book.volumeInfo.imageLinks.smallThumbnail
      : "";
  selectedList.value = listData.value;
  selectedStatus.value = { id: 1, name: "To Read" };
  googlePredictions.value = [];
}

function openEditBookModal(book_id) {
  showEditBookDialog.value = true;
  const book = books.value.find((book) => book.id === book_id);
  bookToEdit.value = book;
  selectedList.value = store.userBookLists.find(
    (list) => list.id === book.list_id
  );
  selectedStatus.value = store.statuses.find(
    (status) => status.id === book.reading_status_id
  );
}

function getReadingStatus(id) {
  const status = store.statuses.find((status) => status.id === id);
  return status.name;
}

async function getListData() {
  try {
    loading.value = true;

    let { data: list, error } = await supabase
      .from("lists")
      .select()
      .eq("id", route.params.listId)
      .single();

    if (list) {
      listData.value = list;
    }
  } catch (err) {
    alert(err.message);
  }
}

async function getListBooks() {
  try {
    let { data } = await supabase
      .from("books")
      .select()
      .eq("list_id", route.params.listId);

    books.value = data;
  } catch (err) {
    alert(err.message);
  }
}

async function updateBook() {
  if (
    !bookToEdit.value.title ||
    !bookToEdit.value.author ||
    !bookToEdit.value.pages
  )
    return;
  const book = {
    title: bookToEdit.value.title,
    author: bookToEdit.value.author,
    pages: bookToEdit.value.pages,
    reading_status_id: selectedStatus.value.id,
    list_id: selectedList.value.id,
    image_url: bookToEdit.value.imageUrl,
    user_id: user.id,
  };
  console.log("bookToEdit", bookToEdit.value);
  await supabase.from("books").update(book).eq("id", bookToEdit.value.id);
  editDialogRef.value.hide();
  getListBooks();
}
async function addBook() {
  console.log("Book to add", bookToAdd.value);
  if (
    !bookToAdd.value.title ||
    !bookToAdd.value.author ||
    !bookToAdd.value.pages
  )
    return;
  const book = {
    title: bookToAdd.value.title,
    author: bookToAdd.value.author,
    pages: bookToAdd.value.pages,
    reading_status_id: selectedStatus.value.id,
    list_id: selectedList.value.id,
    image_url: bookToAdd.value.imageUrl,
    user_id: user.value.id,
  };
  console.log("user", user.value);
  console.log("bookToAdd", bookToAdd.value);
  await supabase.from("books").insert(book);
  addDialogRef.value.hide();
  bookToAdd.value = {
    imageUrl: null,
    title: null,
    author: null,
    status: { id: 1, name: "To Read" },
    pages: null,
  };
  bookSearch.value = "";
  getListBooks();
}

onMounted(() => {
  getListData();
  getListBooks();
});
</script>

<style lang="scss" scoped>
table tbody td {
  height: unset;
}
.q-dialog .q-form {
  min-width: 370px;
}
</style>
