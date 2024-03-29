<template>
  <WatchlistComponent />

  <div class="main">
    <button class="position-absolute btn btn-success mb-2" data-bs-toggle="modal" data-bs-target="#modal_add_movie"
            :disabled="!store.logged_in"><b>{{ $t("movie.modal.title") }} +</b></button>
    <TableComponent
      :head="['' , $t('movie.title'), $t('movie.year'), $t('movie.genre'), $t('movie.director'), $t('movie.actors'), $t('movie.imdb_rate'), $t('movie.meta_score'), $t('movie.rotten_score'), $t('movie.language'), $t('movie.proposer'), $t('movie.proposed_on'), $t('movie.interested')]"
      id="table_movie" ref="filter" sortable :sort_default="[12, 'desc']" filterable :filter_default="[true, true, true, true, false, false, true, false, false, false, true, false, true]">
      <tr v-for="movie in movies" :key="movie.imdb_id" :id="movie.imdb_id">
        <td :title="movie.title">
          <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modal_big_picture"
                  @click="big_picture_imdb_id = movie.imdb_id;big_picture_title = movie.title">
            <img src="../assets/svg/info-circle-fill.svg" alt="big_picture">
          </button>
        </td>
        <td :title="movie.title"><div class="d-flex justify-content-center"><a :href="movie.link" target="_blank">{{ movie.title }}</a>&nbsp;<img class="d-inline" src="../assets/svg/box-arrow-up-right.svg" alt="external link icon"></div></td>
        <td :title="String(movie.year)">{{ movie.year }}</td>
        <td :title="movie.genre">{{ movie.genre }}</td>
        <td :title="movie.director">{{ movie.director }}</td>
        <td :title="movie.actors">{{ movie.actors }}</td>
        <td :title="movie.imdb_rate">{{ movie.imdb_rate }}</td>
        <td :title="movie.meta_score">{{ movie.meta_score }}</td>
        <td :title="movie.rotten_score">{{ movie.rotten_score }}</td>
        <td :title="movie.languages">{{ movie.languages }}</td>
        <td :title="movie.proposer">{{ movie.proposer }}</td>
        <td :title="movie.created_at.toString()">{{ (new Date(movie.created_at)).toLocaleDateString() }}</td>
        <td :title="String(movie.votes)" :id="'table_movie_votes_td_' + movie.imdb_id">
          <VoteComponent :imdb_id="movie.imdb_id" :votes="movie.votes" :delete_media="delete_media"
                         :proposed="movie.proposer_id === user_id" show_votes :on_vote="(new_votes: number) => movie.votes = new_votes" />
        </td>
      </tr>
    </TableComponent>
  </div>

  <ModalComponent id="modal_add_movie" :title="$t('movie.modal.title')" spawn_over_body>
    <FormVal action="api/movie/" method="post" :submit="search_media" id="form_post_movie" class="form">
      <div class="modal-body">
        <label class="form-label" for="modal_post_movie_enter_title"><b>{{ $t("movie.modal.form.enter_title") }}</b></label>
        <div class="input-group">
          <div class="input-group-text">
            <input class="form-check-input mt-0" type="radio" value="true" name="modal_post_movie_radio"
                   @click="movie_add_with_imdb_id = false" checked>
          </div>
          <input type="text" class="form-control" id="modal_post_movie_enter_title" :placeholder="$t('movie.modal.form.placeholder_title')" name="movie_title"
                 pattern="^.{3,100}$" :disabled="movie_add_with_imdb_id" required>
          <div class="valid-feedback">
            {{ $t("common.form.valid_feedback") }}
          </div>
          <div class="invalid-feedback">
            {{ $t("movie.modal.form.invalid_feedback.title") }}
          </div>
        </div>
        <MovieSearchComponent :movies="search_movies" @movie_select="movie_search_select" />

        <p class="mt-3">{{ $t("movie.modal.form.or") }}</p>
        <label class="form-label" for="modal_post_movie_enter_id"><b>{{ $t("movie.modal.form.enter_id") }}</b></label>
        <div class="input-group">
          <div class="input-group-text">
            <input class="form-check-input mt-0" type="radio" name="modal_post_movie_radio"
                   @click="movie_add_with_imdb_id = true">
          </div>
          <input type="text" class="form-control" id="modal_post_movie_enter_id" placeholder="tt1234567" name="imdb_id"
                 pattern="^tt[0-9]{1,12}$" :disabled="!movie_add_with_imdb_id" required>
          <div class="valid-feedback">
            {{ $t("common.form.valid_feedback") }}
          </div>
          <div class="invalid-feedback">
            {{ $t("movie.modal.form.invalid_feedback.id") }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t("common.modal.close") }}</button>
        <button v-if="movie_search_loading" class="btn btn-primary" type="button" disabled>
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span class="visually-hidden">{{ $t('common.loading') }}</span>
        </button>
        <button v-else-if="movie_add_with_imdb_id" type="submit" class="btn btn-primary">{{ $t("common.form.submit") }}</button>
        <button v-else type="submit" class="btn btn-primary">{{ $t("common.form.search") }}</button>
      </div>
    </FormVal>
  </ModalComponent>

  <ModalComponent id="modal_big_picture" class="modal-lg" :title="big_picture_title">
    <MovieBigPictureComponent :imdb_id="big_picture_imdb_id" />
  </ModalComponent>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { store } from "@/util/store";
import { call } from "@/util/api";
import WatchlistComponent from "@/components/WatchlistComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import FormComponent from "@/components/form/FormComponent.vue";
import TableComponent from "@/components/TableComponent.vue";
import MovieSearchElementComponent from "@/components/movie/MovieSearchElementComponent.vue";
import MovieSearchComponent from "@/components/movie/MovieSearchComponent.vue";
import MovieBigPictureComponent from "@/components/movie/MovieBigPictureComponent.vue";
import type { MovieExtType } from "@/types/movie.types/movie_ext.type"
import type { JwtUser } from "@/types/user.types/user_jwt.type";
import FormVal from "@/components/form/FormValComponent.vue";
import VoteButtonComponent from "@/components/movie/VoteButtonComponent.vue";
import VoteComponent from "@/components/movie/VoteComponent.vue";
import type { MovieSearchType } from "@/types/movie.types/movie_search.type";

const movies = ref([] as MovieExtType[]);
const user_id = ref(-1);
const search_movies = ref([] as MovieSearchType[]);

export default defineComponent({
  name: "HomeView",
  data() {
    return {
      store,
      search_movies,
      big_picture_imdb_id: ref(""),
      big_picture_title: ref(""),
      movie_add_with_imdb_id: ref(false),
      movies,
      user_id,
      movie_search_loading: ref(false)
    };
  },
  components: {
    VoteComponent,
    VoteButtonComponent,
    FormVal,
    MovieBigPictureComponent,
    TableComponent,
    FormComponent,
    MovieSearchComponent,
    MovieSearchElementComponent,
    WatchlistComponent,
    ModalComponent
  },
  setup() {
    call("api/movie/all")
      .then((data: MovieExtType[]) => {
        movies.value = data;
      });

    if (store.logged_in) {
      call("api/user/id")
        .then((data: JwtUser) => {
          user_id.value = data.id;
        });
    }
  },
  mounted() {
    this.$i18next.on("languageChanged", () => {
      this.get_movies_all()
    })
  },
  methods: {
    search_media(e: Event, form_html: HTMLFormElement) {
      if (this.movie_add_with_imdb_id) {
        this.add_media(e, form_html);

      } else {
        const form = new FormData(form_html);
        const search_input = form.get("movie_title") as string;
        this.movie_search_loading = true
        call("api/movie/search", "POST", { search_input })
          .then((data) => {
            search_movies.value = data;
            this.movie_search_loading = false
          });
      }
    },
    movie_search_select(imdb_id: string) {
      this.movie_add_with_imdb_id = true;
      const imdb_id_input = document.getElementById("modal_post_movie_enter_id") as HTMLInputElement
      imdb_id_input.value = imdb_id;
    },
    add_media(e: Event, form_html: HTMLFormElement) {
      const form = new FormData(form_html);
      const imdb_id = form.get("imdb_id") as string;
      this.movie_search_loading = true

      call(form_html.action + imdb_id, "POST")
        .then((data) => {
          if (!data.hasOwnProperty("statusCode")) {
            this.get_movies_all()
          }
          this.movie_search_loading = false
          form_html.setAttribute("data-bs-dismiss", "modal");
          form_html.click();
          form_html.removeAttribute("data-bs-dismiss");
        });
    },
    delete_media(imdb_id: string) {
      call("api/movie/" + imdb_id, "DELETE")
        .then((data) => {
          if (!data.hasOwnProperty("statusCode")) {
            const table = document.getElementById("table_movie") as HTMLTableElement;
            const tr = document.getElementById(imdb_id) as HTMLTableRowElement;
            table.deleteRow(tr.rowIndex);
          }
        });
    },
    get_movies_all() {
      call("api/movie/all")
        .then((data: MovieExtType[]) => {
          const child = this.$refs.filter as any
          child.loop_update = true
          movies.value = data
          setTimeout(() => {
            child.loop_update = false
          }, 5000);
        });
    }
  }
});
</script>

<style scoped>
.main {
  width: 90vw;
  margin: 20px auto;
}
</style>
