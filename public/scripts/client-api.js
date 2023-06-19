let janus = null;
let videostr;
let audiostr;
let mixaudio;
let galaxy;
let translation;
let srv;
let pluginHandles = [];
let connection = null;
let errorHandler = null;
let destroyHandler = null;
let android = false;
let debug = true;
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


let callbackFunc = null;

function janusConnect(error, destroy, callback, do_debug) {
  errorHandler = error;
  destroyHandler = destroy;
  callbackFunc = callback;
  debug = do_debug;

  srv = "https://str1.kab.sh/janusgxy";

  Janus.init({
    debug: false,
    callback: initCallback
  });

  return connection;
}

function janusAttachVideo(bitrate, videoID) {
  if (connection === false) {
    return false;
  }

  if (bitrate === 0) {
    if (videostr === null) {
      return true;
    }
    videostr.send({ "message": { "request": "stop" } });
    videostr.hangup();
    videostr = null;
  } else {
    if (videoID === 1 && android)
      videoID = 801;
    if (videoID === 11 && android)
      videoID = 802;
    attachStreamingHandle(bitrate, videoID, true);
  }
  return true;
}

function janusAttachAudio(lang, audioID) {
  if (connection === false) {
    return false;
  }
  attachStreamingHandle(lang, audioID, false);
  return true;
}

function initCallback() {
  // Create session
  janus = new Janus({
    server: srv,
    iceServers: [{ urls: ["stun:stun1.kab.sh:3478", "stun:stun2.kab.sh:3478"] }],
    success: function() {
      connection = true;
      if (callbackFunc) {
        callbackFunc();
      }
    },
    error: function(error) {
      connection = false;
      if (errorHandler != null) {
        errorHandler();
      }
    },
    destroyed: function() {
      connection = false;
      if (destroyHandler != null) {
        destroyHandler();
      }
    }
  });

  onunload = () => {
    pluginHandles.forEach(function(handle) {
      handle.send({ "message": { "request": "stop" } });
      handle.hangup();
    });

    janus.destroy();
  };
}

function attachStreamingHandle(streamId, mediaElementSelector, is_video) {
  let streaming;

  const body = { "request": "switch", "id": streamId };
  if (is_video === true) {
    if (videostr !== undefined && videostr !== null) {
      videostr.send({ "message": body });
      return;
    }
  } else {
    //console.log("--:: "+mediaElementSelector);
    mixaudio = document.getElementById(mediaElementSelector.split("#")[1]);
    if (audiostr !== undefined && audiostr !== null) {
      audiostr.send({ "message": body });
      return;
    }
  }

  janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      streaming = pluginHandle;

      // We need to remember where audio and where video handle
      if (is_video === true) {
        videostr = streaming;
      } else {
        audiostr = streaming;
      }

      pluginHandles.push(streaming);

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
      if (debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (debug) {
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
    mixaudio.muted = true;
    attachStreamGalaxy(gxycol[json.col], gxyaudio);
    attachStreamTranslation(trllang["trl"][localStorage.langtext], trlaudio);
    console.log("You now talking");
  } else {
    console.log("Stop talking");
    mixaudio.muted = false;
    var body = { "request": "stop" };
    galaxy.send({ "message": body });
    translation.send({ "message": body });
    galaxy.hangup();
    translation.hangup();
  }
}

function attachStreamGalaxy(streamId, mediaElementSelector) {
  janus.attach({
    plugin: "janus.plugin.streaming",
    success: function(pluginHandle) {
      galaxy = pluginHandle;
      galaxy.send({ "message": { "request": "watch", id: streamId } });
    },
    error: function(error) {
      displayError("Error attaching plugin: " + error);
    },
    onmessage: function(msg, jsep) {
      onStreamingMessage(galaxy, msg, jsep);
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
      pluginHandles.push(streaming);

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
      if (debug) {
        console.debug("Got a remote stream!", stream);
      }
      const elem = document.getElementById(mediaElementSelector.split("#")[1]);
      Janus.attachMediaStream(elem, stream);
    },
    oncleanup: function() {
      if (debug) {
        console.debug("attachStreamingByLang: Got a cleanup notification");
      }
    }
  });
}

function onStreamingMessage(handle, msg, jsep) {
  if (debug) {
    console.debug("Got a message", msg);
  }

  if (jsep !== undefined && jsep !== null) {
    if (debug) {
      console.debug("Handling SDP as well...", jsep);
    }

    // Answer
    handle.createAnswer({
      jsep,
      media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
      success: function(jsep) {
        if (debug) {
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
  if (debug) {
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
