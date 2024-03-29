<template>
  <CardComponent v-if="watchlist.length > 0" id="watchlist" header="Watchlist">
    <TableComponent id="table_watchlist" :head="['', $t('movie.start'), $t('movie.title'), $t('movie.interested')]">
      <tr v-for="movie in watchlist">
        <td>
          <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#watchlist_modal_big_picture"
                  @click="big_picture_imdb_id = movie.imdb_id;big_picture_title = movie.title">
            <img src="../assets/svg/info-circle-fill.svg" alt="big_picture">
          </button>
        </td>
        <td>{{ (new Date(movie.start_time)).toLocaleString() }}</td>
        <td><a :href="movie.link" target="_blank">{{ movie.title }}</a></td>
        <td class="d-flex flex-row justify-content-center">
          <VoteComponent :imdb_id="movie.imdb_id" class="me-2"/>
          <button class="btn btn-primary" @click="interested(movie.interested)"
                  data-bs-target="#modal_watchlist" data-bs-toggle="modal">
            <img src="../assets/svg/person-hearts.svg" alt="Heart" />
          </button>
        </td>
      </tr>
    </TableComponent>
  </CardComponent>

  <ModalComponent id="modal_watchlist" :title="$t('movie.interested')">
    <TableComponent id="table_watchlist_interested" :head="[$t('profile.avatar.title'), $t('common.form.name.label')]"
                    sortable>
      <tr v-for="user in interested_local">
        <td :title="user.name">
          <img v-if="user.use_gravatar" :src="user.gravatar_url" alt="avatar" class="profile" />
          <img v-else src="../assets/img/Portrait_Placeholder.png" alt="placeholder_avatar" class="profile" />
        </td>
        <td :title="user.name">{{ user.name }}</td>
      </tr>
    </TableComponent>
  </ModalComponent>

  <ModalComponent id="watchlist_modal_big_picture" class="modal-lg" :title="big_picture_title">
    <MovieBigPictureComponent :imdb_id="big_picture_imdb_id" />
  </ModalComponent>
</template>

<script lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import TableComponent from "@/components/TableComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import { call } from "@/util/api";
import { defineComponent, ref } from "vue";
import type { WatchlistExtType } from "@/types/movie.types/watchlist_ext.type";
import MovieBigPictureComponent from "@/components/movie/MovieBigPictureComponent.vue";
import VoteComponent from "@/components/movie/VoteComponent.vue";

const interested_local = ref([] as any);

export default defineComponent({
  name: "WatchlistComponent",
  components: { VoteComponent, MovieBigPictureComponent, TableComponent, CardComponent, ModalComponent },
  data() {
    return {
      interested_local: interested_local,
      big_picture_imdb_id: ref(""),
      big_picture_title: ref("")
    };
  },
  setup() {
    const watchlist = ref([] as WatchlistExtType[]);
    call("/api/movie/watchlist")
      .then((data: WatchlistExtType[]) => {
        watchlist.value = data;
      });

    return {
      watchlist
    };
  },
  methods: {
    interested(user_ids: number[]) {
      interested_local.value = [];
      for (const user_id of user_ids) {
        call(`/api/user/${user_id}`)
          .then((data) => {
            interested_local.value.push(data);
          });
      }
    }
  }
});
</script>

<style scoped>
#watchlist {
  width: min(90vw, 800px);
  margin: 20px auto;
}

#modal_watchlist {
  font-size: larger;
}

.profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>