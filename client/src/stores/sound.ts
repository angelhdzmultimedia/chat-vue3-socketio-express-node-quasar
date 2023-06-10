import { ref } from 'vue'
import { defineStore } from 'pinia'

const soundsTypes = [] as const
type SoundType = typeof soundsTypes[number]

export const useSoundStore = defineStore('sound', () => {
  const _sounds = ref({})

  function add(sounds) {
    for (const key in sounds) {
      const audio = new Audio(sounds[key])
      audio.autoplay = false
      _sounds.value[key] = {
        url: sounds[key],
        audio,
        name: key,
      }
    }
  }

  add({
    broadcast:
      'https://cdn.freesound.org/sounds/592/592772-d7edabc2-8571-411b-805b-672e6d859041?filename=592772__sunart1__message-sound.wav',
    userJoined: '/media/sounds/DoorBell.mp3',
    userLeft:
      'https://cdn.freesound.org/sounds/257/257046-d8fee741-cddc-493d-8591-1ce8668a4ef4?filename=257046__jagadamba__running.wav',
  })

  function play(name: string) {
    _sounds.value[name].audio.play()
  }

  return {
    add,
    play,
  }
})
