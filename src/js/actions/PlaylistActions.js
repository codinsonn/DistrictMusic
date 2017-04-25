import dispatcher from '../dispatcher';

export function showSearchModal() {
  dispatcher.dispatch({
    type: `SHOW_SEARCH_MODAL`
  });
}

export function hideSearchModal() {
  dispatcher.dispatch({
    type: `HIDE_SEARCH_MODAL`
  });
}

export function showSuggestionDetail(data) {
  dispatcher.dispatch({
    type: `SHOW_SUGGESTION_DETAIL`,
    data: data
  });
}

export function hideSuggestionDetail() {
  dispatcher.dispatch({
    type: `HIDE_SUGGESTION_DETAIL`
  });
}

export function resetSearchbar() {
  dispatcher.dispatch({
    type: `RESET_SEARCH_BAR`
  });
}

export function updateQueue() {
  dispatcher.dispatch({
    type: `UPDATE_QUEUE`
  });
}

export function pausePlay() {
  console.log(`About to pause play`);
  dispatcher.dispatch({
    type: `PAUSE_PLAY`
  });
}

export function setSong(song) {
  dispatcher.dispatch({
    type: `SET_USER_CHOSEN_SONG`,
    data: song
  });
}

export function setAudioPos(audioPos, sendSocketEvent, posUpdatedDate) {
  dispatcher.dispatch({
    type: `SET_AUDIO_POS`,
    audioPos: audioPos,
    sendSocketEvent: sendSocketEvent,
    posUpdatedDate: posUpdatedDate
  });
}

export function setVideoPos(videoPos) {
  dispatcher.dispatch({
    type: `SET_VIDEO_POS`,
    data: videoPos
  });
}

export function endSongAndPlayNext(song) {
  dispatcher.dispatch({
    type: `END_SONG_AND_PLAY_NEXT`,
    data: song
  });
}

export function startNextSongUnsynched(songId) {
  dispatcher.dispatch({
    type: `START_NEXT_SONG_UNSYNCHED`,
    data: songId
  });
}

export function startPrevSongUnsynched(songId) {
  dispatcher.dispatch({
    type: `START_PREV_SONG_UNSYNCHED`,
    data: songId
  });
}

export function setPlayMode(playMode) {
  dispatcher.dispatch({
    type: `SET_PLAY_MODE`,
    data: playMode
  });
}

export function setVideoMode(videoMode) {
  dispatcher.dispatch({
    type: `SET_VIDEO_MODE`,
    data: videoMode
  });
}
