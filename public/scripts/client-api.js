let janus = null;
const gxycol = [0, 201, 203, 202];
const trllang = {
  "trl": {
    "Hebrew": 301,
    "Russian": 302,
    "English": 303,
    "French": 305,
    "Spanish": 304,
    "German": 306,
    "Italian": 307
  }
};

function janusDetach() {
  janus.pluginHandles.forEach(function(handle) {
    handle.send({ "message": { "request": "stop" } });
    handle.hangup();
  });

  janus.janus.destroy();
}

function janusConnect(error, destroy, callback, do_debug) {
  Janus.init({
    debug: false,
    callback: () => initCallback(error, destroy, callback, do_debug)
  });
}

function janusAttachVideo(bitrate, videoID) {
  if (janus.connection === false) {
    return false;
  }

  if (bitrate === 0) {
    if (janus.videostr === null) {
      return true;
    }
    janus.videostr.send({ "message": { "request": "stop" } });
    janus.videostr.hangup();
    janus.videostr = null;
  } else {
    if (videoID === 1 && janus.android)
      videoID = 801;
    if (videoID === 11 && janus.android)
      videoID = 802;
    attachStreamingHandle(bitrate, videoID, true);
  }
  return true;
}

function janusAttachAudio(lang, audioID) {
  if (janus.connection === false) {
    return false;
  }
  attachStreamingHandle(lang, audioID, false);
  return true;
}

function initCallback(error, destroy, callback, do_debug) {
  if (janus !== null && janus.connection) {
    return;
  }
  // Create session
  janus = {
    janus: new Janus({
      server: "https://str1.kab.sh/janusgxy",
      iceServers: [{ urls: ["stun:stun1.kab.sh:3478", "stun:stun2.kab.sh:3478"] }],
      success: function() {
        janus.connection = true;
        if (janus.callbackFunc) {
          janus.callbackFunc();
        }
      },
      error: function(error) {
        janus.connection = false;
        if (janus.errorHandler != null) {
          janus.errorHandler();
        }
      },
      destroyed: function() {
        janus.connection = false;
        if (janus.destroyHandler != null) {
          janus.destroyHandler();
        }
      }
    }),
    videostr: null,
    audiostr: null,
    mixaudio: null,
    galaxy: null,
    translation: null,
    pluginHandles: [],
    connection: null,
    errorHandler: error,
    destroyHandler: destroy,
    callbackFunc: callback,
    android: false,
    debug: do_debug
  };

  onunload = () => {
    janus.pluginHandles.forEach(function(handle) {
      handle.send({ "message": { "request": "stop" } });
      handle.hangup();
    });

    janus.janus.destroy();
  };
}

function attachStreamingHandle(streamId, mediaElementSelector, is_video) {
  let streaming;

  const body = { "request": "switch", "id": streamId };
  if (is_video === true) {
    if (janus.videostr !== undefined && janus.videostr !== null) {
      janus.videostr.send({ "message": body });
      return;
    }
  } else {
    //console.log("--:: "+mediaElementSelector);
    janus.mixaudio = document.getElementById(mediaElementSelector.split("#")[1]);
    if (janus.audiostr !== undefined && janus.audiostr !== null) {
      janus.audiostr.send({ "message": body });
      return;
    }
  }

  janus.janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      streaming = pluginHandle;

      // We need to remember where audio and where video handle
      if (is_video === true) {
        janus.videostr = streaming;
      } else {
        janus.audiostr = streaming;
      }

      janus.pluginHandles.push(streaming);

      // Play stream
      streaming.send({ "message": { "request": "watch", id: streamId } });
    },
    error: function(error) {
      displayError("Error attaching plugin: " + error);
    },
    onmessage: function(msg, jsep) {
      onStreamingMessage(streaming, msg, jsep);
    },
    onremotestream: function(stream) {
      if (janus.debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (janus.debug) {
        console.debug("attachStreamingHandle: Got a cleanup notification");
      }
    }
  });
}

function checkData() {
  if (localStorage.extip === json.ip)
    streamGalaxy(json.talk);
}

function streamGalaxy(st) {
  if (st) {
    janus.mixaudio.muted = true;
    attachStreamGalaxy(gxycol[json.col], janus.gxyaudio);
    attachStreamTranslation(trllang["trl"][localStorage.langtext], janus.trlaudio);
    console.log("You now talking");
  } else {
    console.log("Stop talking");
    janus.mixaudio.muted = false;
    var body = { "request": "stop" };
    janus.galaxy.send({ "message": body });
    janus.translation.send({ "message": body });
    janus.galaxy.hangup();
    janus.translation.hangup();
  }
}

function attachStreamGalaxy(streamId, mediaElementSelector) {
  janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      janus.galaxy = pluginHandle;
      janus.galaxy.send({ "message": { "request": "watch", id: streamId } });
    },
    error: function(error) {
      displayError("Error attaching plugin: " + error);
    },
    onmessage: function(msg, jsep) {
      onStreamingMessage(janus.galaxy, msg, jsep);
    },
    onremotestream: function(stream) {
      if (janus.debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (janus.debug) {
        console.debug("attachStreamGalaxy: Got a cleanup notification");
      }
    }
  });
}

function attachStreamTranslation(streamId, mediaElementSelector) {
  janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      translation = pluginHandle;
      translation.send({ "message": { "request": "watch", id: streamId } });
    },
    error: function(error) {
      displayError("Error attaching plugin: " + error);
    },
    onmessage: function(msg, jsep) {
      onStreamingMessage(translation, msg, jsep);
    },
    onremotestream: function(stream) {
      if (debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (debug) {
        console.debug("attachStreamTranslation: Got a cleanup notification");
      }
    }
  });
}

const singleLangStreams = {
  "Hebrew": 15,
  "Russian": 23,
  "English": 24,
  "Spanish": 26
};

function attachStreamingByLang(streamName, mediaElementSelector) {
  let streaming;

  janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      streaming = pluginHandle;
      janus.pluginHandles.push(streaming);

      const streamId = singleLangStreams[streamName];

      // Play stream
      streaming.send({ "message": { "request": "watch", id: streamId } });
    },
    error: function(error) {
      displayError("Error attaching plugin: " + error);
    },
    onmessage: function(msg, jsep) {
      onStreamingMessage(streaming, msg, jsep);
    },
    ondataopen: function(data) {
      console.log("The DataChannel is available!");
    },
    ondata: function(data) {
      console.log("We got data from the DataChannel! " + data);
    },
    onremotestream: function(stream) {
      if (janus.debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (janus.debug) {
        console.debug("attachStreamingByLang: Got a cleanup notification");
      }
    }
  });
}

function onStreamingMessage(handle, msg, jsep) {
  if (janus.debug) {
    console.debug("Got a message", msg);
  }

  if (jsep !== undefined && jsep !== null) {
    if (janus.debug) {
      console.debug("Handling SDP as well...", jsep);
    }

    // Answer
    handle.createAnswer({
      jsep,
      media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
      success: function(jsep) {
        if (janus.debug) {
          console.log("Got SDP!");
          console.log(jsep);
        }
        handle.send({ message: { request: "start" }, jsep });
      },
      error: function(error) {
        displayError("WebRTC error: " + error);
      }
    });
  }
}

function displayError(errorMessage) {
  if (janus.debug) {
    console.error(errorMessage);
  }
}

function getBitrates() {
  return {
    11: "240p",
    1: "360p",
    16: "720p"
  };
}

function getLanguages() {
  return {
    "Workshop": {
      2: "Hebrew",
      3: "Russian",
      4: "English",
      5: "French",
      6: "Spanish",
      7: "German",
      8: "Italian"
    },
    "Source": {
      15: "Hebrew",
      23: "Russian",
      24: "English",
      25: "French",
      26: "Spanish",
      27: "German",
      28: "Italian",
      41: "Portuguese",
      42: "Turkish",
      43: "Bulgarian",
      44: "Georgian",
      45: "Romanian",
      46: "Hungarian",
      47: "Swedish",
      48: "Lithuanian",
      49: "Croatian",
      50: "Japanese",
      51: "Slovenian",
      52: "Polish",
      53: "Norwegian",
      54: "Latvian",
      55: "Ukrainian",
      56: "Nederland",
      57: "China",
      58: "Amharic",
      59: "Hindi",
      60: "Persian",
      62: "Arabic",
      63: "Indonesian"
    },
    "Special": {
      10: "Heb-Rus",
      17: "Heb-Eng"
    }
  };
}
