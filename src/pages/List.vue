<template>
  <div class="q-pa-md">
    <q-table
      :title="`${listData.name} - ${listData.year}`"
      :columns="columns"
      :rows="bookData"
      :pagination="{
        rowsPerPage: 20,
        sortBy: 'title',
      }"
    >
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
              color="primary"
              @click="openEditBookModal(props.row.id)"
              >Edit</q-btn
            >
          </q-td>
          <q-td key="delete">
            <q-btn
              size="sm"
              color="negative"
              @click="openDeleteBookModal(props.row.id)"
            >
              <q-icon name="delete" />
            </q-btn>
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
          <!-- <q-input label="Search for a Book" hint="Harry Potter" v-model="bookSearch" /> -->
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
  <q-dialog v-model="deleteAlert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Are you sure?</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Do you really want to delete this book?
      </q-card-section>

      <q-card-section>
        <p>{{ bookToDelete.title }}</p>
        <p>Pages: {{ bookToDelete.pages }}</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="red" @click="deleteBook">Delete</q-btn>
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";
import useMain from "../pinia/main";
import { useAuthState } from "@vueauth/core";

const isSmall = computed(() => $q.screen.xs);
const columns = [
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
    align: "left",
    label: "Author",
    field: (row) => row.author,
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: (row) => row.status,
    sortable: true,
    align: "left",
  },
  {
    name: "pages",
    label: "Pages",
    field: (row) => row.pages,
    sortable: true,
    align: "left",
  },
  { name: "edit", label: "", field: "" },
  { name: "delete", label: "", field: "" },
];
const { user } = useAuthState();
const deleteAlert = ref(false);
const listData = ref({});
const selectedList = ref(null);
const selectedStatus = ref(null);
const books = ref([]);
const loading = ref(true);
const route = useRoute();
const router = useRouter();
const store = useMain();
const bookToEdit = ref(null);
const bookToDelete = ref(null);
const editDialogRef = ref(null);
const tagColors = {
  1: "white",
  2: "amber-3",
  3: "green-3",
  4: "red-3",
};
const showEditBookDialog = ref(false);
const bookData = computed(() => {
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
});

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
function openDeleteBookModal(book_id) {
  deleteAlert.value = true;
  const book = books.value.find((book) => book.id === book_id);
  bookToDelete.value = book;
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
  console.log("Book to edit", bookToEdit.value);
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

async function deleteBook() {
  await supabase.from("books").delete().eq("id", bookToDelete.value.id);
  deleteAlert.value = false;
  getListBooks();
  bookToDelete.value = null;
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
.q-form.editForm {
  min-width: 370px;
}
</style>
