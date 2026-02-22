
let soundSettings = {
  drawing: 'https://actions.google.com/sounds/v1/science_fiction/stinger.ogg',
  winGrand: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3',
  winSmall: 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3',
  winNormal: 'https://assets.mixkit.co/active_storage/sfx/2060/2060-preview.mp3'
};

export const updateSoundUrls = (urls: Partial<typeof soundSettings>) => {
  soundSettings = { ...soundSettings, ...urls };
};

export const playSound = (type: keyof typeof soundSettings) => {
  try {
    const audio = new Audio(soundSettings[type]);
    audio.play().catch(e => {
      console.warn("Audio play blocked or URL invalid. User interaction required.", e);
    });
  } catch (err) {
    console.error("Audio playback error", err);
  }
};
